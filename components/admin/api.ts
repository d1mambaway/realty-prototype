export class Unauthorized extends Error {}

/** Запрос к /api/admin/*; 401 → Unauthorized (показываем экран входа) */
export async function adminFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, { credentials: "same-origin", ...init });
  if (res.status === 401) throw new Unauthorized();
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  return body as T;
}

export const jsonBody = (data: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

/** Сжимаем фото в браузере (до 1600 px по длинной стороне) и загружаем в хранилище */
export async function uploadPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.82),
  );
  const { url } = await adminFetch<{ url: string }>("upload", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });
  return url;
}
