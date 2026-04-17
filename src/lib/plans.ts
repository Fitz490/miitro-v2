/**
 * Plan types and utilities — NO hardcoded pricing data.
 *
 * All plan definitions (prices, labels, perks) are fetched from
 * GET /api/products and consumed via the useProducts() hook.
 *
 * This file only contains:
 *   - The PlanKey / Plan TypeScript types
 *   - The getPlan() lookup utility (works on the API-fetched array)
 *
 * Pricing:
 *   Training Only       = $200  (amountCents: 20000)
 *   Founding Membership = $300  (amountCents: 30000)
 *   Bundle              = $400  (amountCents: 40000, saves $100)
 *
 * The $100 bundle discount is ONLY available to users who have not yet
 * purchased any product — enforced server-side in payments.ts.
 */

export type PlanKey = "training" | "membership" | "bundle";

export interface Plan {
  key: PlanKey;
  label: string;
  amountCents: number;    // authoritative cents value from API (e.g. 20000)
  price: number;          // USD (amountCents / 100, e.g. 200)
  priceDisplay: string;   // formatted string (e.g. "$200")
  badge: string | null;   // optional badge, e.g. "Best Value — Save $100"
  tagline: string;        // one-line description
  perks: string[];        // feature bullet list
  cta: string;            // CTA button label
}

/**
 * Returns the plan matching `key` from the provided products array.
 * Falls back to the bundle plan (or last item) when key is null/unrecognised —
 * preserves backward compatibility with old single-price URL flows.
 *
 * @param key      - plan key from URL param or session (e.g. "training")
 * @param products - array fetched from GET /api/products via useProducts()
 */
export function getPlan(key: string | null | undefined, products: Plan[]): Plan {
  if (key) {
    const found = products.find((p) => p.key === key);
    if (found) return found;
  }
  // Default to bundle for backward-compat (old links without ?plan= param)
  return products.find((p) => p.key === "bundle") ?? products[products.length - 1];
}
