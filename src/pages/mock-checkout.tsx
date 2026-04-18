import { apiFetch } from "@/lib/api-fetch";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCurrentUserQueryKey } from "@/lib/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CreditCard, CheckCircle2, AlertTriangle } from "lucide-react";
import { getPlan } from "@/lib/plans";
import { useProducts } from "@/hooks/use-products";

// If a live Stripe publishable key is configured, the mock checkout should
// never be reachable — the backend will have sent a real Stripe URL instead.
// Reading the key here provides a secondary client-side guard and controls
// whether the test-mode banner is shown.
const STRIPE_LIVE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const isLiveMode = typeof STRIPE_LIVE_KEY === "string" && STRIPE_LIVE_KEY.startsWith("pk_live_");

export default function MockCheckout() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPaying, setIsPaying] = useState(false);
  const [done, setDone] = useState(false);
  const { data: products = [], isLoading: productsLoading } = useProducts();

  // The backend appends ?product=X to the mock-checkout URL — read it here.
  // Plan is derived after products load; planKey is stable from the URL.
  const planKey = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("product");
  }, []);

  const plan = useMemo(
    () => (products.length > 0 ? getPlan(planKey, products) : null),
    [planKey, products],
  );

  // Protect route — authenticated only.
  // If the frontend has a live Stripe key but the backend sent us here anyway
  // (STRIPE_SECRET_KEY missing on the backend), show the mock checkout rather
  // than redirecting back to /payment — which would create an infinite loop
  // (payment → create-checkout → mock URL → redirect → payment → …).
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, user]);

  if (userLoading || productsLoading || !user || !plan) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const handleConfirm = async () => {
    setIsPaying(true);
    try {
      const res = await apiFetch("/api/payments/mock-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product: plan.key }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(body.message || `HTTP ${res.status}`);
      }

      // Refresh the auth cache so user.paymentStatus becomes "paid" before
      // navigating — prevents the DriverDashboard from looping back to /payment.
      await queryClient.refetchQueries({ queryKey: getGetCurrentUserQueryKey() });
      setDone(true);
      setTimeout(() => setLocation("/dashboard"), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: message,
      });
      setIsPaying(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
            <p className="text-muted-foreground mb-6">
              Your {plan.label} purchase is confirmed. Redirecting…
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Test-mode banner — only shown when no live Stripe key is configured */}
        {!isLiveMode && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span><strong>Test mode</strong> — no real charge will be made. Add Stripe keys for live payments.</span>
          </div>
        )}

        {/* Checkout card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-1.5 rounded">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">Miitro</div>
                <div className="text-xs text-gray-400">Founding Driver Program</div>
              </div>
            </div>
            <Badge variant="outline" className="text-gray-300 border-gray-600 text-xs">
              {isLiveMode ? "LIVE" : "TEST"}
            </Badge>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Amount */}
            <div className="flex justify-between items-start border-b pb-5">
              <div>
                <div className="font-semibold">{plan.label}</div>
                <div className="text-sm text-muted-foreground">One-time payment</div>
              </div>
              <div className="text-2xl font-bold">{plan.priceDisplay}</div>
            </div>

            {/* Simulated card fields (visual only) */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Card details
              </label>
              <div className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-muted/40 cursor-default">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground select-none">
                  4242 4242 4242 4242 &nbsp;·&nbsp; 12/29 &nbsp;·&nbsp; 123
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg px-4 py-3 bg-muted/40 text-sm text-muted-foreground cursor-default select-none">
                  {user.fullName}
                </div>
                <div className="border rounded-lg px-4 py-3 bg-muted/40 text-sm text-muted-foreground cursor-default select-none">
                  US
                </div>
              </div>
            </div>

            {/* Confirm button */}
            <Button
              size="lg"
              className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-white font-semibold"
              onClick={handleConfirm}
              disabled={isPaying}
            >
              {isPaying ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Processing…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm payment — {plan.priceDisplay}
                </span>
              )}
            </Button>

            {/* Cancel link */}
            <button
              onClick={() => setLocation(`/payment?plan=${plan.key}`)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={isPaying}
            >
              ← Cancel and go back
            </button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Secured by Stripe
        </p>
      </div>
    </div>
  );
}
