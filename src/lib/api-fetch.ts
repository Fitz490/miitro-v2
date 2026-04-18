/**
 * Thin wrapper around fetch() for hand-written API calls (i.e. calls that
 * don't go through the generated orval/react-query client).
 *
 * Two things it adds:
 *   1. Prepends the production API base URL so the request reaches Railway
 *      instead of hitting the Vercel domain with a relative path.
 *   2. Sets `credentials: "include"` so the session cookie is sent
 *      cross-origin.
 */

const API_BASE: string =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "https://miitro-api-production.up.railway.app");

export function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
  });
}
