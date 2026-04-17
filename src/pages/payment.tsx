import { useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetPaymentStatus } from "@workspace/api-client-react";
import { Shield, CheckCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { getPlan } from "@/lib/plans";
import { useProducts } from "@/hooks/use-products";

export default function Payment() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  // Read selected plan key + success-redirect flag from URL params.
  // Plan object is derived after products load — split into two memos so
  // the URL parsing is stable and the plan lookup re-runs when products arrive.
  const { planKey, isSuccessRedirect } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const successRedirect =
      window.location.pathname.endsWith("/success") || !!params.get("session_id");
    return { planKey: params.get("plan"), isSuccessRedirect: successRedirect };
  }, []);

  const plan = useMemo(
    () => (products.length > 0 ? getPlan(planKey, products) : null),
    [planKey, products],
  );

  const { data: paymentStatus, isLoading: statusLoading } = useGetPaymentStatus({
    query: {
      enabled: !!user,
      // Poll every 2 s after Stripe redirects back so we catch the webhook completing.
      refetchInterval: isSuccessRedirect ? 2000 : false,
    },
  });

  // Checkout mutation — uses direct fetch so we can pass { product } in the body.
  // The generated useCreateCheckoutSession hook does not accept a request body.
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: plan!.key }),
      });
      if (!res.ok) {
        const text = await res.text();
        let message = "Could not start checkout";
        try {
          const parsed = text ? JSON.parse(text) : null;
          message = parsed?.message || text || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }
      return res.json() as Promise<{ url: string; sessionId: string }>;
    },
    onSuccess: (data) => {
      // data.url is either a Stripe URL or the /payment/mock-checkout path
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Could not start checkout",
        description: error.message || "Please try again or contact support.",
      });
    },
  });

  // All route guards in useEffect — never call setLocation during render.
  const isUserPresent = !!user;
  const currentProduct = paymentStatus?.productPurchased ?? null;
  // Redirect to dashboard if user already owns this plan (or has the bundle, which includes everything)
  const ownsThisPlan = !!plan && (currentProduct === plan.key || currentProduct === "bundle");
  // Redirect to /join if user is trying to buy the bundle but already owns a product
  // (bundle discount is only for new users)
  const bundleBlockedByExistingProduct =
    !!plan && plan.key === "bundle" && currentProduct !== null && currentProduct !== "bundle";

  useEffect(() => {
    if (userLoading || statusLoading) return;
    if (!isUserPresent) { setLocation("/login"); return; }
    if (ownsThisPlan) { setLocation("/dashboard"); return; }
    if (bundleBlockedByExistingProduct) { setLocation("/join"); return; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, statusLoading, isUserPresent, ownsThisPlan, bundleBlockedByExistingProduct]);

  if (userLoading || statusLoading || productsLoading || !user || !plan) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  // Stripe redirected back with ?session_id= — show a processing screen while
  // we poll for the webhook to update the account (ownsThisPlan redirect handles the rest).
  if (isSuccessRedirect && !ownsThisPlan) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Payment received!</h1>
          <p className="text-muted-foreground mb-8">
            We're setting up your account — this takes just a moment.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground text-lg">{plan.label}</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
          {/* Price header */}
          <div className="bg-muted/50 p-6 border-b flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{plan.label}</h3>
              <p className="text-sm text-muted-foreground">One-time payment — not a subscription</p>
            </div>
            <div className="text-3xl font-bold">{plan.priceDisplay}</div>
          </div>

          <CardContent className="p-8">
            {/* Plan perks */}
            <div className="space-y-3 mb-8">
              {plan.perks.map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* Change plan link */}
            <p className="text-sm text-muted-foreground mb-6">
              Not the right plan?{" "}
              <button
                onClick={() => setLocation("/join")}
                className="text-primary hover:underline font-medium"
              >
                Go back and choose a different option
              </button>
            </p>

            <Button
              size="lg"
              className="w-full h-14 text-lg bg-black hover:bg-black/80 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending
                ? "Preparing Checkout…"
                : `Pay ${plan.priceDisplay} — ${plan.label}`}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Payments are processed securely via Stripe. You can pay with any major credit card.
            </p>
          </CardContent>
        </Card>

        {/* Legal */}
        <p className="text-xs text-muted-foreground text-center mt-6 max-w-xl mx-auto">
          This payment does not represent an investment in or ownership of Miitro.
          Miitro does not guarantee any income, earnings, or financial return from membership.
          All fees are non-refundable except where required by applicable law.
        </p>
      </div>
    </AppLayout>
  );
}
