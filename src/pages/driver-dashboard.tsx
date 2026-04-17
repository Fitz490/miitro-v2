import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useGetDriverDashboard } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Copy, DollarSign, Clock, CreditCard, CheckCircle2, BookOpen, Lock, Zap, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Unpaid driver dashboard ──────────────────────────────────────────────────

function UnpaidDriverDashboard({ userFullName }: { userFullName: string }) {
  const [, setLocation] = useLocation();
  const firstName = (userFullName || "").split(" ")[0] || "there";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        {/* Activation banner */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome, {firstName} — complete your membership to get started</h1>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                Your Miitro account is registered but not yet active. Choose a plan and complete
                your one-time membership payment to unlock your full training library, live coaching
                sessions, and member community access.
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold shadow"
                onClick={() => setLocation("/join")}
              >
                Choose a Plan &amp; Activate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* What you unlock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              What You Unlock After Activation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-xl p-5 text-center border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Training</p>
                <p className="text-base font-bold mb-1">Full Curriculum</p>
                <p className="text-xs text-muted-foreground">Video modules, guides & safety content</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-5 text-center border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Coaching</p>
                <p className="text-base font-bold mb-1">Live Zoom Sessions</p>
                <p className="text-xs text-muted-foreground">Expert instructors, Q&amp;A included</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-5 text-center border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Community</p>
                <p className="text-base font-bold mb-1">Member Network</p>
                <p className="text-xs text-muted-foreground">Connect with professional drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locked affiliate link */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-300">Optional affiliate link — locked</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                  If you choose to participate in the optional affiliate program, your affiliate
                  link will be available after your membership is activated. Participation is
                  entirely voluntary.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLocation("/join")} className="shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100">
                Activate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { step: "1", title: "Activate", desc: "Choose a plan and complete your one-time membership fee to unlock your account." },
              { step: "2", title: "Learn", desc: "Access the full training library, attend live coaching sessions, and connect with the member community." },
              { step: "3", title: "Drive", desc: "Apply your training on the road and stay ready as Miitro grows toward full rideshare operations." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm">{step}</div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
            <Button className="w-full mt-2" onClick={() => setLocation("/join")}>
              Choose a Plan &amp; Activate
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}

// ─── Payout helpers ───────────────────────────────────────────────────────────

const PAYOUT_METHODS = [
  { value: "zelle",         label: "Zelle",         contactLabel: "Zelle email or phone" },
  { value: "cash_app",      label: "Cash App",       contactLabel: "Cash App $cashtag or phone" },
  { value: "paypal",        label: "PayPal",         contactLabel: "PayPal email" },
  { value: "bank_transfer", label: "Bank Transfer",  contactLabel: "Bank account email / routing info" },
] as const;

type PayoutMethodValue = typeof PAYOUT_METHODS[number]["value"];

interface PayoutInfo {
  payoutMethod: PayoutMethodValue | null;
  payoutFullName: string | null;
  payoutContact: string | null;
  payoutNotes: string | null;
  payoutUpdatedAt: string | null;
}

// ─── Payout section component ─────────────────────────────────────────────────

function PayoutInfoSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [method, setMethod]       = useState<PayoutMethodValue | "">("");
  const [fullName, setFullName]   = useState("");
  const [contact, setContact]     = useState("");
  const [notes, setNotes]         = useState("");
  const [saved, setSaved]         = useState(false);

  const { data: payoutInfo, isLoading } = useQuery<PayoutInfo>({
    queryKey: ["driver-payout-info"],
    queryFn: async () => {
      const res = await fetch("/api/drivers/payout-info");
      if (!res.ok) throw new Error("Failed to load payout info");
      return res.json();
    },
  });

  useEffect(() => {
    if (payoutInfo) {
      setMethod((payoutInfo.payoutMethod as PayoutMethodValue) ?? "");
      setFullName(payoutInfo.payoutFullName ?? "");
      setContact(payoutInfo.payoutContact ?? "");
      setNotes(payoutInfo.payoutNotes ?? "");
    }
  }, [payoutInfo]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/drivers/payout-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutMethod: method, payoutFullName: fullName, payoutContact: contact, payoutNotes: notes }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Save failed");
      return body;
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["driver-payout-info"] });
      toast({ title: "Saved", description: "Payout information updated successfully." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const selectedMethod = PAYOUT_METHODS.find((m) => m.value === method);
  const contactLabel = selectedMethod?.contactLabel ?? "Email or phone number";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) { toast({ variant: "destructive", title: "Required", description: "Please select a payout method." }); return; }
    if (!fullName.trim()) { toast({ variant: "destructive", title: "Required", description: "Full name is required." }); return; }
    if (!contact.trim()) { toast({ variant: "destructive", title: "Required", description: "Contact info is required." }); return; }
    saveMutation.mutate();
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payout Information
          </CardTitle>
          {payoutInfo?.payoutUpdatedAt && (
            <span className="text-xs text-muted-foreground">
              Last updated {formatDate(payoutInfo.payoutUpdatedAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us how to send your affiliate commissions. This information is kept secure and
          only used for verified commission payouts.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Method dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Payout Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PayoutMethodValue)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="" disabled>Select a method…</option>
              {PAYOUT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Full name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name (for payment)</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
              <p className="text-xs text-muted-foreground">As it appears on your payment account</p>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{contactLabel}</label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={
                  method === "cash_app" ? "$YourCashTag"
                  : method === "bank_transfer" ? "account@email.com"
                  : "email@example.com or (555) 000-0000"
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional instructions for sending payment…"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={saveMutation.isPending} className="min-w-[120px]">
              {saveMutation.isPending ? "Saving…" : "Save Payout Info"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard types ──────────────────────────────────────────────────────────

interface AffiliateSaleEntry {
  id: number;
  buyerName: string;
  buyerEmail: string;
  productLabel: string;
  commissionAmount: number;
  commissionStatus: string;
  verifiedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface ExtendedDashboard {
  driver: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
    city: string | null;
    state: string | null;
    vehicleType: string | null;
    yearsExperience: number | null;
    affiliateCode: string | null;
    applicationStatus: string | null;
    paymentStatus: string | null;
    createdAt: string;
  };
  affiliateCode: string;
  affiliateLink: string;
  affiliateEnrolled: boolean;
  totalSales: number;
  pendingCommissionsTotal: number;
  paidCommissionsTotal: number;
  sales: AffiliateSaleEntry[];
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DriverDashboard() {
  const { user, isDriver, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: rawDashboard, isLoading } = useGetDriverDashboard({
    query: { enabled: !!user && isDriver }
  });
  const dashboard = rawDashboard as unknown as ExtendedDashboard | undefined;

  const userRole = user?.role;
  const isUserPresent = !!user;
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isUserPresent) { setLocation("/login"); return; }
    if (userRole === "admin") { setLocation("/admin"); return; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, isUserPresent, userRole]);

  if (isAuthLoading || !user || user.role === "admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (user.paymentStatus === "unpaid") {
    return <UnpaidDriverDashboard userFullName={user.fullName} />;
  }

  if (isLoading || !dashboard) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {dashboard.driver.fullName}</h1>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="success" className="px-3 py-1">Active Founder</Badge>
              <span className="text-muted-foreground text-sm">Joined {formatDate(dashboard.driver.createdAt)}</span>
            </div>
          </div>

          {dashboard.affiliateEnrolled && (
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <div className="bg-muted p-4 rounded-xl flex items-center justify-between gap-6 border">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Affiliate Code</p>
                  <p className="font-mono text-lg font-bold tracking-widest">{dashboard.affiliateCode}</p>
                </div>
                <Button size="icon" variant="secondary" onClick={() => copyToClipboard(dashboard.affiliateCode, "Code")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-xl flex items-center justify-between gap-6 border">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Affiliate Link</p>
                  <p className="font-mono text-sm truncate max-w-[220px]">{dashboard.affiliateLink}</p>
                </div>
                <Button size="icon" variant="secondary" onClick={() => copyToClipboard(dashboard.affiliateLink, "Link")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats grid — affiliate commission summary */}
        {dashboard.affiliateEnrolled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Verified Sales</p>
                <h3 className="text-3xl font-bold">{dashboard.totalSales}</h3>
                <p className="text-xs text-muted-foreground mt-1">Completed product sales via your link</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Paid Commissions</p>
                <h3 className="text-3xl font-bold">{formatCurrency(dashboard.paidCommissionsTotal)}</h3>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending Commissions</p>
                <h3 className="text-3xl font-bold">{formatCurrency(dashboard.pendingCommissionsTotal)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Awaiting verification or payout</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Affiliate sales table */}
        {dashboard.affiliateEnrolled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Affiliate Sales
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Verified product purchases made through your affiliate link. Commissions are flat
                per product type and subject to verification.
              </p>
            </CardHeader>
            <CardContent>
              {dashboard.sales.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                  <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium mb-2">No sales yet</h4>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                    Share your affiliate link when someone is interested in a Miitro product.
                    Remember to disclose that you may earn a commission (FTC requirement).
                  </p>
                  <Button onClick={() => copyToClipboard(dashboard.affiliateLink, "Affiliate Link")}>
                    Copy Affiliate Link
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.productLabel}</TableCell>
                        <TableCell>{formatDate(sale.createdAt)}</TableCell>
                        <TableCell>{formatCurrency(sale.commissionAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={sale.commissionStatus === "paid" ? "success" : "warning"}>
                            {sale.commissionStatus === "paid" ? "Paid Out" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Non-affiliate members — note about optional program */}
        {!dashboard.affiliateEnrolled && (
          <Card className="border-dashed">
            <CardContent className="py-6 px-8">
              <div className="flex items-start gap-4">
                <Zap className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Optional: Affiliate Partner Program</p>
                  <p className="text-sm text-muted-foreground">
                    You can optionally enroll in the Miitro affiliate program and earn a flat
                    commission on verified product purchases made through your affiliate link.
                    Participation is entirely voluntary and separate from your membership benefits.
                    Visit your member dashboard to enroll.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payout information */}
        {dashboard.affiliateEnrolled && <PayoutInfoSection />}

      </div>
    </AppLayout>
  );
}
