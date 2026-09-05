export const AUTH_COOKIE = "dharana_token";

export function mediaUrl(
  url: string | null | undefined,
  fallback: string | null = null,
): string | null {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}