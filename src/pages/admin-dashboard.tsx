import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users, BookOpen, DollarSign, Calendar, Megaphone,
  Search, CheckCircle2, Clock, BarChart3, Shield,
  Star, Download, Eye, GraduationCap, CreditCard, Package, RefreshCw,
  Plus, Pencil, Trash2, Pin, Video, FileText,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminMember {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  vehicleType: string | null;
  membershipTier: string | null;
  // DB enum: "training" | "membership" | "bundle" | null (null = not yet purchased)
  productPurchased: "training" | "membership" | "bundle" | null;
  isFoundingMember: boolean;
  paymentStatus: string;        // "paid" | "unpaid"
  applicationStatus: string;    // "pending" | "approved" | "rejected"
  createdAt: string;
}

interface DriverDetailResponse {
  driver: AdminMember & {
    referralCode: string;
    totalReferrals: number;
    pendingRewards: number;
    paidRewards: number;
    welcomeEmailSent: boolean;
    welcomeEmailSentAt: string | null;
  };
  payment?: {
    id: number;
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
  };
}

interface AdminCommission {
  id: number;
  affiliateUserName: string;
  affiliateUserEmail: string;
  buyerUserName: string;
  product: string;
  commissionAmount: number;
  status: string;
  saleVerifiedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface AdminAnnouncement {
  id: number;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isPublished: boolean;
  isPinned: boolean;
  publishedAt: string;
  expiresAt: string | null;
  createdAt: string;
}

interface AdminEvent {
  id: number;
  title: string;
  description: string | null;
  eventType: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  joinUrl: string | null;
  recordingUrl: string | null;
  hostName: string | null;
  hostTitle: string | null;
  requiredTier: string;
  maxAttendees: number | null;
  tags: string | null;
  createdAt: string;
}

interface AdminTrainingModule {
  id: number;
  title: string;
  description: string | null;
  moduleType: string;
  status: string;
  sectionTitle: string | null;
  orderIndex: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
  requiredTier: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Filter types ─────────────────────────────────────────────────────────────
//
// MemberFilter  — status/payment/lifecycle dimension
// ProductFilter — product purchased dimension (independent, combinable)
//
// ProductFilter field mapping (DB enum value → filter value):
//   "training"   → productPurchased === "training"   (Training program only)
//   "membership" → productPurchased === "membership" (Membership only)
//   "bundle"     → productPurchased === "bundle"     (Training + Membership bundle)
//   "all"        → no product restriction (includes null/unpurchased)
//
// The two filters combine: a member must satisfy BOTH to appear in the list.

type MemberFilter  = "all" | "paidActive" | "unpaid" | "pending" | "founding";
type ProductFilter = "all" | "training" | "membership" | "bundle";
type CommissionFilter = "all" | "pending" | "approved" | "paidOut";

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "overview" | "members" | "commissions" | "training" | "events" | "announcements";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "overview",       label: "Overview",       icon: BarChart3  },
  { key: "members",        label: "Members",         icon: Users      },
  { key: "commissions",    label: "Commissions",     icon: DollarSign },
  { key: "training",       label: "Training",        icon: BookOpen   },
  { key: "events",         label: "Events",          icon: Calendar   },
  { key: "announcements",  label: "Announcements",   icon: Megaphone  },
];

// ─── Navigation callback ──────────────────────────────────────────────────────
//
// Clicking a status card resets productFilter to "all" (pass no productFilter arg).
// Clicking a product card sets memberFilter to "all" and productFilter to the product.

type AnyFilter = MemberFilter | CommissionFilter;
type NavigateFn = (tab: Tab, filter?: AnyFilter, productFilter?: ProductFilter) => void;

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip<T extends string>({
  value,
  active,
  label,
  onClick,
}: {
  value: T;
  active: boolean;
  label: string;
  onClick: (v: T) => void;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`h-8 px-3 text-sm rounded-full border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-input hover:text-foreground hover:border-foreground/30"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Client-side filter helpers ───────────────────────────────────────────────
//
// These helpers make the filter pipeline explicit and easy to upgrade to
// server-side params later — just replace the client filter with an API param.

function applyStatusFilter(list: AdminMember[], filter: MemberFilter): AdminMember[] {
  switch (filter) {
    case "founding": return list.filter((m) => m.isFoundingMember);
    case "pending":  return list.filter((m) => m.applicationStatus === "pending");
    default:         return list;  // "all", "paidActive", "unpaid" handled server-side
  }
}

function applyProductFilter(list: AdminMember[], filter: ProductFilter): AdminMember[] {
  if (filter === "all") return list;
  // Exact match on the DB enum string (all lowercase, null-safe)
  return list.filter((m) => m.productPurchased === filter);
}

// Derive the ?paymentStatus= API param from the status filter.
// Non-server-side filters (founding, pending, all) fetch without a payment filter
// so the full dataset is available for client-side post-processing.
function memberApiParam(filter: MemberFilter): string | null {
  switch (filter) {
    case "paidActive": return "paid";
    case "unpaid":     return "unpaid";
    default:           return null;
  }
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ onNavigate }: { onNavigate: NavigateFn }) {
  const { data: stats, isLoading } = useQuery<Record<string, number>>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const statusCards: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    tab: Tab;
    filter: AnyFilter;
    productFilter?: ProductFilter;
  }[] = [
    { label: "Total Members",     value: stats?.totalDrivers ?? 0,                  icon: Users,        color: "text-primary",     tab: "members",     filter: "all"       },
    { label: "Paid / Active",     value: stats?.paidDrivers ?? 0,                   icon: CheckCircle2, color: "text-emerald-600", tab: "members",     filter: "paidActive" },
    { label: "Unpaid",            value: stats?.unpaidDrivers ?? 0,                 icon: Clock,        color: "text-amber-600",   tab: "members",     filter: "unpaid"    },
    { label: "Founding Members",  value: stats?.foundingMembers ?? 0,               icon: Star,         color: "text-amber-500",   tab: "members",     filter: "founding"  },
    { label: "Total Commissions", value: formatCurrency(stats?.totalCommissions ?? 0), icon: DollarSign, color: "text-primary",     tab: "commissions", filter: "all"       },
    { label: "Pending",           value: formatCurrency(stats?.pendingCommissions ?? 0), icon: Clock,   color: "text-amber-600",   tab: "commissions", filter: "pending"   },
    { label: "Approved",          value: formatCurrency(stats?.approvedCommissions ?? 0), icon: CheckCircle2, color: "text-sky-600", tab: "commissions", filter: "approved" },
    { label: "Paid Out",          value: formatCurrency(stats?.paidCommissionsTotal ?? 0), icon: Shield, color: "text-emerald-600", tab: "commissions", filter: "paidOut"   },
  ];

  // Product cards — navigate to members tab with productFilter set, memberFilter reset to "all"
  const productCards: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    iconBg: string;
    product: ProductFilter;
    description: string;
  }[] = [
    {
      label: "Training",
      value: stats?.trainingMembers ?? 0,
      icon: GraduationCap,
      color: "text-violet-700",
      iconBg: "bg-violet-50",
      product: "training",
      description: "Training program only",
    },
    {
      label: "Membership",
      value: stats?.membershipMembers ?? 0,
      icon: CreditCard,
      color: "text-sky-700",
      iconBg: "bg-sky-50",
      product: "membership",
      description: "Membership only",
    },
    {
      label: "Bundle",
      value: stats?.bundleMembers ?? 0,
      icon: Package,
      color: "text-emerald-700",
      iconBg: "bg-emerald-50",
      product: "bundle",
      description: "Training + Membership",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status / commission cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCards.map(({ label, value, icon: Icon, color, tab, filter, productFilter }) => (
          <button
            key={label}
            onClick={() => onNavigate(tab, filter, productFilter)}
            className="text-left rounded-xl ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
            aria-label={`View ${label}`}
          >
            <Card className="h-full transition-all duration-150 group-hover:shadow-md group-hover:border-primary/30 group-hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="pt-5 pb-4">
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                <p className="text-[10px] text-primary/50 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view →
                </p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Product breakdown — accurate counts from DB, not paginated */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Members by Product
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {productCards.map(({ label, value, icon: Icon, color, iconBg, product, description }) => (
            <button
              key={label}
              onClick={() => onNavigate("members", "all", product)}
              className="text-left rounded-xl ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
              aria-label={`View ${label} members`}
            >
              <Card className="h-full transition-all duration-150 group-hover:shadow-md group-hover:border-primary/30 group-hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="pt-4 pb-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <p className="ml-auto text-[10px] text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity self-end pb-0.5">
                    Filter →
                  </p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Member details sheet ─────────────────────────────────────────────────────

function MemberDetailsSheet({
  memberId,
  onClose,
}: {
  memberId: number | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery<DriverDetailResponse>({
    queryKey: ["admin-driver-detail", memberId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/drivers/${memberId}`);
      if (!res.ok) throw new Error("Failed to load driver details");
      return res.json();
    },
    enabled: memberId !== null,
  });

  const driver  = data?.driver;
  const payment = data?.payment;

  const appLabel = (s?: string) =>
    s === "approved" ? "Approved" : s === "rejected" ? "Suspended" : "Pending";
  const appColor = (s?: string) =>
    s === "approved"
      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : s === "rejected"
      ? "bg-red-100 text-red-700 border-red-300"
      : "bg-amber-100 text-amber-700 border-amber-300";

  const PRODUCT_LABEL: Record<string, string> = {
    training:   "Training",
    membership: "Membership",
    bundle:     "Bundle (Training + Membership)",
  };

  return (
    <Sheet open={memberId !== null} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[440px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Member Details</SheetTitle>
          <SheetDescription>Full profile and payment information.</SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {driver && (
          <div className="space-y-5">
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Identity</h3>
              <div className="grid gap-1.5">
                <Row label="Name"     value={driver.fullName} />
                <Row label="Email"    value={driver.email} />
                <Row label="Phone"    value={driver.phone ?? "—"} />
                <Row label="Location" value={[driver.city, driver.state].filter(Boolean).join(", ") || "—"} />
                <Row label="Vehicle"  value={driver.vehicleType ?? "—"} />
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={appColor(driver.applicationStatus)}>{appLabel(driver.applicationStatus)}</Badge>
                <Badge className={driver.paymentStatus === "paid" ? "bg-sky-100 text-sky-700 border-sky-300" : "bg-zinc-100 text-zinc-600 border-zinc-300"}>
                  {driver.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                </Badge>
                {driver.isFoundingMember && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300">⭐ Founding</Badge>
                )}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Package</h3>
              <div className="grid gap-1.5">
                <Row label="Product" value={driver.productPurchased ? PRODUCT_LABEL[driver.productPurchased] ?? driver.productPurchased : "—"} />
                <Row label="Tier"    value={driver.membershipTier ?? "—"} capitalize />
              </div>
            </section>

            {payment && (
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment Record</h3>
                <div className="grid gap-1.5">
                  <Row label="Amount"  value={`${payment.currency.toUpperCase()} ${formatCurrency(payment.amount)}`} />
                  <Row label="Status"  value={payment.status} capitalize />
                  <Row label="Paid at" value={payment.paidAt ? formatDate(payment.paidAt) : "—"} />
                </div>
              </section>
            )}

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Referrals</h3>
              <div className="grid gap-1.5">
                <Row label="Total"           value={String(driver.totalReferrals)} />
                <Row label="Pending rewards" value={formatCurrency(driver.pendingRewards)} />
                <Row label="Paid rewards"    value={formatCurrency(driver.paidRewards)} />
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</h3>
              <div className="grid gap-1.5">
                <Row label="Referral code" value={driver.referralCode} />
                <Row label="Joined"        value={formatDate(driver.createdAt)} />
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Access & Onboarding</h3>
              <div className="grid gap-1.5">
                <div className="flex justify-between text-sm py-0.5">
                  <span className="text-muted-foreground">Training</span>
                  <span className={driver.paymentStatus === "paid" ? "text-green-600 font-medium" : "text-zinc-400"}>
                    {driver.paymentStatus === "paid" ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-0.5">
                  <span className="text-muted-foreground">Welcome email</span>
                  <span className={driver.welcomeEmailSent ? "text-green-600 font-medium" : "text-amber-600"}>
                    {driver.welcomeEmailSent
                      ? driver.welcomeEmailSentAt
                        ? `Sent ${formatDate(driver.welcomeEmailSentAt)}`
                        : "Sent"
                      : "Not sent"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`font-medium text-right ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}

// ─── Members tab ──────────────────────────────────────────────────────────────

function MembersTab({
  filter,
  onFilterChange,
  productFilter,
  onProductFilterChange,
  search,
  onSearchChange,
}: {
  filter: MemberFilter;
  onFilterChange: (f: MemberFilter) => void;
  productFilter: ProductFilter;
  onProductFilterChange: (f: ProductFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const paymentParam = memberApiParam(filter);

  // Fetch with limit=200 so client-side product/status post-filters have a meaningful dataset.
  // Upgrade path: add ?productPurchased= param to the API to do this server-side.
  const { data, isLoading } = useQuery({
    queryKey: ["admin-members", search, paymentParam],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", "200");
      if (search)       params.set("search", search);
      if (paymentParam) params.set("paymentStatus", paymentParam);
      const res = await fetch(`/api/admin/drivers?${params}`);
      if (!res.ok) throw new Error("Failed to load members");
      return res.json();
    },
  });

  const rawList: AdminMember[] = Array.isArray(data) ? data : (data?.drivers ?? []);

  // Two-stage filter pipeline:
  //   1. Status post-filter (founding/pending are client-side; paid/unpaid are already filtered by API)
  //   2. Product filter (always client-side for now)
  const statusFilteredList = applyStatusFilter(rawList, filter);
  const memberList         = applyProductFilter(statusFilteredList, productFilter);

  // ── Mutations ────────────────────────────────────────────────────────────────

  function makeMutation(path: string, successMsg: string) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation({
      mutationFn: async (id: number) => {
        const res = await fetch(`/api/admin/drivers/${id}/${path}`, { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || "Request failed");
        }
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-members"] });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        queryClient.invalidateQueries({ queryKey: ["admin-driver-detail"] });
        toast({ title: successMsg });
      },
      onError: (err: Error) =>
        toast({ variant: "destructive", title: "Action failed", description: err.message }),
    });
  }

  const approveMutation    = makeMutation("approve",     "Driver approved");
  const suspendMutation    = makeMutation("suspend",     "Driver suspended");
  const markPaidMutation   = makeMutation("mark-paid",   "Driver marked as paid");
  const markUnpaidMutation = makeMutation("mark-unpaid", "Driver marked as unpaid");

  const anyPending =
    approveMutation.isPending || suspendMutation.isPending ||
    markPaidMutation.isPending || markUnpaidMutation.isPending;

  // ── Filter definitions ────────────────────────────────────────────────────────

  const STATUS_FILTERS: { value: MemberFilter; label: string }[] = [
    { value: "all",        label: "All Members"   },
    { value: "paidActive", label: "Paid / Active" },
    { value: "unpaid",     label: "Unpaid"        },
    { value: "pending",    label: "Pending Apps"  },
    { value: "founding",   label: "⭐ Founding"   },
  ];

  const PRODUCT_FILTERS: { value: ProductFilter; label: string }[] = [
    { value: "all",        label: "All Products" },
    { value: "training",   label: "Training"     },
    { value: "membership", label: "Membership"   },
    { value: "bundle",     label: "Bundle"       },
  ];

  const PRODUCT_LABEL: Record<string, string> = {
    training:   "Training",
    membership: "Membership",
    bundle:     "Bundle",
  };

  return (
    <>
      <div className="space-y-4">

        {/* ── Status filter row ─────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-muted-foreground font-medium mr-1">Status:</span>
          {STATUS_FILTERS.map(({ value, label }) => (
            <FilterChip
              key={value}
              value={value}
              active={filter === value}
              label={label}
              onClick={onFilterChange}
            />
          ))}
        </div>

        {/* ── Product filter row ────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-muted-foreground font-medium mr-1">Product:</span>
          {PRODUCT_FILTERS.map(({ value, label }) => (
            <FilterChip
              key={value}
              value={value}
              active={productFilter === value}
              label={label}
              onClick={onProductFilterChange}
            />
          ))}
          <div className="flex-1" />
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9 h-8 text-sm"
            />
          </div>
          <a href="/api/admin/export/drivers" download>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </Button>
          </a>
        </div>

        {/* ── Active filter summary ─────────────────────────────────────────── */}
        {(filter !== "all" || productFilter !== "all") && (
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{memberList.length}</span> member{memberList.length !== 1 ? "s" : ""}
            {filter !== "all" && <> · Status: <span className="font-medium">{STATUS_FILTERS.find(f => f.value === filter)?.label}</span></>}
            {productFilter !== "all" && <> · Product: <span className="font-medium">{PRODUCT_FILTERS.find(f => f.value === productFilter)?.label}</span></>}
          </p>
        )}

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Founding</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No members found
                      {(filter !== "all" || productFilter !== "all") && (
                        <span className="block text-xs mt-1 opacity-70">Try adjusting the filters above</span>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  memberList.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.fullName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{m.email}</TableCell>
                      <TableCell>
                        {m.productPurchased ? (
                          <Badge variant="secondary" className="capitalize text-xs">
                            {PRODUCT_LABEL[m.productPurchased] ?? m.productPurchased}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            m.applicationStatus === "approved"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                              : m.applicationStatus === "rejected"
                              ? "bg-red-100 text-red-700 border-red-300"
                              : "bg-amber-100 text-amber-700 border-amber-300"
                          }
                        >
                          {m.applicationStatus === "approved" ? "Approved"
                            : m.applicationStatus === "rejected" ? "Suspended"
                            : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            m.paymentStatus === "paid"
                              ? "bg-sky-100 text-sky-700 border-sky-300"
                              : "bg-zinc-100 text-zinc-600 border-zinc-300"
                          }
                        >
                          {m.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell>{m.isFoundingMember ? "⭐" : "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(m.createdAt)}</TableCell>
                      <TableCell>
                        <MemberActions
                          member={m}
                          disabled={anyPending}
                          onApprove={()    => approveMutation.mutate(m.id)}
                          onSuspend={()    => suspendMutation.mutate(m.id)}
                          onMarkPaid={()   => markPaidMutation.mutate(m.id)}
                          onMarkUnpaid={() => markUnpaidMutation.mutate(m.id)}
                          onView={()       => setSelectedMemberId(m.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <MemberDetailsSheet
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
      />
    </>
  );
}

// ─── Member actions cell ──────────────────────────────────────────────────────
//
// "Suspend" UI label → DB applicationStatus = "rejected" (no separate suspended enum)
// State → available buttons:
//   pending              → Approve
//   approved + unpaid    → Mark Paid · Suspend
//   approved + paid      → Mark Unpaid · Suspend
//   rejected (suspended) → Approve
//
// Suspend and Mark Unpaid always require confirmation (destructive).
// Approve and Mark Paid show confirmation dialogs too (preferred).

interface PendingConfirm {
  title: string;
  description: string;
  confirmLabel: string;
  destructive: boolean;
  onConfirm: () => void;
}

function MemberActions({
  member, disabled,
  onApprove, onSuspend, onMarkPaid, onMarkUnpaid, onView,
}: {
  member: AdminMember;
  disabled: boolean;
  onApprove: () => void;
  onSuspend: () => void;
  onMarkPaid: () => void;
  onMarkUnpaid: () => void;
  onView: () => void;
}) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const { applicationStatus: app, paymentStatus: pay } = member;
  const isApproved  = app === "approved";
  const notApproved = app === "pending" || app === "rejected";

  const confirm = (cfg: PendingConfirm) => setPending(cfg);
  const dismiss = () => setPending(null);
  const execute = () => { pending?.onConfirm(); dismiss(); };

  return (
    <>
      <div className="flex items-center gap-1 flex-nowrap">
        {notApproved && (
          <Button size="sm" variant="outline"
            className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            disabled={disabled}
            onClick={() => confirm({
              title: "Approve member?",
              description: `Approve ${member.fullName}. They will be granted access to their purchased content.`,
              confirmLabel: "Approve",
              destructive: false,
              onConfirm: onApprove,
            })}>
            Approve
          </Button>
        )}
        {isApproved && pay === "unpaid" && (
          <Button size="sm" variant="outline"
            className="h-7 text-xs border-sky-300 text-sky-700 hover:bg-sky-50"
            disabled={disabled}
            onClick={() => confirm({
              title: "Mark as paid?",
              description: `Mark ${member.fullName}'s payment status as paid. Use this to manually record an offline or verified payment.`,
              confirmLabel: "Mark Paid",
              destructive: false,
              onConfirm: onMarkPaid,
            })}>
            Mark Paid
          </Button>
        )}
        {isApproved && pay === "paid" && (
          <Button size="sm" variant="outline"
            className="h-7 text-xs"
            disabled={disabled}
            onClick={() => confirm({
              title: "Mark as unpaid?",
              description: `Mark ${member.fullName}'s payment status as unpaid. Their access may be affected depending on platform rules.`,
              confirmLabel: "Mark Unpaid",
              destructive: true,
              onConfirm: onMarkUnpaid,
            })}>
            Mark Unpaid
          </Button>
        )}
        {isApproved && (
          <Button size="sm" variant="outline"
            className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
            disabled={disabled}
            onClick={() => confirm({
              title: "Suspend member?",
              description: `Suspend ${member.fullName}. Their application status will be set to suspended and access will be revoked.`,
              confirmLabel: "Suspend",
              destructive: true,
              onConfirm: onSuspend,
            })}>
            Suspend
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
          onClick={onView} aria-label="View details">
          <Eye className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Confirmation dialog — rendered per-row so each row manages its own state */}
      <AlertDialog open={!!pending} onOpenChange={(open) => { if (!open) dismiss(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pending?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={execute}
              className={pending?.destructive
                ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
                : undefined}
            >
              {pending?.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Commissions tab ──────────────────────────────────────────────────────────

function CommissionsTab({
  statusFilter,
  onStatusFilterChange,
}: {
  statusFilter: CommissionFilter;
  onStatusFilterChange: (f: CommissionFilter) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allCommissions = [], isLoading } = useQuery<AdminCommission[]>({
    queryKey: ["admin-commissions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/commissions");
      if (!res.ok) throw new Error("Failed to load commissions");
      return res.json();
    },
  });

  const dbStatus: Record<CommissionFilter, string | null> = {
    all: null, pending: "pending", approved: "approved", paidOut: "paid",
  };

  const commissions = statusFilter === "all"
    ? allCommissions
    : allCommissions.filter((c) => c.status === dbStatus[statusFilter]);

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/commissions/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Commission approved" });
    },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/commissions/${id}/mark-paid`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to mark paid");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Commission marked as paid" });
    },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const STATUS_COLOR: Record<string, string> = {
    pending:  "bg-amber-100 text-amber-700 border-amber-300",
    approved: "bg-sky-100 text-sky-700 border-sky-300",
    paid:     "bg-emerald-100 text-emerald-700 border-emerald-300",
  };

  const COMMISSION_FILTERS: { value: CommissionFilter; label: string }[] = [
    { value: "all", label: "All" }, { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" }, { value: "paidOut", label: "Paid Out" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center">
        {COMMISSION_FILTERS.map(({ value, label }) => (
          <FilterChip key={value} value={value} active={statusFilter === value} label={label} onClick={onStatusFilterChange} />
        ))}
        <div className="flex-1" />
        <p className="text-sm text-muted-foreground">
          {commissions.length} record{commissions.length !== 1 ? "s" : ""}
        </p>
        <a href="/api/admin/export/commissions" download>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" /> Export CSV</Button>
        </a>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead><TableHead>Buyer</TableHead>
                <TableHead>Product</TableHead><TableHead>Amount</TableHead>
                <TableHead>Status</TableHead><TableHead>Sale Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No commissions{statusFilter !== "all" ? ` matching "${statusFilter}"` : ""} yet
                  </TableCell>
                </TableRow>
              ) : (
                commissions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{c.affiliateUserName}</p>
                      <p className="text-xs text-muted-foreground">{c.affiliateUserEmail}</p>
                    </TableCell>
                    <TableCell className="text-sm">{c.buyerUserName}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize text-xs">{c.product}</Badge></TableCell>
                    <TableCell className="font-semibold text-emerald-700">{formatCurrency(c.commissionAmount)}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${STATUS_COLOR[c.status] ?? ""}`}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.saleVerifiedAt ? formatDate(c.saleVerifiedAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {c.status === "pending" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => approveMutation.mutate(c.id)} disabled={approveMutation.isPending}>
                            Approve
                          </Button>
                        )}
                        {c.status === "approved" && (
                          <Button size="sm" className="h-7 text-xs"
                            onClick={() => markPaidMutation.mutate(c.id)} disabled={markPaidMutation.isPending}>
                            Mark Paid
                          </Button>
                        )}
                        {c.status === "paid" && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function toDatetimeLocal(dt: string | null | undefined): string {
  if (!dt) return "";
  try { return new Date(dt).toISOString().slice(0, 16); } catch { return ""; }
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <Badge className={published
      ? "bg-emerald-100 text-emerald-700 border-emerald-300 text-xs"
      : "bg-slate-100 text-slate-600 border-slate-300 text-xs"
    }>
      {published ? "Published" : "Draft"}
    </Badge>
  );
}

// ─── Announcements tab ────────────────────────────────────────────────────────

const EMPTY_ANN = { title: "", body: "", ctaLabel: "", ctaUrl: "", isPublished: true, isPinned: false };

function AnnouncementsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAnnouncement | null>(null);
  const [form, setForm] = useState(EMPTY_ANN);
  const [deleteTarget, setDeleteTarget] = useState<AdminAnnouncement | null>(null);

  const { data: items = [], isLoading } = useQuery<AdminAnnouncement[]>({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const res = await fetch("/api/admin/announcements");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_ANN); setSheetOpen(true); };
  const openEdit = (a: AdminAnnouncement) => {
    setEditing(a);
    setForm({ title: a.title, body: a.body, ctaLabel: a.ctaLabel ?? "", ctaUrl: a.ctaUrl ?? "", isPublished: a.isPublished, isPinned: a.isPinned });
    setSheetOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/admin/announcements/${editing.id}` : "/api/admin/announcements";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, ctaLabel: form.ctaLabel || null, ctaUrl: form.ctaUrl || null }) });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error((b as any).message ?? `HTTP ${res.status}`); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-announcements"] }); setSheetOpen(false); toast({ title: editing ? "Announcement updated" : "Announcement created" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const togglePublish = useMutation({
    mutationFn: async (a: AdminAnnouncement) => {
      const res = await fetch(`/api/admin/announcements/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !a.isPublished }) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-announcements"] }); toast({ title: "Status updated" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-announcements"] }); setDeleteTarget(null); toast({ title: "Deleted" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} announcement{items.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1.5" /> New Announcement</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Body (preview)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pinned</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No announcements yet — create one above.</TableCell></TableRow>
              ) : items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-sm max-w-[180px] truncate">{a.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">{a.body}</TableCell>
                  <TableCell>
                    <button onClick={() => togglePublish.mutate(a)} disabled={togglePublish.isPending} className="focus:outline-none">
                      <StatusBadge published={a.isPublished} />
                    </button>
                  </TableCell>
                  <TableCell>
                    {a.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(a)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(a)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Announcement" : "New Announcement"}</SheetTitle>
            <SheetDescription>Fill in the details below. Click Save when done.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            <FormRow label="Title *">
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Platform Update — April 2025" />
            </FormRow>
            <FormRow label="Body *">
              <Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={5} placeholder="Announcement message visible to members…" />
            </FormRow>
            <FormRow label="CTA Button Label (optional)">
              <Input value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} placeholder="e.g. Learn More" />
            </FormRow>
            <FormRow label="CTA URL (optional)">
              <Input value={form.ctaUrl} onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))} placeholder="https://…" />
            </FormRow>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div><p className="text-sm font-medium">Published</p><p className="text-xs text-muted-foreground">Visible to members when enabled</p></div>
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm((f) => ({ ...f, isPublished: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div><p className="text-sm font-medium">Pinned</p><p className="text-xs text-muted-foreground">Pinned announcements appear at the top</p></div>
              <Switch checked={form.isPinned} onCheckedChange={(v) => setForm((f) => ({ ...f, isPinned: v }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title.trim() || !form.body.trim()}>
                {saveMutation.isPending ? "Saving…" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTarget?.title}" will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Events tab ───────────────────────────────────────────────────────────────

const EMPTY_EVENT = {
  title: "", description: "", eventType: "zoom_coaching", status: "upcoming",
  scheduledAt: "", durationMinutes: "60", timezone: "America/New_York",
  joinUrl: "", recordingUrl: "", hostName: "", hostTitle: "",
  requiredTier: "starter", maxAttendees: "", tags: "",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  zoom_coaching: "Zoom Coaching", webinar: "Webinar",
  community_call: "Community Call", qa_session: "Q&A Session", other: "Other",
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-sky-100 text-sky-700 border-sky-300",
  live: "bg-emerald-100 text-emerald-700 border-emerald-300",
  completed: "bg-slate-100 text-slate-600 border-slate-300",
  cancelled: "bg-red-100 text-red-600 border-red-300",
};

function EventsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [form, setForm] = useState(EMPTY_EVENT);
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);

  const { data: items = [], isLoading } = useQuery<AdminEvent[]>({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("Failed to load events");
      return res.json();
    },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_EVENT); setSheetOpen(true); };
  const openEdit = (e: AdminEvent) => {
    setEditing(e);
    setForm({
      title: e.title, description: e.description ?? "", eventType: e.eventType,
      status: e.status, scheduledAt: toDatetimeLocal(e.scheduledAt),
      durationMinutes: String(e.durationMinutes), timezone: e.timezone,
      joinUrl: e.joinUrl ?? "", recordingUrl: e.recordingUrl ?? "",
      hostName: e.hostName ?? "", hostTitle: e.hostTitle ?? "",
      requiredTier: e.requiredTier, maxAttendees: e.maxAttendees ? String(e.maxAttendees) : "",
      tags: e.tags ?? "",
    });
    setSheetOpen(true);
  };

  const fv = (k: keyof typeof EMPTY_EVENT) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/admin/events/${editing.id}` : "/api/admin/events";
      const method = editing ? "PUT" : "POST";
      const payload = {
        ...form,
        description: form.description || null,
        joinUrl: form.joinUrl || null,
        recordingUrl: form.recordingUrl || null,
        hostName: form.hostName || null,
        hostTitle: form.hostTitle || null,
        maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees, 10) : null,
        tags: form.tags || null,
        durationMinutes: parseInt(form.durationMinutes, 10),
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error((b as any).message ?? `HTTP ${res.status}`); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-events"] }); setSheetOpen(false); toast({ title: editing ? "Event updated" : "Event created" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-events"] }); setDeleteTarget(null); toast({ title: "Event deleted" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} event{items.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1.5" /> New Event</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No events yet — create one above.</TableCell></TableRow>
              ) : items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium text-sm max-w-[200px] truncate">{e.title}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs capitalize">{EVENT_TYPE_LABELS[e.eventType] ?? e.eventType}</Badge></TableCell>
                  <TableCell><Badge className={`text-xs ${EVENT_STATUS_COLORS[e.status] ?? ""}`}>{e.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(e.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.hostName ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(e)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(e)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Event" : "New Event"}</SheetTitle>
            <SheetDescription>Fill in event details. Click Save when done.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <FormRow label="Title *">
              <Input value={form.title} onChange={(e) => fv("title")(e.target.value)} placeholder="e.g. Monthly Driver Q&A" />
            </FormRow>
            <FormRow label="Description">
              <Textarea value={form.description} onChange={(e) => fv("description")(e.target.value)} rows={3} placeholder="What will this event cover?" />
            </FormRow>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Event Type">
                <Select value={form.eventType} onValueChange={fv("eventType")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label="Status">
                <Select value={form.status} onValueChange={fv("status")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["upcoming", "live", "completed", "cancelled"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormRow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Date & Time *">
                <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => fv("scheduledAt")(e.target.value)} />
              </FormRow>
              <FormRow label="Duration (min)">
                <Input type="number" value={form.durationMinutes} onChange={(e) => fv("durationMinutes")(e.target.value)} min={15} step={15} />
              </FormRow>
            </div>
            <FormRow label="Timezone">
              <Input value={form.timezone} onChange={(e) => fv("timezone")(e.target.value)} placeholder="America/New_York" />
            </FormRow>
            <FormRow label="Join URL (Zoom / Meet link)">
              <Input value={form.joinUrl} onChange={(e) => fv("joinUrl")(e.target.value)} placeholder="https://zoom.us/j/…" />
            </FormRow>
            <FormRow label="Recording URL (post-event)">
              <Input value={form.recordingUrl} onChange={(e) => fv("recordingUrl")(e.target.value)} placeholder="https://…" />
            </FormRow>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Host Name">
                <Input value={form.hostName} onChange={(e) => fv("hostName")(e.target.value)} placeholder="Jane Smith" />
              </FormRow>
              <FormRow label="Host Title">
                <Input value={form.hostTitle} onChange={(e) => fv("hostTitle")(e.target.value)} placeholder="Co-Founder, Miitro" />
              </FormRow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Required Tier">
                <Select value={form.requiredTier} onValueChange={fv("requiredTier")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["starter", "builder", "elite"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label="Max Attendees">
                <Input type="number" value={form.maxAttendees} onChange={(e) => fv("maxAttendees")(e.target.value)} placeholder="Unlimited" min={1} />
              </FormRow>
            </div>
            <FormRow label="Tags (comma-separated)">
              <Input value={form.tags} onChange={(e) => fv("tags")(e.target.value)} placeholder="onboarding, earnings, Q&A" />
            </FormRow>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title.trim() || !form.scheduledAt}>
                {saveMutation.isPending ? "Saving…" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTarget?.title}" will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Training tab ─────────────────────────────────────────────────────────────

const EMPTY_MODULE = {
  title: "", description: "", moduleType: "video", status: "draft",
  sectionTitle: "", orderIndex: "0", videoUrl: "", pdfUrl: "",
  thumbnailUrl: "", durationMinutes: "", requiredTier: "starter", isLocked: false,
};

const MODULE_STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700 border-emerald-300",
  draft: "bg-amber-100 text-amber-700 border-amber-300",
  archived: "bg-slate-100 text-slate-600 border-slate-300",
};

const MODULE_TYPE_ICONS: Record<string, React.ElementType> = {
  video: Video, pdf: FileText, quiz: GraduationCap, live: Calendar,
};

function TrainingTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTrainingModule | null>(null);
  const [form, setForm] = useState(EMPTY_MODULE);
  const [deleteTarget, setDeleteTarget] = useState<AdminTrainingModule | null>(null);

  const { data: items = [], isLoading } = useQuery<AdminTrainingModule[]>({
    queryKey: ["admin-training"],
    queryFn: async () => {
      const res = await fetch("/api/admin/training");
      if (!res.ok) throw new Error("Failed to load modules");
      return res.json();
    },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_MODULE); setSheetOpen(true); };
  const openEdit = (m: AdminTrainingModule) => {
    setEditing(m);
    setForm({
      title: m.title, description: m.description ?? "", moduleType: m.moduleType,
      status: m.status, sectionTitle: m.sectionTitle ?? "",
      orderIndex: String(m.orderIndex), videoUrl: m.videoUrl ?? "",
      pdfUrl: m.pdfUrl ?? "", thumbnailUrl: m.thumbnailUrl ?? "",
      durationMinutes: m.durationMinutes ? String(m.durationMinutes) : "",
      requiredTier: m.requiredTier, isLocked: m.isLocked,
    });
    setSheetOpen(true);
  };

  const fv = (k: keyof typeof EMPTY_MODULE) => (v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/admin/training/${editing.id}` : "/api/admin/training";
      const method = editing ? "PUT" : "POST";
      const payload = {
        ...form,
        description: form.description || null,
        sectionTitle: form.sectionTitle || null,
        videoUrl: form.videoUrl || null,
        pdfUrl: form.pdfUrl || null,
        thumbnailUrl: form.thumbnailUrl || null,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes, 10) : null,
        orderIndex: parseInt(form.orderIndex, 10),
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error((b as any).message ?? `HTTP ${res.status}`); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-training"] }); setSheetOpen(false); toast({ title: editing ? "Module updated" : "Module created" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const toggleStatus = useMutation({
    mutationFn: async (m: AdminTrainingModule) => {
      const next = m.status === "published" ? "draft" : "published";
      const res = await fetch(`/api/admin/training/${m.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-training"] }); toast({ title: "Status updated" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/training/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-training"] }); setDeleteTarget(null); toast({ title: "Module deleted" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} module{items.length !== 1 ? "s" : ""} · <span className="text-emerald-600">{items.filter((m) => m.status === "published").length} published</span></p>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1.5" /> New Module</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No training modules yet — create one above.</TableCell></TableRow>
              ) : items.map((m) => {
                const TypeIcon = MODULE_TYPE_ICONS[m.moduleType] ?? BookOpen;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs text-muted-foreground font-mono">{m.orderIndex}</TableCell>
                    <TableCell className="font-medium text-sm max-w-[200px]">
                      <div className="truncate">{m.title}</div>
                      {m.isLocked && <span className="text-xs text-amber-600">🔒 Locked</span>}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                        <TypeIcon className="w-3.5 h-3.5" />{m.moduleType}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{m.sectionTitle ?? "—"}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleStatus.mutate(m)} disabled={toggleStatus.isPending} className="focus:outline-none">
                        <Badge className={`text-xs ${MODULE_STATUS_COLORS[m.status] ?? ""}`}>{m.status}</Badge>
                      </button>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{m.requiredTier}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(m)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(m)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Module" : "New Training Module"}</SheetTitle>
            <SheetDescription>Configure training module details. Quiz content is managed via code.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <FormRow label="Title *">
              <Input value={form.title} onChange={(e) => fv("title")(e.target.value)} placeholder="e.g. Platform Walkthrough & Dashboard" />
            </FormRow>
            <FormRow label="Description / Summary">
              <Textarea value={form.description} onChange={(e) => fv("description")(e.target.value)} rows={3} placeholder="Brief overview of what this module covers…" />
            </FormRow>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Module Type">
                <Select value={form.moduleType} onValueChange={(v) => fv("moduleType")(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["video", "pdf", "quiz", "live"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label="Status">
                <Select value={form.status} onValueChange={(v) => fv("status")(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["draft", "published", "archived"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormRow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Section Title">
                <Input value={form.sectionTitle} onChange={(e) => fv("sectionTitle")(e.target.value)} placeholder="e.g. Getting Started" />
              </FormRow>
              <FormRow label="Order Index">
                <Input type="number" value={form.orderIndex} onChange={(e) => fv("orderIndex")(e.target.value)} min={0} />
              </FormRow>
            </div>
            <FormRow label="Video URL">
              <Input value={form.videoUrl} onChange={(e) => fv("videoUrl")(e.target.value)} placeholder="https://vimeo.com/…  or  https://youtube.com/…" />
            </FormRow>
            <FormRow label="PDF URL">
              <Input value={form.pdfUrl} onChange={(e) => fv("pdfUrl")(e.target.value)} placeholder="https://…/workbook.pdf" />
            </FormRow>
            <FormRow label="Thumbnail URL">
              <Input value={form.thumbnailUrl} onChange={(e) => fv("thumbnailUrl")(e.target.value)} placeholder="https://…/thumbnail.jpg" />
            </FormRow>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Duration (minutes)">
                <Input type="number" value={form.durationMinutes} onChange={(e) => fv("durationMinutes")(e.target.value)} min={1} placeholder="e.g. 20" />
              </FormRow>
              <FormRow label="Required Tier">
                <Select value={form.requiredTier} onValueChange={(v) => fv("requiredTier")(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["starter", "builder", "elite"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormRow>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div><p className="text-sm font-medium">Locked</p><p className="text-xs text-muted-foreground">Prevents access regardless of tier</p></div>
              <Switch checked={form.isLocked} onCheckedChange={(v) => fv("isLocked")(v)} />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800 font-medium">Quiz content note</p>
              <p className="text-xs text-amber-700 mt-0.5">Lesson sections and quiz questions are managed in <code>api-server/src/lib/training-content.ts</code> and keyed by order index.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title.trim()}>
                {saveMutation.isPending ? "Saving…" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete training module?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTarget?.title}" and all associated progress records will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Placeholder tab ──────────────────────────────────────────────────────────

function PlaceholderTab({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h3 className="text-lg font-semibold mb-2">{label} Management</h3>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm">
          Full admin tools for {label.toLowerCase()} are coming in the next update.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Admin dashboard (root) ───────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab,        setActiveTab]        = useState<Tab>("overview");
  const [memberFilter,     setMemberFilter]     = useState<MemberFilter>("all");
  const [productFilter,    setProductFilter]    = useState<ProductFilter>("all");
  const [commissionFilter, setCommissionFilter] = useState<CommissionFilter>("all");
  const [memberSearch,     setMemberSearch]     = useState("");

  // ── Dev-only: re-seed test driver accounts ───────────────────────────────────
  const reseedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/dev/reseed", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).message ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<{ message: string; accounts: { email: string; name: string; applicationStatus: string; paymentStatus: string }[]; password: string }>;
    },
    onSuccess: (data) => {
      // Bust any cached member/stats queries so the table reflects the fresh data
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      const rows = data.accounts.map(a => `${a.name} — ${a.applicationStatus}/${a.paymentStatus}`).join("\n");
      toast({ title: "Test drivers re-seeded", description: rows });
    },
    onError: (err: Error) => {
      toast({ title: "Reseed failed", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user)    { setLocation("/login");     return; }
    if (!isAdmin) { setLocation("/dashboard"); return; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, user, isAdmin]);

  if (isAuthLoading || !user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Navigation from overview cards.
  // Status card click: sets memberFilter, resets productFilter to "all" and search.
  // Product card click: sets productFilter, resets memberFilter to "all" and search.
  // Neither passes both — so clicking a status card always clears the product dimension.
  const handleNavigate: NavigateFn = (tab, filter, product) => {
    if (tab === "members") {
      setMemberFilter((filter as MemberFilter | undefined) ?? "all");
      setProductFilter(product ?? "all");
      setMemberSearch("");
    }
    if (tab === "commissions") {
      setCommissionFilter((filter as CommissionFilter | undefined) ?? "all");
    }
    setActiveTab(tab);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Miitro platform management</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Only rendered in development builds — never visible in production */}
            {import.meta.env.DEV && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => reseedMutation.mutate()}
                disabled={reseedMutation.isPending}
                className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${reseedMutation.isPending ? "animate-spin" : ""}`} />
                {reseedMutation.isPending ? "Reseeding…" : "Reseed Test Drivers"}
              </Button>
            )}
            <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 font-semibold">Admin</Badge>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap border-b border-border">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === key
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === "overview" && <OverviewTab onNavigate={handleNavigate} />}
          {activeTab === "members" && (
            <MembersTab
              filter={memberFilter}
              onFilterChange={setMemberFilter}
              productFilter={productFilter}
              onProductFilterChange={setProductFilter}
              search={memberSearch}
              onSearchChange={setMemberSearch}
            />
          )}
          {activeTab === "commissions" && (
            <CommissionsTab
              statusFilter={commissionFilter}
              onStatusFilterChange={setCommissionFilter}
            />
          )}
          {activeTab === "training"      && <TrainingTab />}
          {activeTab === "events"        && <EventsTab />}
          {activeTab === "announcements" && <AnnouncementsTab />}
        </div>

      </div>
    </AppLayout>
  );
}
