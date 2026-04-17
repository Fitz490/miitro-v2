import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, BookOpen, Star, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-products";
import type { Plan } from "@/lib/plans";

const PLAN_ICONS = {
  training: BookOpen,
  membership: Star,
  bundle: Shield,
} as const;

export default function Join() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  // Optional ?plan= param pre-highlights a specific card (e.g. /join?plan=membership)
  const params = new URLSearchParams(window.location.search);
  const highlightKey = params.get("plan");

  const productPurchased = user?.productPurchased ?? null;

  // Per-card state helpers
  const isCardOwned = (planKey: string) =>
    productPurchased === planKey || productPurchased === "bundle";
  const isBundleBlocked = (planKey: string) =>
    planKey === "bundle" && productPurchased !== null && productPurchased !== "bundle";

  if (isLoading || productsLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  /**
   * Where each plan card CTA navigates to:
   * - Not authenticated → /apply?plan=X  (registration + payment)
   * - Authenticated → /payment?plan=X  (skip registration, go straight to checkout)
   */
  const getHref = (planKey: string) => {
    if (isAuthenticated) {
      return `/payment?plan=${planKey}`;
    }
    return `/apply?plan=${planKey}`;
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
            Founding Member Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose your plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the option that fits your goals. All plans are one-time payments — not
            subscriptions. Miitro does not guarantee income or financial returns.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {products.map((plan: Plan) => {
            const key = plan.key;
            const Icon = PLAN_ICONS[key];
            const isFeatured = key === "bundle";
            const isHighlighted = key === highlightKey;
            const highlighted = isFeatured || isHighlighted;
            const owned = isCardOwned(key);
            const bundleBlocked = isBundleBlocked(key);
            const isDisabled = owned || bundleBlocked;
            const href = getHref(key);

            return (
              <Card
                key={key}
                className={`relative flex flex-col transition-all ${
                  isDisabled
                    ? "opacity-70"
                    : highlighted
                    ? "border-primary shadow-xl shadow-primary/10 ring-1 ring-primary"
                    : "hover:border-primary/40 hover:shadow-md"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow font-semibold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    highlighted && !isDisabled ? "bg-primary" : "bg-primary/10"
                  }`}>
                    <Icon className={`w-5 h-5 ${highlighted && !isDisabled ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <CardTitle className="text-lg">{plan.label}</CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.tagline}</p>
                  <p className="text-4xl font-bold mt-2">
                    {plan.priceDisplay}
                    <span className="text-base font-normal text-muted-foreground"> one-time</span>
                  </p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  {owned ? (
                    <Button className="w-full" variant="outline" disabled>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Current Plan
                    </Button>
                  ) : bundleBlocked ? (
                    <div>
                      <Button className="w-full" variant="outline" disabled>
                        Bundle Unavailable
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Bundle discount only available for new users.
                      </p>
                    </div>
                  ) : (
                    <Link href={href}>
                      <Button
                        className="w-full"
                        variant={highlighted ? "default" : "outline"}
                      >
                        {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Legal */}
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
          All pricing is one-time and does not represent an investment in or ownership of Miitro.
          Miitro does not guarantee any income, earnings, or financial return from membership.
          Affiliate commissions depend on verified product sales and program terms.
        </p>

      </div>
    </AppLayout>
  );
}
