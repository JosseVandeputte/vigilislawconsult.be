/**
 * Constructs a full URL for an API path.
 *
 * - In development and on Railway (full Next.js): NEXT_PUBLIC_API_URL is empty,
 *   so the path is returned as-is (same-origin, relative).
 * - For the static FTP export build: NEXT_PUBLIC_API_URL is set to
 *   "https://api.vigilislawconsult.be", so all API calls are prefixed.
 */
export const apiUrl = (path: string): string =>
  `https://vlc-server-feb-2026.deno.dev${path}`;
