/**
 * Thin wrapper around fetch() for hand-written API calls (i.e. calls that
 * don't go through the generated orval/react-query client).
 *
 * Two things it adds:
 *   1. Keeps paths relative so they go through the Vercel rewrite proxy
 *      (production) or the Vite dev proxy (local dev), making session
 *      cookies first-party.
 *   2. Sets `credentials: "include"` so the session cookie is always sent.
 *
 * Override with VITE_API_URL at build time only if you need to bypass the
 * proxy and hit a backend directly.
 */

const API_BASE: string = import.meta.env.VITE_API_URL || "";

export function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
  });
}
