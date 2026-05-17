/**
 * Service d'envoi d'emails — Power Exhaust
 * Utilise Nodemailer (SMTP configurable via .env)
 */
import nodemailer from "nodemailer";

// ─── Transporter ─────────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASS ?? "",
    },
  });
}

const FROM = process.env.SMTP_FROM ?? "Power Exhaust <noreply@power-exhaust.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "contact@power-exhaust.com";
const APP_URL = process.env.NEXTAUTH_URL ?? "https://power-exhaust.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function etatLabel(etat: string): string {
  const map: Record<string, string> = {
    EXCELLENT: "Neuf / Excellent",
    BON: "Bon état",
    MOYEN: "État moyen",
    MAUVAIS: "Mauvais état",
  };
  return map[etat] ?? etat;
}

function emailWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:system-ui,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161616;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#ff6b00,#ff8c00);padding:32px 36px;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">🔥 Power Exhaust</p>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Rachat de lignes d'échappement moto</p>
        </td>
      </tr>
      <!-- Body -->
      <tr><td style="padding:36px;">
        ${body}
      </td></tr>
      <!-- Footer -->
      <tr>
        <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:12px;color:#555;text-align:center;">
            Power Exhaust · PLACE HENRI BARBUSSE · 77270 Villeparisis<br/>
            <a href="mailto:contact@power-exhaust.com" style="color:#ff6b00;text-decoration:none;">contact@power-exhaust.com</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RachatEmailData {
  id: string;
  reference: string;
  // Token sécurisé pour validation/refus par email
  adminToken: string;
  // Token pour upload pièce d'identité (R321-3 CSI)
  identiteToken?: string | null;
  // Vendeur
  prenomVendeur: string;
  nomVendeur: string;
  emailVendeur: string;
  telVendeur: string;
  adresseVendeur: string;
  villeVendeur: string;
  codePostalVendeur: string;
  // Ligne
  typeEchappement: string | null;
  etatEchappement: string;
  description?: string | null;
  // Moto
  marque: string;
  modele: string;
  annee?: number | null;
  kilometrage?: number | null;
  // Expédition
  poidsKg?: number | null;
  // Prix
  prixOfficiel?: number | null;
  // Signature + photos (base64 ou JSON stringifié)
  signatureVendeur?:    string | null;
  signatureVendeurAt?:  Date | string | null;
  signatureVendeurIp?:  string | null;
  signatureVendeurUa?:  string | null;
  photos?: string | null;
}

// ─── 1. Email Admin — dossier complet ─────────────────────────────────────────

export async function sendAdminDossierEmail(rachat: RachatEmailData): Promise<void> {
  const validerUrl = `${APP_URL}/api/rachat/${rachat.id}/valider?token=${rachat.adminToken}`;
  const refuserUrl  = `${APP_URL}/api/rachat/${rachat.id}/refuser?token=${rachat.adminToken}`;
  const dashboardUrl = `${APP_URL}/rachats/${rachat.id}`;

  // Parse photos
  let photos: string[] = [];
  try {
    if (rachat.photos) photos = JSON.parse(rachat.photos) as string[];
  } catch { /* ignore */ }

  // Inline images CID list
  const photoCids = photos.map((_, i) => `photo_${i}`);

  const photosHtml = photos.length > 0
    ? `<table cellpadding="0" cellspacing="0" style="margin-top:12px;">
        <tr>
          ${photos.map((_, i) => `<td style="padding:0 4px 0 0;"><img src="cid:${photoCids[i]}" alt="Photo ${i+1}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,0.1);" /></td>`).join("")}
        </tr>
      </table>`
    : `<p style="color:#666;font-size:13px;margin:8px 0 0;">Aucune photo fournie.</p>`;

  const signatureHtml = rachat.signatureVendeur
    ? `<img src="cid:signature_vendeur" alt="Signature vendeur" style="max-width:280px;background:#fff;border-radius:8px;padding:8px;border:1px solid rgba(255,255,255,0.1);" />`
    : `<p style="color:#666;font-size:13px;">Non fournie</p>`;

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:900;color:#fff;">Nouvelle demande de rachat</h2>
    <p style="margin:0 0 24px;color:#888;font-size:14px;">Référence : <strong style="color:#ff6b00;font-family:monospace;">${rachat.reference}</strong></p>

    <!-- Vendeur -->
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Vendeur</p>
      <p style="margin:0 0 4px;color:#fff;font-weight:700;font-size:16px;">${rachat.prenomVendeur} ${rachat.nomVendeur}</p>
      <p style="margin:0 0 2px;color:#aaa;font-size:14px;">📧 <a href="mailto:${rachat.emailVendeur}" style="color:#ff6b00;">${rachat.emailVendeur}</a></p>
      <p style="margin:0 0 2px;color:#aaa;font-size:14px;">📞 ${rachat.telVendeur || "Non renseigné"}</p>
      <p style="margin:0;color:#aaa;font-size:14px;">📍 ${rachat.adresseVendeur}, ${rachat.codePostalVendeur} ${rachat.villeVendeur}</p>
    </div>

    <!-- Ligne + Moto -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
      <tr>
        <td width="50%" style="padding-right:8px;vertical-align:top;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Ligne d'échappement</p>
            <p style="margin:0 0 4px;color:#fff;font-weight:700;">${rachat.typeEchappement}</p>
            <p style="margin:0 0 4px;color:#aaa;font-size:13px;">État : <strong style="color:#fff;">${etatLabel(rachat.etatEchappement)}</strong></p>
            ${rachat.prixOfficiel ? `<p style="margin:8px 0 0;"><span style="background:#ff6b00;color:#fff;font-weight:700;font-size:14px;padding:3px 10px;border-radius:20px;">Estimé : ${rachat.prixOfficiel} €</span></p>` : ""}
          </div>
        </td>
        <td width="50%" style="padding-left:8px;vertical-align:top;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Véhicule</p>
            <p style="margin:0 0 4px;color:#fff;font-weight:700;">${rachat.marque} ${rachat.modele}</p>
            ${rachat.annee ? `<p style="margin:0 0 2px;color:#aaa;font-size:13px;">Année : ${rachat.annee}</p>` : ""}
            ${rachat.kilometrage ? `<p style="margin:0;color:#aaa;font-size:13px;">${rachat.kilometrage.toLocaleString("fr-FR")} km</p>` : ""}
            ${rachat.poidsKg ? `<p style="margin:4px 0 0;color:#aaa;font-size:13px;">Colis : ~${rachat.poidsKg} kg</p>` : ""}
          </div>
        </td>
      </tr>
    </table>

    ${rachat.description ? `
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Commentaire vendeur</p>
      <p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${rachat.description}</p>
    </div>` : ""}

    <!-- Photos -->
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Photos (${photos.length})</p>
      ${photosHtml}
    </div>

    <!-- Signature -->
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Signature du vendeur</p>
      ${signatureHtml}
      <table style="margin-top:12px;width:100%;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:11px;color:#555;padding:2px 0;">🕐 Horodatage :</td>
          <td style="font-size:11px;color:#888;padding:2px 0 2px 8px;">${rachat.signatureVendeurAt ? new Date(rachat.signatureVendeurAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) + " (Europe/Paris)" : "—"}</td>
        </tr>
        <tr>
          <td style="font-size:11px;color:#555;padding:2px 0;">🌐 Adresse IP :</td>
          <td style="font-size:11px;color:#888;padding:2px 0 2px 8px;">${rachat.signatureVendeurIp ?? "—"}</td>
        </tr>
        <tr>
          <td style="font-size:11px;color:#555;padding:2px 0;">💻 Navigateur :</td>
          <td style="font-size:11px;color:#888;padding:2px 0 2px 8px;">${(rachat.signatureVendeurUa ?? "—").slice(0, 80)}</td>
        </tr>
      </table>
    </div>

    <!-- Actions -->
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding-right:8px;">
          <a href="${validerUrl}" style="display:inline-block;background:#22c55e;color:#fff;font-weight:900;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">✅ Valider &amp; envoyer bordereau</a>
        </td>
        <td align="center" style="padding-left:8px;">
          <a href="${refuserUrl}" style="display:inline-block;background:#ef4444;color:#fff;font-weight:900;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">❌ Refuser la demande</a>
        </td>
      </tr>
    </table>
    <p style="text-align:center;margin:16px 0 0;">
      <a href="${dashboardUrl}" style="color:#666;font-size:12px;text-decoration:none;">Voir le dossier complet dans le dashboard →</a>
    </p>
  `;

  // Build attachments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attachments: any[] = [];

  photos.forEach((dataUrl, i) => {
    const [header, data] = dataUrl.split(",");
    const mime = header.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
    const ext  = mime.split("/")[1] ?? "jpg";
    attachments.push({
      filename: `photo_${i + 1}.${ext}`,
      content: Buffer.from(data, "base64"),
      contentType: mime,
      cid: `photo_${i}`,
    });
  });

  if (rachat.signatureVendeur) {
    const [, data] = rachat.signatureVendeur.split(",");
    attachments.push({
      filename: "signature.png",
      content: Buffer.from(data, "base64"),
      contentType: "image/png",
      cid: "signature_vendeur",
    });
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from:    FROM,
    to:      ADMIN_EMAIL,
    subject: `[Power Exhaust] Nouvelle demande de rachat — ${rachat.prenomVendeur} ${rachat.nomVendeur} · ${rachat.typeEchappement}`,
    html:    emailWrapper("Nouvelle demande de rachat", body),
    attachments,
  });
}

// ─── 2. Email Client — confirmation de réception ──────────────────────────────

export async function sendClientConfirmationEmail(rachat: RachatEmailData): Promise<void> {
  const body = `
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#fff;">Demande bien reçue ! 🎉</h2>
    <p style="margin:0 0 28px;color:#888;font-size:15px;">Votre dossier a été transmis à notre équipe.</p>

    <div style="background:rgba(255,107,0,0.1);border:1px solid rgba(255,107,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#ff6b00;text-transform:uppercase;letter-spacing:1px;">Votre référence de suivi</p>
      <p style="margin:0;font-size:28px;font-weight:900;color:#fff;font-family:monospace;">${rachat.reference}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#888;">Utilisez ce numéro pour suivre votre dossier en temps réel</p>
      <a href="${APP_URL}/suivi?ref=${encodeURIComponent(rachat.reference)}"
         style="display:inline-block;margin-top:14px;background:#ff6b00;color:#fff;font-weight:700;font-size:13px;padding:10px 24px;border-radius:8px;text-decoration:none;">
        Suivre mon dossier →
      </a>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Récapitulatif</p>
      <p style="margin:0 0 4px;color:#ccc;font-size:14px;">📦 <strong style="color:#fff;">${rachat.typeEchappement}</strong> — ${etatLabel(rachat.etatEchappement)}</p>
      <p style="margin:0 0 4px;color:#ccc;font-size:14px;">🏍️ ${rachat.marque} ${rachat.modele}</p>
      ${rachat.prixOfficiel ? `<p style="margin:10px 0 0;font-size:15px;color:#fff;">Estimation : <strong style="color:#ff6b00;">${rachat.prixOfficiel} €</strong> <span style="color:#666;font-size:12px;">(offre finale confirmée après réception)</span></p>` : ""}
    </div>

    <!-- Disclaimer -->
    <div style="background:rgba(255,193,7,0.08);border:1px solid rgba(255,193,7,0.2);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#d4a017;line-height:1.6;">
        ⚠️ <strong>Important :</strong> En cas d'annulation ou de refus par nos équipes, le document signé sera invalidé et n'aura aucune valeur juridique.
        Le bordereau d'expédition vous sera envoyé <strong>uniquement après validation</strong> de votre dossier par notre équipe.
      </p>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;">
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">Prochaines étapes</p>
      ${[
        { n:"1", txt:"Notre équipe analyse votre dossier (photos, état déclaré, signature)." },
        { n:"2", txt:"Si votre demande est validée, vous recevrez par email votre bordereau d'expédition Colissimo." },
        { n:"3", txt:"Après réception et contrôle de la pièce, le virement est effectué sous 48h." },
      ].map(s => `
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
          <span style="min-width:24px;height:24px;background:#ff6b00;color:#fff;font-weight:700;font-size:12px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">${s.n}</span>
          <p style="margin:0;color:#aaa;font-size:13px;line-height:1.5;">${s.txt}</p>
        </div>
      `).join("")}
    </div>

    ${rachat.identiteToken ? `
    <!-- CTA pièce d'identité R321-3 CSI -->
    <div style="background:rgba(255,107,0,0.08);border:2px solid rgba(255,107,0,0.4);border-radius:14px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 6px;font-size:18px;">🪪</p>
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#fff;">Envoyez votre pièce d'identité</p>
      <p style="margin:0 0 16px;font-size:13px;color:#aaa;line-height:1.6;">
        Conformément à l'article R321-3 du Code de la Sécurité Intérieure, nous devons vérifier votre identité avant de procéder au paiement.<br/>
        Vos données sont <strong style="color:#fff;">chiffrées</strong> et <strong style="color:#fff;">supprimées automatiquement après 30 jours</strong>.
      </p>
      <a href="${APP_URL}/identite/${rachat.id}?token=${rachat.identiteToken}"
         style="display:inline-block;background:#ff6b00;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
        Envoyer ma pièce d'identité →
      </a>
      <p style="margin:12px 0 0;font-size:11px;color:#555;">
        Lien sécurisé à usage unique · RGPD conforme
      </p>
    </div>
    ` : ""}

    <p style="margin:24px 0 0;text-align:center;color:#555;font-size:13px;">
      Une question ? <a href="mailto:contact@power-exhaust.com" style="color:#ff6b00;text-decoration:none;">contact@power-exhaust.com</a>
    </p>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from:    FROM,
    to:      rachat.emailVendeur,
    subject: `[Power Exhaust] Demande reçue — Réf. ${rachat.reference}`,
    html:    emailWrapper("Demande de rachat reçue", body),
  });
}

// ─── 3. Email Client — dossier validé + bordereau ─────────────────────────────

export async function sendClientValidationEmail(
  rachat: RachatEmailData,
  bordereauBuffer: ArrayBuffer
): Promise<void> {
  const body = `
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#fff;">Dossier validé ! 🚀</h2>
    <p style="margin:0 0 28px;color:#888;font-size:15px;">Votre bordereau d'expédition est prêt.</p>

    <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#22c55e;">✅ Votre demande a été validée</p>
      <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;">
        Votre bordereau Colissimo est joint à cet email (fichier PDF). Imprimez-le et collez-le sur votre colis avant de le déposer dans un bureau de La Poste.
      </p>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Votre dossier</p>
      <p style="margin:0 0 4px;color:#ccc;font-size:14px;">📦 ${rachat.typeEchappement} — ${etatLabel(rachat.etatEchappement)}</p>
      <p style="margin:0 0 4px;color:#ccc;font-size:14px;">🏍️ ${rachat.marque} ${rachat.modele}</p>
      <p style="margin:4px 0 0;font-family:monospace;color:#ff6b00;font-size:13px;">Réf. ${rachat.reference}</p>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#fff;">Instructions d'expédition</p>
      ${[
        { n:"1", txt:"<strong>Ouvrez le fichier PDF</strong> joint à cet email et imprimez-le." },
        { n:"2", txt:"<strong>Collez l'étiquette</strong> bien visible sur votre colis soigneusement emballé." },
        { n:"3", txt:"<strong>Déposez le colis</strong> dans n'importe quel bureau de La Poste. L'envoi est entièrement à notre charge." },
        { n:"4", txt:"<strong>Paiement sous 48h</strong> après réception et vérification de la pièce." },
      ].map(s => `
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
          <span style="min-width:24px;height:24px;background:#ff6b00;color:#fff;font-weight:700;font-size:12px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">${s.n}</span>
          <p style="margin:0;color:#aaa;font-size:13px;line-height:1.5;">${s.txt}</p>
        </div>
      `).join("")}
    </div>

    <p style="margin:0;text-align:center;color:#555;font-size:13px;">
      Des questions ? <a href="mailto:contact@power-exhaust.com" style="color:#ff6b00;text-decoration:none;">contact@power-exhaust.com</a>
    </p>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from:    FROM,
    to:      rachat.emailVendeur,
    subject: `[Power Exhaust] Dossier validé — Votre bordereau d'expédition · Réf. ${rachat.reference}`,
    html:    emailWrapper("Dossier validé", body),
    attachments: [
      {
        filename:    `bordereau-${rachat.reference}.pdf`,
        content:     Buffer.from(bordereauBuffer),
        contentType: "application/pdf",
      },
    ],
  });
}

// ─── 4. Email Client — dossier refusé ─────────────────────────────────────────

export async function sendClientRejectionEmail(
  rachat: RachatEmailData,
  motif?: string
): Promise<void> {
  const body = `
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#fff;">Demande non retenue</h2>
    <p style="margin:0 0 28px;color:#888;font-size:15px;">Réf. <span style="color:#ff6b00;font-family:monospace;">${rachat.reference}</span></p>

    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#ef4444;">❌ Votre demande n'a pas été validée</p>
      <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;">
        Suite à l'analyse de votre dossier (${rachat.typeEchappement} — ${etatLabel(rachat.etatEchappement)}, ${rachat.marque} ${rachat.modele}), notre équipe n'est pas en mesure de procéder au rachat.
      </p>
      ${motif ? `<p style="margin:12px 0 0;color:#ccc;font-size:13px;font-style:italic;">"${motif}"</p>` : ""}
    </div>

    <div style="background:rgba(255,193,7,0.08);border:1px solid rgba(255,193,7,0.2);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#d4a017;line-height:1.6;">
        ⚠️ Le document signé lors de votre demande est désormais <strong>invalidé et sans valeur juridique</strong>.
      </p>
    </div>

    <p style="color:#aaa;font-size:14px;line-height:1.7;">
      Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez soumettre une nouvelle demande avec des informations mises à jour, n'hésitez pas à nous contacter.
    </p>

    <p style="margin:24px 0 0;text-align:center;color:#555;font-size:13px;">
      <a href="mailto:contact@power-exhaust.com" style="color:#ff6b00;text-decoration:none;">contact@power-exhaust.com</a>
    </p>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from:    FROM,
    to:      rachat.emailVendeur,
    subject: `[Power Exhaust] Demande de rachat non retenue — Réf. ${rachat.reference}`,
    html:    emailWrapper("Demande non retenue", body),
  });
}

// ─── 5. Email Client — changement de statut par l'admin ──────────────────────

const STATUT_EMAIL_CONFIG: Record<string, {
  subject: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  message: string;
  showSuivi: boolean;
}> = {
  VALIDE: {
    subject: "Dossier validé — bordereau en préparation",
    emoji: "✅", title: "Dossier validé !",
    subtitle: "Votre dossier a été accepté par notre équipe.",
    color: "#22c55e", bgColor: "rgba(34,197,94,0.08)",
    message: "Notre équipe a examiné votre demande. Votre dossier est désormais validé. Vous allez recevoir prochainement votre bordereau d'expédition Colissimo par email.",
    showSuivi: true,
  },
  EN_COURS: {
    subject: "Votre dossier est en cours d'analyse",
    emoji: "🔍", title: "Analyse en cours",
    subtitle: "Nos experts examinent votre demande.",
    color: "#a855f7", bgColor: "rgba(168,85,247,0.08)",
    message: "Votre dossier est pris en charge par notre équipe d'experts. Nous analysons les photos et les informations fournies. Vous serez informé(e) dès qu'une offre de rachat sera disponible.",
    showSuivi: true,
  },
  OFFRE_ENVOYEE: {
    subject: "Une offre de rachat vous attend !",
    emoji: "💶", title: "Offre de rachat disponible",
    subtitle: "Nous avons une proposition pour vous.",
    color: "#f97316", bgColor: "rgba(249,115,22,0.08)",
    message: "Suite à l'analyse de votre ligne d'échappement, notre équipe vous a préparé une offre de rachat. Rendez-vous dans votre espace ou consultez le suivi de votre dossier pour en prendre connaissance.",
    showSuivi: true,
  },
  ACCEPTE: {
    subject: "Offre acceptée — préparez votre envoi",
    emoji: "🤝", title: "Offre acceptée !",
    subtitle: "Merci d'avoir accepté notre proposition.",
    color: "#38bdf8", bgColor: "rgba(56,189,248,0.08)",
    message: "Votre acceptation a bien été enregistrée. Préparez votre colis soigneusement. Votre bordereau d'expédition vous sera transmis très prochainement.",
    showSuivi: true,
  },
  EN_EXPEDITION: {
    subject: "Votre bordereau d'expédition est prêt",
    emoji: "📦", title: "Envoi en cours",
    subtitle: "Votre bordereau d'expédition est disponible.",
    color: "#6366f1", bgColor: "rgba(99,102,241,0.08)",
    message: "Votre bordereau Colissimo est joint à cet email ou disponible dans votre espace. Imprimez-le, fixez-le sur votre colis et déposez-le dans un bureau de La Poste.",
    showSuivi: true,
  },
  RECU: {
    subject: "Colis bien reçu — vérification en cours",
    emoji: "📬", title: "Colis reçu !",
    subtitle: "Nous avons bien réceptionné votre envoi.",
    color: "#06b6d4", bgColor: "rgba(6,182,212,0.08)",
    message: "Votre colis est arrivé dans nos locaux. Notre équipe procède actuellement à la vérification et au contrôle de la pièce. Vous serez informé(e) du résultat très prochainement.",
    showSuivi: true,
  },
  PAYE: {
    subject: "Paiement effectué — merci !",
    emoji: "💳", title: "Paiement envoyé !",
    subtitle: "Le virement a été effectué sur votre compte.",
    color: "#22c55e", bgColor: "rgba(34,197,94,0.08)",
    message: "Le virement de rachat a été initié vers votre compte bancaire. Comptez 1 à 3 jours ouvrés selon votre établissement bancaire. Merci pour votre confiance !",
    showSuivi: false,
  },
  COMPLETE: {
    subject: "Dossier clôturé — merci pour votre confiance",
    emoji: "🏆", title: "Dossier complet !",
    subtitle: "Votre demande de rachat est finalisée.",
    color: "#f59e0b", bgColor: "rgba(245,158,11,0.08)",
    message: "Votre dossier de rachat est désormais clôturé. Toutes les étapes ont été complétées avec succès. Merci de nous avoir fait confiance — à bientôt sur Power Exhaust !",
    showSuivi: false,
  },
  LITIGE: {
    subject: "Litige ouvert sur votre dossier",
    emoji: "⚖️", title: "Litige en cours",
    subtitle: "Un problème a été signalé sur votre dossier.",
    color: "#eab308", bgColor: "rgba(234,179,8,0.08)",
    message: "Un litige a été ouvert sur votre dossier. Notre équipe va vous contacter dans les plus brefs délais pour résoudre cette situation. N'hésitez pas à nous écrire directement.",
    showSuivi: true,
  },
  NON_PAYE: {
    subject: "Problème de paiement — action requise",
    emoji: "⚠️", title: "Paiement en attente",
    subtitle: "Un problème est survenu lors du paiement.",
    color: "#ef4444", bgColor: "rgba(239,68,68,0.08)",
    message: "Nous avons rencontré un problème lors du virement. Notre équipe va vous contacter pour régulariser la situation dans les plus brefs délais.",
    showSuivi: true,
  },
};

export async function sendStatusChangeEmail(params: {
  emailVendeur: string;
  prenomVendeur: string;
  reference: string;
  statut: string;
  marque: string;
  modele: string;
  typeEchappement: string | null;
  prixPropose?: number | null;
  prixAccepte?: number | null;
  noteAdmin?: string | null;
}): Promise<void> {
  const cfg = STATUT_EMAIL_CONFIG[params.statut];
  if (!cfg) return; // Pas d'email pour EN_ATTENTE et REFUSE (géré ailleurs)

  const suiviUrl = `${APP_URL}/suivi?ref=${encodeURIComponent(params.reference)}`;

  const prixBlock = params.prixPropose
    ? `<div style="background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:1px;">Offre de rachat</p>
        <p style="margin:0;font-size:32px;font-weight:900;color:#fff;">${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(params.prixPropose)}</p>
      </div>`
    : "";

  const noteBlock = params.noteAdmin
    ? `<div style="background:rgba(255,255,255,0.04);border-left:3px solid ${cfg.color};border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Message de l'équipe</p>
        <p style="margin:0;color:#ccc;font-size:13px;line-height:1.6;font-style:italic;">"${params.noteAdmin}"</p>
      </div>`
    : "";

  const suiviBlock = cfg.showSuivi
    ? `<div style="text-align:center;margin-top:28px;">
        <a href="${suiviUrl}"
           style="display:inline-block;background:${cfg.color};color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
          Suivre mon dossier →
        </a>
        <p style="margin:10px 0 0;font-size:11px;color:#555;">
          Ou copiez ce lien : <span style="font-family:monospace;color:#888;">${suiviUrl}</span>
        </p>
      </div>`
    : "";

  const body = `
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#fff;">${cfg.emoji} ${cfg.title}</h2>
    <p style="margin:0 0 28px;color:#888;font-size:15px;">
      Réf. <span style="color:#ff6b00;font-family:monospace;font-weight:700;">${params.reference}</span> — Bonjour ${params.prenomVendeur},
    </p>

    <div style="background:${cfg.bgColor};border:1px solid ${cfg.color}40;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:${cfg.color};">${cfg.subtitle}</p>
      <p style="margin:0;color:#aaa;font-size:13px;line-height:1.7;">${cfg.message}</p>
    </div>

    ${prixBlock}
    ${noteBlock}

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Rappel dossier</p>
      <p style="margin:0 0 4px;color:#ccc;font-size:13px;">📦 <strong style="color:#fff;">${params.typeEchappement}</strong></p>
      <p style="margin:0;color:#ccc;font-size:13px;">🏍️ ${params.marque} ${params.modele}</p>
    </div>

    ${suiviBlock}

    <p style="margin:24px 0 0;text-align:center;color:#555;font-size:13px;">
      Une question ? <a href="mailto:contact@power-exhaust.com" style="color:#ff6b00;text-decoration:none;">contact@power-exhaust.com</a>
    </p>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from:    FROM,
    to:      params.emailVendeur,
    subject: `[Power Exhaust] ${cfg.subject} — Réf. ${params.reference}`,
    html:    emailWrapper(cfg.title, body),
  });
}
