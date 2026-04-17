/**
 * useProducts — fetches the product catalogue from GET /api/products.
 *
 * Results are cached for 1 hour (staleTime). Prices change rarely, so
 * background refetches are suppressed to avoid unnecessary API calls on
 * every page visit.
 *
 * Used by: pricing.tsx, join.tsx, payment.tsx, mock-checkout.tsx, apply.tsx
 */

import { useQuery } from "@tanstack/react-query";
import type { Plan } from "@/lib/plans";

export function useProducts() {
  return useQuery<Plan[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      return res.json() as Promise<Plan[]>;
    },
    staleTime: 1000 * 60 * 60,   // 1 hour — pricing changes are infrequent
    gcTime:    1000 * 60 * 60,   // keep in cache for the same window
  });
}
