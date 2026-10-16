import { httpClient } from "@/lib/httpClient";

/** An image that is already stored: its storage key plus a short-lived URL to show it. */
export interface StoredImage {
  key: string;
  url: string;
}

/** What an image picker holds: images already saved, and files picked but not uploaded yet. */
export type ImageValue = File | StoredImage;

export function isStoredImage(value: ImageValue): value is StoredImage {
  return typeof File === "undefined" || !(value instanceof File);
}

/** A stored image from an API `*_key` / `*_url` pair, or nothing when either is missing. */
export function storedImage(key: string | null | undefined, url: string | null | undefined): StoredImage | undefined {
  return key && url ? { key, url } : undefined;
}

interface UploadUrl {
  upload_url: string;
  file_key: string;
}

/** Two-step upload: ask the API for a signed URL, PUT the file there, return its key. */
export async function uploadFile(endpoint: string, body: Record<string, unknown>, file: File): Promise<string> {
  const contentType = file.type || "image/jpeg";
  const { upload_url, file_key } = await httpClient.post<UploadUrl>(endpoint, { ...body, file_name: file.name, content_type: contentType });
  const put = await fetch(upload_url, { method: "PUT", body: file, headers: { "Content-Type": contentType } });
  if (!put.ok) throw new Error(`Image upload failed (${put.status})`);
  return file_key;
}

/** Storage keys for a picker's value: stored images keep their key, new files are uploaded. */
export async function imageKeys(values: ImageValue[], upload: (file: File) => Promise<string>): Promise<string[]> {
  return Promise.all(values.map((v) => (isStoredImage(v) ? Promise.resolve(v.key) : upload(v))));
}

/** The single key for a one-image picker, or null when it was cleared. */
export async function imageKey(values: ImageValue[], upload: (file: File) => Promise<string>): Promise<string | null> {
  const [key] = await imageKeys(values.slice(0, 1), upload);
  return key ?? null;
}
