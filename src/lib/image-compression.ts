/**
 * Compression d'image côté client avant envoi au serveur.
 *
 * Les photos du formulaire de rachat étaient envoyées en base64 brut dans le
 * corps JSON de la requête. Une photo de téléphone (souvent 3-10 Mo) gonflée en
 * base64 dépassait la limite de taille du corps de requête (Vercel ≈ 4,5 Mo),
 * provoquant une erreur 413 qui se manifestait côté client par un faux message
 * « erreur réseau ».
 *
 * Cette fonction redimensionne l'image (max 1600 px sur le côté le plus long)
 * et la ré-encode en JPEG pour réduire drastiquement la taille du payload tout
 * en conservant une qualité suffisante pour l'analyse du dossier par l'admin.
 */

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Chargement de l'image impossible"));
    img.src = src;
  });
}

export async function compressImageFile(
  file: File,
  maxDimension = MAX_DIMENSION,
  quality = JPEG_QUALITY
): Promise<string> {
  const original = await fileToDataUrl(file);

  // Les fichiers déjà très légers (ou non-image) n'ont pas besoin de compression.
  if (file.size < 150 * 1024 && file.type === "image/jpeg") {
    return original;
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(original);
  } catch {
    // Image illisible (ex: format exotique) : on renvoie le base64 brut.
    return original;
  }

  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  // Ne redimensionner que si l'image dépasse la dimension maximale.
  const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return original;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}
