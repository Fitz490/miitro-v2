import { apiFetch } from "@/lib/api-fetch";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMemberGate } from "@/hooks/use-member-gate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Copy, DollarSign, Users, CheckCircle2, Clock,
  ArrowRight, AlertCircle, Info, Link as LinkIcon,
} from "lucide-react";

interface AffiliateDashboard {
  enrolled: boolean;
  message?: string;
  affiliateCode: string | null;
  affiliateLink: string | null;
  totalSales: number;
  pendingCommissions: number;
  approvedCommissions: number;
  paidCommissions: number;
  commissions: {
    id: number;
    product: string;
    commissionAmount: number;
    status: "pending" | "approved" | "paid";
    saleVerifiedAt: string | null;
    approvedAt: string | null;
    paidAt: string | null;
    createdAt: string;
  }[];
  commissionRates: Record<string, number>;
  programRules: string[];
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-300" },
  approved: { label: "Approved", className: "bg-sky-100 text-sky-700 border-sky-300" },
  paid: { label: "Paid Out", className: "bg-emerald-100 text-emerald-700 border-emerald-300" },
};

export default function AffiliatePage() {
  const { user } = useAuth();
  const { blocked } = useMemberGate({ requireBundle: true }); // bundle only; all other tiers are redirected to /dashboard
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AffiliateDashboard>({
    queryKey: ["affiliate-dashboard"],
    queryFn: async () => {
      const res = await apiFetch("/api/affiliate/dashboard");
      if (!res.ok) throw new Error("Failed to load affiliate data");
      return res.json();
    },
    enabled: !blocked && !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/api/affiliate/enroll", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        let message = "Enrollment failed";
        try {
          const parsed = text ? JSON.parse(text) : null;
          message = parsed?.message || text || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-dashboard"] });
      toast({ title: "Enrolled!", description: "You've joined the Miitro affiliate program." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  if (blocked || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Affiliate / Partner Program</h1>
          <p className="text-muted-foreground">
            Earn a commission on verified Miitro product sales — entirely optional.
          </p>
        </div>

        {/* Important disclosure */}
        <Card className="border-sky-200 bg-sky-50 dark:bg-sky-900/10 dark:border-sky-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sky-800 dark:text-sky-300 text-sm">Affiliate Disclosure Requirement</p>
                <p className="text-sm text-sky-700/80 dark:text-sky-400/80 mt-0.5">
                  When promoting Miitro through your affiliate link, you <strong>must clearly disclose</strong> that
                  you may earn a commission from qualifying purchases. This is required by the FTC and our program terms.
                  Example: <em>"I may earn a commission if you join Miitro through my link."</em>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : !data?.enrolled ? (
          /* ── Not enrolled ─────────────────────────────────────────────── */
          <>
            {/* How it works */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>How the affiliate program works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: LinkIcon,
                      label: "1. Get your link",
                      desc: "Enroll and receive a unique affiliate link to share with other drivers.",
                    },
                    {
                      icon: Users,
                      label: "2. Share it honestly",
                      desc: "Share your link with drivers you know — always disclose you may earn a commission.",
                    },
                    {
                      icon: CheckCircle2,
                      label: "3. Earn on sales",
                      desc: "When someone purchases Miitro through your link, a commission is created.",
                    },
                    {
                      icon: DollarSign,
                      label: "4. Get paid",
                      desc: "Once the refund review period passes and the sale is verified, commissions are approved and paid.",
                    },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Commission rates */}
                <div>
                  <p className="font-semibold text-sm mb-2">Commission Rates</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 border text-center">
                      <p className="text-2xl font-bold text-emerald-600">$50</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Training Program sale ($200)</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border text-center">
                      <p className="text-2xl font-bold text-emerald-600">$75</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Founding Membership sale ($300)</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border text-center">
                      <p className="text-2xl font-bold text-emerald-600">$125</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Full Bundle sale ($400)</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    No commissions for recruiting other affiliates. No multi-level payouts. Commissions are on verified product sales only.
                  </p>
                </div>

                {/* Program rules */}
                <div>
                  <p className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Program Rules
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Commissions are earned on verified product sales only.",
                      "Payouts are processed after the refund review period passes.",
                      "Self-referrals are not eligible for commissions.",
                      "Affiliates must clearly disclose when they may earn a commission.",
                      "No commissions are paid for recruiting or signing up other affiliates.",
                    ].map((rule) => (
                      <li key={rule} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {enrollMutation.isPending ? "Enrolling…" : "Enroll in Affiliate Program"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          /* ── Enrolled dashboard ──────────────────────────────────────── */
          <>
            {/* Affiliate link */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" /> Your Affiliate Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted rounded-xl p-4 flex items-center justify-between gap-4 border">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Affiliate Code</p>
                    <p className="font-mono text-lg font-bold tracking-widest">{data.affiliateCode}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => copy(data.affiliateCode!, "Code")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-muted rounded-xl p-4 flex items-center justify-between gap-4 border">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Partner Link</p>
                    <p className="font-mono text-sm truncate">{data.affiliateLink}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => copy(data.affiliateLink!, "Partner link")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Remember: always disclose that you may earn a commission when sharing this link.
                </p>
              </CardContent>
            </Card>

            {/* Commission stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Earned", value: formatCurrency(data.pendingCommissions + data.approvedCommissions + data.paidCommissions), icon: DollarSign, color: "text-primary" },
                { label: "Pending Earnings", value: formatCurrency(data.pendingCommissions), icon: Clock, color: "text-amber-600" },
                { label: "Confirmed Earnings", value: formatCurrency(data.approvedCommissions), icon: CheckCircle2, color: "text-sky-600" },
                { label: "Paid Earnings", value: formatCurrency(data.paidCommissions), icon: DollarSign, color: "text-emerald-600" },
                { label: "Invited Drivers", value: data.totalSales, icon: Users, color: "text-indigo-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-5 pb-4">
                    <Icon className={`w-5 h-5 ${color} mb-2`} />
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Commission history */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Commission History</CardTitle>
              </CardHeader>
              <CardContent>
                {data.commissions.length === 0 ? (
                  <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-sm">No commissions yet</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Share your link with other drivers to start earning commissions on qualifying purchases.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.commissions.map((c) => {
                      const s = STATUS_BADGE[c.status] ?? STATUS_BADGE.pending;
                      return (
                        <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border text-sm">
                          <div>
                            <p className="font-medium capitalize">{c.product} sale</p>
                            <p className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-600">{formatCurrency(c.commissionAmount)}</span>
                            <Badge className={s.className}>{s.label}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Marketing assets placeholder */}
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Marketing Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Pre-made graphics, captions, and promotional materials will be available here.
                  Check back as new assets are added.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Coming soon — graphic templates, suggested copy, and social media assets.
                </p>
              </CardContent>
            </Card>
          </>
        )}

      </div>
    </AppLayout>
  );
}
