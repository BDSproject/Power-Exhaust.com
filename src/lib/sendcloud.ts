/**
 * SendCloud shipping service
 * Docs: https://api.sendcloud.dev/docs
 */

const BASE_URL = "https://panel.sendcloud.sc/api/v2";

function authHeader(): string {
  const pub = process.env.SENDCLOUD_PUBLIC_KEY ?? "";
  const sec = process.env.SENDCLOUD_SECRET_KEY ?? "";
  return "Basic " + Buffer.from(`${pub}:${sec}`).toString("base64");
}

// ─── Error ────────────────────────────────────────────────────────────────────

export class SendCloudError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly sendcloudCode?: number
  ) {
    super(message);
    this.name = "SendCloudError";
  }
}

/** Backward-compat alias so existing `instanceof BoxtalError` checks keep working */
export { SendCloudError as BoxtalError };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  street1: string;
  city: string;
  postCode: string;
  country: string;
  email: string;
  mobile: string;
}

export interface ShippingParcel {
  weight: number; // kg
  length: number; // cm
  width: number;  // cm
  height: number; // cm
}

export interface ShipmentResult {
  reference: string; // SendCloud parcel id (as string)
}

// Legacy type aliases used in existing code
export type BoxtalAddress = ShippingAddress;
export type BoxtalParcel  = ShippingParcel;
export type BoxtalShipmentResult = ShipmentResult;

// ─── Destination (point relais) ───────────────────────────────────────────────

function getDestination() {
  return {
    name:        `${process.env.SENDCLOUD_DEST_FIRSTNAME ?? ""} ${process.env.SENDCLOUD_DEST_LASTNAME ?? ""}`.trim(),
    company_name: process.env.SENDCLOUD_DEST_COMPANY ?? "",
    address:     process.env.SENDCLOUD_DEST_STREET ?? "",
    city:        process.env.SENDCLOUD_DEST_CITY ?? "",
    postal_code: process.env.SENDCLOUD_DEST_POSTCODE ?? "",
    country:     "FR",
    email:       process.env.SENDCLOUD_DEST_EMAIL ?? "",
    phone_number: process.env.SENDCLOUD_DEST_PHONE ?? "",
  };
}

// ─── Create shipment ──────────────────────────────────────────────────────────

export async function createShipment(
  sender: ShippingAddress,
  parcel: ShippingParcel
): Promise<ShipmentResult> {
  const dest = getDestination();
  const shippingMethodId = Number(process.env.SENDCLOUD_SHIPPING_METHOD_ID ?? "0");

  const body = {
    parcel: {
      name:         `${sender.firstName} ${sender.lastName}`,
      company_name: sender.company ?? "",
      address:      sender.street1,
      city:         sender.city,
      postal_code:  sender.postCode,
      country:      sender.country,
      email:        sender.email,
      telephone:    sender.mobile,

      // destination / return address
      to_name:         dest.name,
      to_company_name: dest.company_name,
      to_address:      dest.address,
      to_city:         dest.city,
      to_postal_code:  dest.postal_code,
      to_country:      dest.country,
      to_email:        dest.email,
      to_phone_number: dest.phone_number,

      weight:           parcel.weight.toFixed(3),
      length:           parcel.length,
      width:            parcel.width,
      height:           parcel.height,
      shipment: { id: shippingMethodId },

      // request_label so the label is created immediately
      request_label: true,
    },
  };

  const res = await fetch(`${BASE_URL}/parcels`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `SendCloud error ${res.status}`;
    try {
      const json = (await res.json()) as { error?: { message?: string; code?: number } };
      if (json?.error?.message) msg = json.error.message;
      throw new SendCloudError(msg, res.status, json?.error?.code);
    } catch (e) {
      if (e instanceof SendCloudError) throw e;
      throw new SendCloudError(msg, res.status);
    }
  }

  const json = (await res.json()) as { parcel: { id: number } };
  return { reference: String(json.parcel.id) };
}

// ─── Fetch label (PDF) ────────────────────────────────────────────────────────

export async function fetchLabel(parcelId: string): Promise<ArrayBuffer> {
  // First get the label URL from the parcel
  const parcelRes = await fetch(`${BASE_URL}/parcels/${parcelId}`, {
    headers: { Authorization: authHeader() },
  });

  if (!parcelRes.ok) {
    throw new SendCloudError(
      `Impossible de récupérer le colis SendCloud (${parcelRes.status})`,
      parcelRes.status
    );
  }

  const parcelJson = (await parcelRes.json()) as {
    parcel: { label?: { label_printer?: string; normal_printer?: string[] } };
  };

  const labelUrl =
    parcelJson.parcel.label?.label_printer ??
    parcelJson.parcel.label?.normal_printer?.[0];

  if (!labelUrl) {
    throw new SendCloudError("Label non encore disponible pour ce colis");
  }

  const labelRes = await fetch(labelUrl, {
    headers: { Authorization: authHeader() },
  });

  if (!labelRes.ok) {
    throw new SendCloudError(
      `Impossible de télécharger l'étiquette (${labelRes.status})`,
      labelRes.status
    );
  }

  return labelRes.arrayBuffer();
}
