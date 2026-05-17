/**
 * Chiffrement AES-256-GCM des fichiers sensibles (pièces d'identité)
 * Conformité : Art. R321-3 CSI + RGPD
 * Stockage : Vercel Blob (production) ou filesystem local (dev)
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { put, del, head } from "@vercel/blob";

// Clé AES-256 (32 octets = 64 caractères hex) depuis variable d'environnement
function getEncryptionKey(): Buffer {
  const hexKey = process.env.FILE_ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error(
      "FILE_ENCRYPTION_KEY manquante ou invalide (64 caractères hex requis). " +
      "Générez-en une avec : openssl rand -hex 32"
    );
  }
  return Buffer.from(hexKey, "hex");
}

export interface EncryptedFileMeta {
  iv: string;      // IV AES-GCM (hex, 24 chars)
  authTag: string; // Tag d'authentification GCM (hex, 32 chars)
}

/**
 * Chiffre un buffer en AES-256-GCM
 */
export function encryptBuffer(data: Buffer): { encrypted: Buffer } & EncryptedFileMeta {
  const key = getEncryptionKey();
  const iv = randomBytes(12); // 96 bits — recommandé pour GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Déchiffre un buffer AES-256-GCM
 */
export function decryptBuffer(encrypted: Buffer, iv: string, authTag: string): Buffer {
  const key = getEncryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Sauvegarde un fichier chiffré dans Vercel Blob
 * @returns Métadonnées de chiffrement (IV + authTag) à stocker en base
 */
export async function saveEncryptedFile(
  data: Buffer,
  uuid: string
): Promise<EncryptedFileMeta> {
  const { encrypted, iv, authTag } = encryptBuffer(data);
  await put(`identites/${uuid}.enc`, encrypted, {
    access: "public", // chiffré côté app, l'URL brute est inutilisable sans clé
    contentType: "application/octet-stream",
  });
  return { iv, authTag };
}

/**
 * Lit et déchiffre un fichier depuis Vercel Blob
 */
export async function readEncryptedFile(
  uuid: string,
  iv: string,
  authTag: string
): Promise<Buffer> {
  const blobUrl = `${process.env.BLOB_BASE_URL}/identites/${uuid}.enc`;
  const res = await fetch(blobUrl);
  if (!res.ok) throw new Error(`Fichier introuvable : ${uuid}`);
  const arrayBuffer = await res.arrayBuffer();
  const encrypted = Buffer.from(arrayBuffer);
  return decryptBuffer(encrypted, iv, authTag);
}

/**
 * Supprime un fichier chiffré (purge RGPD)
 */
export async function deleteEncryptedFile(uuid: string): Promise<boolean> {
  try {
    const blobUrl = `${process.env.BLOB_BASE_URL}/identites/${uuid}.enc`;
    // Vérifier que le blob existe avant de supprimer
    await head(blobUrl);
    await del(blobUrl);
    return true;
  } catch {
    return false; // Fichier déjà supprimé ou inexistant
  }
}
