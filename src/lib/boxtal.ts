// ============================================================
// POWER EXHAUST — Service Boxtal (expédition colis)
// ============================================================
// OAuth2 client_credentials + création d'envoi + récupération label
//
// Documentation Boxtal : https://developer.boxtal.com/
// Sandbox  : https://test.api.boxtal.com
// Production: https://api.boxtal.com
// ============================================================

const BOXTAL_BASE =
  process.env.BOXTAL_ENV === "production"
    ? "https://api.boxtal.com"
    : "https://test.api.boxtal.com";

// ─── Cache du token OAuth2 ────────────────────────────────────────────────────
let tokenCache: { token: string; expiresAt: number } | null = null;

// ─── Erreur typée ─────────────────────────────────────────────────────────────
export class BoxtalError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly boxtalCode?: string
  ) {
    super(message);
    this.name = "BoxtalError";
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BoxtalAddress {
  firstName: string;
  lastName: string;
  company?: string;
  street1: string;
  city: string;
  postCode: string;
  country: string; // ISO 3166-1 alpha-2, ex: "FR"
  email: string;
  mobile: string;
}

export interface BoxtalParcel {
  weight: number; // kg
  length: number; // cm
  width: number;  // cm
  height: number; // cm
}

export interface BoxtalShipmentResult {
  reference: string; // référence Boxtal de la commande
}

// ─── OAuth2 — Obtenir / renouveler le token ───────────────────────────────────
async function getAccessToken(): Promise<string> {
  // Retourne le token en cache s'il est encore valide (marge de 60 s)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const clientId = process.env.BOXTAL_CLIENT_ID;
  const clientSecret = process.env.BOXTAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new BoxtalError(
      "Identifiants Boxtal manquants — configurez BOXTAL_CLIENT_ID et BOXTAL_CLIENT_SECRET dans .env"
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${BOXTAL_BASE}/api/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    // Timeout implicite via les délais Next.js
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new BoxtalError(
      `Authentification Boxtal échouée (HTTP ${res.status}) : ${body}`,
      res.status
    );
  }

  const json = await res.json();
  tokenCache = {
    token: json.access_token as string,
    expiresAt: Date.now() + (json.expires_in as number) * 1_000,
  };

  return tokenCache.token;
}

// ─── Adresse destinataire (point relais La Poste) ────────────────────────────
// L'adresse réelle de l'entreprise n'est jamais exposée côté client.
// Seul le point relais est communiqué au client.
function getRelayAddress(): BoxtalAddress & { relayId?: string } {
  return {
    firstName: process.env.BOXTAL_DEST_FIRSTNAME ?? "Rodrigue",
    lastName:  process.env.BOXTAL_DEST_LASTNAME  ?? "BOISDUR-SALBRIS",
    company:   process.env.BOXTAL_DEST_COMPANY   ?? "POWER EXHAUST",
    street1:   process.env.BOXTAL_DEST_STREET    ?? "PLACE HENRI BARBUSSE",
    city:      process.env.BOXTAL_DEST_CITY      ?? "Villeparisis",
    postCode:  process.env.BOXTAL_DEST_POSTCODE  ?? "77270",
    country:   "FR",
    email:     process.env.BOXTAL_DEST_EMAIL     ?? "contact@power-exhaust.com",
    mobile:    process.env.BOXTAL_DEST_PHONE     ?? "",
    // ID du point relais Boxtal (requis pour les envois en point relais La Poste)
    ...(process.env.BOXTAL_RELAY_ID ? { relayId: process.env.BOXTAL_RELAY_ID } : {}),
  };
}

// ─── Créer une expédition ─────────────────────────────────────────────────────
/**
 * Crée une commande d'expédition Boxtal.
 * L'expéditeur est le client, le destinataire est POWER EXHAUST.
 */
export async function createShipment(
  sender: BoxtalAddress,
  parcel: BoxtalParcel
): Promise<BoxtalShipmentResult> {
  const token = await getAccessToken();
  const { relayId, ...recipient } = getRelayAddress();

  const operatorCode = process.env.BOXTAL_SERVICE_OPERATOR ?? "LAPO";
  const serviceCode  = process.env.BOXTAL_SERVICE_CODE     ?? "4";

  const payload = {
    sender,
    recipient,
    ...(relayId ? { relay: { id: relayId } } : {}),
    parcel,
    service: {
      operatorCode,
      serviceCode,
    },
    shipment: {
      contentDescription: "Ligne d'echappement moto",
      contentValue: 500,
      insuranceAmount: 500,
    },
  };

  const res = await fetch(`${BOXTAL_BASE}/api/v1/parcel/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ message: "Erreur inconnue" }));
    const rawMsg = errBody?.message ?? errBody?.error ?? JSON.stringify(errBody);
    throw new BoxtalError(
      mapBoxtalError(rawMsg),
      res.status,
      errBody?.code
    );
  }

  const data = await res.json();

  // Boxtal peut renvoyer la référence sous différentes clés selon les versions
  const reference =
    data.reference ?? data.orderReference ?? data.id ?? data.parcel_id;

  if (!reference) {
    throw new BoxtalError("Référence Boxtal manquante dans la réponse");
  }

  return { reference: String(reference) };
}

// ─── Récupérer l'étiquette PDF ────────────────────────────────────────────────
/**
 * Télécharge l'étiquette d'expédition au format PDF.
 * Retourne un ArrayBuffer brut (pour être streamé via NextResponse).
 */
export async function fetchLabel(boxtralRef: string): Promise<ArrayBuffer> {
  const token = await getAccessToken();

  const res = await fetch(
    `${BOXTAL_BASE}/api/v1/parcel/${encodeURIComponent(boxtralRef)}/label`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new BoxtalError(
      `Impossible de récupérer l'étiquette Boxtal (HTTP ${res.status})`,
      res.status
    );
  }

  return res.arrayBuffer();
}

// ─── Mapping des codes d'erreur Boxtal → messages FR ─────────────────────────
function mapBoxtalError(raw: string): string {
  const upper = raw.toUpperCase();

  const patterns: [string, string][] = [
    ["INVALID_ADDRESS",          "Adresse invalide — vérifiez le numéro, la rue et le code postal."],
    ["ADDRESS_NOT_FOUND",        "Adresse introuvable par le transporteur. Vérifiez la ville et le code postal."],
    ["SUSPENDED_CONTRACT",       "Contrat transporteur suspendu — contactez le support Boxtal."],
    ["SERVICE_UNAVAILABLE",      "Service de transport indisponible pour cette destination."],
    ["WEIGHT_EXCEEDS",           "Le poids du colis dépasse la limite autorisée par le transporteur."],
    ["DIMENSIONS_EXCEEDS",       "Les dimensions du colis dépassent les limites autorisées."],
    ["INSUFFICIENT_FUNDS",       "Solde insuffisant sur le compte Boxtal."],
    ["INVALID_CREDENTIALS",      "Identifiants Boxtal invalides — vérifiez BOXTAL_CLIENT_ID et BOXTAL_CLIENT_SECRET."],
    ["UNAUTHORIZED",             "Accès non autorisé à l'API Boxtal."],
    ["PARCEL_NOT_FOUND",         "Envoi introuvable dans Boxtal."],
  ];

  for (const [key, label] of patterns) {
    if (upper.includes(key)) return label;
  }

  return `Erreur Boxtal : ${raw}`;
}
