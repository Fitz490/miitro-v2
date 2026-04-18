import { apiFetch } from "@/lib/api-fetch";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/use-products";
import {
  CheckCircle2, BookOpen, Star, Shield, ArrowRight,
  Users, Trophy, Zap,
} from "lucide-react";

// UI-only details that don't belong on the API (icons are React components;
// excludes are display-only copy not relevant to mobile or other clients).
const PLAN_ICONS: Record<string, React.ElementType> = {
  training:   BookOpen,
  membership: Star,
  bundle:     Shield,
};

const PLAN_EXCLUDES: Record<string, string | null> = {
  training:   "Does not include platform access (community, coaching, events, trip log).",
  membership: "Does not include the training curriculum (video modules, PDF guides).",
  bundle:     null,
};

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const productPurchased = user?.productPurchased ?? null;

  const checkoutMutation = useMutation({
    mutationFn: async (product: string) => {
      if (!isAuthenticated) {
        setLocation(`/join?plan=${product}`);
        return null;
      }
      const res = await apiFetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Checkout failed");
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">Founding Member Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Invest in your driving career
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Miitro provides professional training, a driver community, and live coaching — built for
            drivers who take their career seriously. Choose the plan that fits your goals.
          </p>
        </div>

        {/* Plans grid */}
        {productsLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {products.map((plan) => {
            const Icon = PLAN_ICONS[plan.key] ?? Shield;
            const excludes = PLAN_EXCLUDES[plan.key] ?? null;
            const isFeatured = plan.key === "bundle";

            // Per-card state
            const isOwned = productPurchased === plan.key || productPurchased === "bundle";
            const isBundleBlocked =
              plan.key === "bundle" &&
              productPurchased !== null &&
              productPurchased !== "bundle";
            const isDisabled = isOwned || isBundleBlocked;

            return (
              <Card
                key={plan.key}
                className={`relative flex flex-col transition-all ${
                  isDisabled
                    ? "opacity-70"
                    : isFeatured
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
                    isFeatured && !isDisabled ? "bg-primary" : "bg-primary/10"
                  }`}>
                    <Icon className={`w-5 h-5 ${isFeatured && !isDisabled ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <CardTitle className="text-lg">{plan.label}</CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.tagline}</p>
                  <p className="text-4xl font-bold mt-2">
                    {plan.priceDisplay}
                    <span className="text-base font-normal text-muted-foreground"> one-time</span>
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2.5 mb-4 flex-1">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  {excludes && (
                    <p className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2 mb-4 border">
                      {excludes}
                    </p>
                  )}
                  {isOwned ? (
                    <Button className="w-full" variant="outline" disabled>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Current Plan
                    </Button>
                  ) : isBundleBlocked ? (
                    <div>
                      <Button className="w-full" variant="outline" disabled>
                        Bundle Unavailable
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Bundle discount only available for new users.
                      </p>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isFeatured ? "default" : "outline"}
                      disabled={checkoutMutation.isPending}
                      onClick={() => checkoutMutation.mutate(plan.key)}
                    >
                      {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}

        {/* Platform comparison note */}
        <div className="bg-muted/50 rounded-2xl p-8 mb-16 border">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> What makes Miitro different?
          </h2>
          <p className="text-muted-foreground mb-6">
            Miitro is building toward a driver-first rideshare platform. While we grow, founding members
            receive professional training and a community designed around their success — not platform profits.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, title: "Real Training", desc: "Curriculum built by drivers for drivers — safety, compliance, maximizing earnings." },
              { icon: Users, title: "Driver Community", desc: "Connect with peers, share experiences, and grow alongside other professionals." },
              { icon: Trophy, title: "Founding Status", desc: "Early members are positioned for priority access and recognition as the platform grows." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-4 rounded-xl bg-background border">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <p className="font-semibold text-sm mb-1">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Optional affiliate note */}
        <Card className="border-dashed mb-8">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-0.5">Optional: Affiliate / Partner Program</p>
                <p className="text-sm text-muted-foreground">
                  Members may optionally enroll in our affiliate program and earn a commission when someone
                  purchases Miitro through their link. This is entirely optional and not required to benefit
                  from your membership. Commissions are on verified product sales only.
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => setLocation("/affiliate")}>
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Legal disclaimer */}
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
          Miitro does not guarantee income, earnings, or financial returns from membership.
          All pricing is one-time and does not represent investment in or ownership of Miitro.
          Future platform features are planned but not guaranteed. Affiliate commissions depend on
          verified product sales and program terms.
        </p>

      </div>
    </AppLayout>
  );
}
