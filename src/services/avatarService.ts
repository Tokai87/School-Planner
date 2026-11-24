import { supabase } from "@/lib/supabase";

export const AVATAR_BUCKET = "avatars";
const SIZE = 512;
const MAX_INPUT_BYTES = 12 * 1024 * 1024;

export type AvatarErrorCode = "too_large" | "not_image" | "decode_failed";

export class AvatarError extends Error {
  readonly code: AvatarErrorCode;
  constructor(code: AvatarErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/** Centre-crop to a square, scale to 512x512 and re-encode as JPEG (also strips EXIF/GPS metadata). */
async function toSquareJpeg(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new AvatarError("not_image", "Not an image");
  if (file.size > MAX_INPUT_BYTES) throw new AvatarError("too_large", "Image too large");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new AvatarError("decode_failed", "Cannot decode image");
  }

  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new AvatarError("decode_failed", "Canvas unavailable");
    ctx.fillStyle = "#ffffff"; // transparent PNGs would otherwise turn black in JPEG
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new AvatarError("decode_failed", "Encode failed"))), "image/jpeg", 0.85),
    );
  } finally {
    bitmap.close();
  }
}

/**
 * Upload a new profile photo and point profiles.avatar_path at it.
 * A fresh file name is used each time so browsers/CDNs never serve a stale image; the previous file is removed afterwards.
 */
export async function uploadAvatar(userId: string, file: File, previousPath?: string | null): Promise<string> {
  const blob = await toSquareJpeg(file);
  const path = `${userId}/avatar-${Date.now()}.jpg`;

  const { error: upErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", cacheControl: "3600", upsert: false });
  if (upErr) throw upErr;

  const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", userId);
  if (error) {
    await supabase.storage.from(AVATAR_BUCKET).remove([path]); // don't leave an orphan behind
    throw error;
  }

  if (previousPath && previousPath !== path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([previousPath]); // best effort, ignore failure
  }
  return path;
}

export async function removeAvatar(userId: string, path: string): Promise<void> {
  const { error } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", userId);
  if (error) throw error;
  await supabase.storage.from(AVATAR_BUCKET).remove([path]); // best effort
}

/** Private bucket -> short-lived signed URL (1 hour). */
export async function getAvatarUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
