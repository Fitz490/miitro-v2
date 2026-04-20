import { apiFetch } from "@/lib/api-fetch";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BookOpen, Calendar, Star, Users, TrendingUp, Car, Trophy,
  CheckCircle2, Clock, ArrowRight, Zap, Shield, Megaphone,
  ChevronRight, Lock, Copy, DollarSign, Target, BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  member: {
    id: number;
    fullName: string;
    email: string;
    membershipTier: "starter" | "builder" | "elite";
    productPurchased: "training" | "membership" | "bundle" | null;
    isFoundingMember: boolean;
    paymentStatus: "paid" | "unpaid";
    createdAt: string;
  };
  training: {
    completedModules: number;
    inProgressModules: number;
    totalModules: number;
    completionPercent: number;
  };
  affiliate: {
    enrolled: boolean;
    affiliateCode: string | null;
    affiliateLink: string | null;
    totalSales: number;
    pendingCommissions: number;
    approvedCommissions: number;
    paidCommissions: number;
  };
  performance: {
    todayEarnings: number;
    todayTrips: number;
    weekEarnings: number;
    weekTrips: number;
    monthEarnings: number;
    monthTrips: number;
    totalEarnings: number;
    totalTrips: number;
    weeklyGoalTrips: number;
    weeklyGoalEarnings: number;
    monthlyGoalTrips: number;
    monthlyGoalEarnings: number;
    // Miitro-platform-specific metrics (same calendar windows)
    miitroWeekTrips: number;
    miitroWeekEarnings: number;
    miitroMonthTrips: number;
    miitroMonthEarnings: number;
  };
  activeGoals: {
    id: number;
    goalType: string;
    dateFrom: string;
    dateTo: string;
    tripGoal: number | null;
    earningsGoal: string | null;
    tripProgress: number;
    earningsProgress: number;
    daysRemaining: number;
  }[];
  upcomingEvents: {
    id: number;
    title: string;
    description: string | null;
    eventType: string;
    scheduledAt: string;
    durationMinutes: number;
    joinUrl: string | null;
    hostName: string | null;
  }[];
  announcements: {
    id: number;
    title: string;
    body: string;
    ctaLabel: string | null;
    ctaUrl: string | null;
    isPinned: boolean;
    publishedAt: string;
  }[];
}

// ─── Section: Pending review ──────────────────────────────────────────────────
// Shown when applicationStatus === "pending" regardless of paymentStatus.
// The member has registered but has not yet been approved by an admin.

function PendingScreen({ name }: { name: string }) {
  const firstName = name.split(" ")[0] || "there";
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Application under review</h1>
          <p className="text-muted-foreground leading-relaxed">
            Hi {firstName} — your Miitro application has been received and is currently
            being reviewed by our team. You'll receive an email once your account is approved.
          </p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-5 text-sm text-left space-y-2">
          <p className="font-semibold text-foreground">What happens next?</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> We verify your information</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> You receive an approval email</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> You can then complete enrollment and access your dashboard</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Questions? Contact us at{" "}
          <a href="mailto:support@miitro.com" className="underline underline-offset-2 hover:text-foreground">
            support@miitro.com
          </a>
        </p>
      </div>
    </AppLayout>
  );
}

// ─── Section: Suspended ────────────────────────────────────────────────────────
// Shown when applicationStatus === "rejected".
// "rejected" is the DB value; the UI presents this as "suspended / account unavailable"
// to avoid the negative connotation of "rejected" for accounts that were once active.

function SuspendedScreen({ name }: { name: string }) {
  const firstName = name.split(" ")[0] || "there";
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Account unavailable</h1>
          <p className="text-muted-foreground leading-relaxed">
            Hi {firstName} — your Miitro account is currently suspended and cannot be
            accessed. If you believe this is a mistake, please reach out to our support team.
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-left">
          <p className="text-red-700 font-medium">Your access has been restricted.</p>
          <p className="text-red-600/80 mt-1">
            This may be due to a policy violation or account review. Contact support
            to request a review of your account status.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Contact us at{" "}
          <a href="mailto:support@miitro.com" className="underline underline-offset-2 hover:text-foreground">
            support@miitro.com
          </a>
        </p>
      </div>
    </AppLayout>
  );
}

// ─── Section: Unpaid / Activate ───────────────────────────────────────────────
// Shown only when applicationStatus === "approved" AND paymentStatus === "unpaid".
// Pending and suspended members never reach this screen.

function ActivateBanner({ name }: { name: string }) {
  const [, setLocation] = useLocation();
  const firstName = name.split(" ")[0] || "there";
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome, {firstName} — complete your enrollment</h1>
              <p className="text-primary-foreground/80 text-sm mb-6 leading-relaxed">
                Your Miitro account is registered. Select a plan below to unlock your full dashboard,
                training curriculum, live coaching, and member community.
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold"
                onClick={() => setLocation("/pricing")}
              >
                View Plans & Pricing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: BookOpen, label: "Training Program", price: "$200", desc: "Full curriculum, videos & PDFs" },
            { icon: Star, label: "Founding Membership", price: "$300", desc: "Community, coaching & benefits" },
            { icon: Shield, label: "Bundle (Best Value)", price: "$400", desc: "Everything — training + membership" },
          ].map(({ icon: Icon, label, price, desc }) => (
            <Card key={label} className="text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setLocation("/pricing")}>
              <CardContent className="pt-6 pb-5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-sm mb-0.5">{label}</p>
                <p className="text-2xl font-bold text-primary mb-1">{price}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Tier badge ────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const config: Record<string, { label: string; className: string }> = {
    starter: { label: "Starter", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" },
    builder: { label: "Builder", className: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
    elite: { label: "Elite", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  };
  const c = config[tier] ?? config.starter;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.className}`}>
      {c.label}
    </span>
  );
}

// ─── Section A: Overview header ───────────────────────────────────────────────

function OverviewSection({ data }: { data: DashboardData }) {
  const { member, training } = data;
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {member.fullName.split(" ")[0]}</h1>
            {member.isFoundingMember && (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300/40 font-semibold">
                ⭐ Founding Member
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <TierBadge tier={member.membershipTier} />
            <span className="text-sm text-muted-foreground">
              Member since {formatDate(member.createdAt)}
            </span>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          {[
            { label: "Training", value: `${training.completionPercent}%`, icon: BookOpen, color: "text-primary" },
            { label: "Modules Done", value: training.completedModules, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Trips (month)", value: data.performance.monthTrips, icon: Car, color: "text-sky-600" },
            { label: "Earned (mo)", value: formatCurrency(data.performance.monthEarnings), icon: DollarSign, color: "text-amber-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-muted/50 rounded-xl p-3 text-center border">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section B: Performance ───────────────────────────────────────────────────

function PerformanceSection({ perf }: { perf: DashboardData["performance"] }) {
  const [, setLocation] = useLocation();
  const weekTripPct = Math.min(100, Math.round((perf.weekTrips / perf.weeklyGoalTrips) * 100));
  const weekEarnPct = Math.min(100, Math.round((perf.weekEarnings / perf.weeklyGoalEarnings) * 100));
  const monthTripPct = Math.min(100, Math.round((perf.monthTrips / perf.monthlyGoalTrips) * 100));
  const monthEarnPct = Math.min(100, Math.round((perf.monthEarnings / perf.monthlyGoalEarnings) * 100));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Performance Dashboard
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/trip-log")}>
            Log Trip <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Track your earnings and progress. Log trips manually or connect a platform when available.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">Today's Earnings</p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(perf.todayEarnings)}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">{perf.todayTrips} trips completed</p>
          </div>
          <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 border border-sky-200 dark:border-sky-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-1">This Month</p>
            <p className="text-3xl font-bold text-sky-700 dark:text-sky-300">{formatCurrency(perf.monthEarnings)}</p>
            <p className="text-xs text-sky-600/70 dark:text-sky-400/70 mt-0.5">{perf.monthTrips} trips completed</p>
          </div>
        </div>

        {/* Weekly goals */}
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Weekly Goals
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Trips — {perf.weekTrips} / {perf.weeklyGoalTrips}</span>
                <span>{weekTripPct}%</span>
              </div>
              <Progress value={weekTripPct} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Earnings — {formatCurrency(perf.weekEarnings)} / {formatCurrency(perf.weeklyGoalEarnings)}</span>
                <span>{weekEarnPct}%</span>
              </div>
              <Progress value={weekEarnPct} className="h-2" />
            </div>
          </div>
        </div>

        {/* Monthly goals */}
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Monthly Goals
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Trips — {perf.monthTrips} / {perf.monthlyGoalTrips}</span>
                <span>{monthTripPct}%</span>
              </div>
              <Progress value={monthTripPct} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Earnings — {formatCurrency(perf.monthEarnings)} / {formatCurrency(perf.monthlyGoalEarnings)}</span>
                <span>{monthEarnPct}%</span>
              </div>
              <Progress value={monthEarnPct} className="h-2" />
            </div>
          </div>
        </div>

        {/* Miitro activity */}
        {(perf.miitroWeekTrips > 0 || perf.miitroMonthTrips > 0) && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" /> Miitro Activity
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-lg font-bold">{perf.miitroWeekTrips}</p>
                <p className="text-xs text-muted-foreground">Miitro trips (week)</p>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(perf.miitroWeekEarnings)}</p>
                <p className="text-xs text-muted-foreground">Miitro earnings (week)</p>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-lg font-bold">{perf.miitroMonthTrips}</p>
                <p className="text-xs text-muted-foreground">Miitro trips (month)</p>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(perf.miitroMonthEarnings)}</p>
                <p className="text-xs text-muted-foreground">Miitro earnings (month)</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section C: Training Center (active — bundle users) ──────────────────────

function TrainingSection({ training }: { training: DashboardData["training"] }) {
  const [, setLocation] = useLocation();
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Training Center
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/training")}>
            Open Training <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{training.completionPercent}%</span>
          </div>
          <Progress value={training.completionPercent} className="h-3" />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{training.completedModules}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
            <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{training.inProgressModules}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border">
            <p className="text-xl font-bold">{training.totalModules}</p>
            <p className="text-xs text-muted-foreground">Total Modules</p>
          </div>
        </div>
        <Button className="w-full" onClick={() => setLocation("/training")}>
          Continue Training <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Section C (locked): Training not included — membership-only users ────────

function LockedTrainingCard() {
  const [, setLocation] = useLocation();
  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Lock className="w-5 h-5" /> Training Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-muted-foreground/60" />
          </div>
          <div>
            <p className="font-semibold text-base mb-1">Training not included</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              The professional driver training curriculum is not part of your{" "}
              <strong>Founding Membership</strong>. Add the Training Program
              to unlock all video modules, PDF guides, and the full training
              experience.
            </p>
          </div>
        </div>
        <Button
          className="w-full"
          onClick={() => setLocation("/payment?plan=training")}
        >
          Add Training — $200 <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Section D: Community ─────────────────────────────────────────────────────

function CommunitySection({
  events, announcements,
}: { events: DashboardData["upcomingEvents"]; announcements: DashboardData["announcements"] }) {
  const [, setLocation] = useLocation();
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Community & Events
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/events")}>
            All Events <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="space-y-2">
            {announcements.slice(0, 2).map((a) => (
              <div key={a.id} className={`rounded-lg p-3 border text-sm ${a.isPinned ? "bg-primary/5 border-primary/30" : "bg-muted/30"}`}>
                {a.isPinned && <span className="text-xs font-semibold text-primary mr-1.5">📌 Pinned</span>}
                <span className="font-medium">{a.title}</span>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{a.body}</p>
                {a.ctaLabel && a.ctaUrl && (
                  <a href={a.ctaUrl} className="text-xs text-primary font-medium mt-1 inline-block hover:underline">
                    {a.ctaLabel} →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upcoming events */}
        {events.length === 0 ? (
          <div className="text-center py-6 bg-muted/20 rounded-xl border border-dashed">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No upcoming events scheduled</p>
            <p className="text-xs text-muted-foreground mt-0.5">Check back soon for live coaching sessions</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.scheduledAt).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                    })}
                    {" · "}{event.durationMinutes} min
                  </p>
                  {event.hostName && (
                    <p className="text-xs text-muted-foreground">with {event.hostName}</p>
                  )}
                </div>
                {event.joinUrl && (
                  <a href={event.joinUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="shrink-0 text-xs h-7">Join</Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section E: Membership tier ───────────────────────────────────────────────

function MembershipSection({ tier, isFoundingMember }: { tier: string; isFoundingMember: boolean }) {
  const [, setLocation] = useLocation();
  const tiers = [
    {
      key: "starter",
      label: "Starter",
      color: "sky",
      perks: ["Core training curriculum", "Community access", "Live session participation", "Basic resources library"],
    },
    {
      key: "builder",
      label: "Builder",
      color: "violet",
      perks: ["Everything in Starter", "Advanced training modules", "Priority event registration", "Exclusive resources"],
    },
    {
      key: "elite",
      label: "Elite",
      color: "amber",
      perks: ["Everything in Builder", "1-on-1 coaching opportunities", "Early feature access", "Premium recognition"],
    },
  ];

  const currentIndex = tiers.findIndex((t) => t.key === tier);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Membership Level
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/membership")}>
            Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Levels are earned through training completion and community engagement — not through sales.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tiers.map((t, idx) => {
            const isCurrent = t.key === tier;
            const isUnlocked = idx <= currentIndex;
            return (
              <div
                key={t.key}
                className={`rounded-xl p-4 border transition-all ${
                  isCurrent
                    ? "border-primary bg-primary/5 shadow-sm"
                    : isUnlocked
                    ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-700"
                    : "border-dashed opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold text-sm ${isCurrent ? "text-primary" : ""}`}>{t.label}</span>
                  {isCurrent && <Badge variant="default" className="text-xs">Current</Badge>}
                  {isUnlocked && !isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <ul className="space-y-1">
                  {t.perks.slice(0, 3).map((p) => (
                    <li key={p} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <CheckCircle2 className={`w-3 h-3 mt-0.5 shrink-0 ${isUnlocked ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {isFoundingMember && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              ⭐ Founding Member Status
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
              As a founding member, you may receive priority access, recognition, and early opportunities
              as Miitro grows. See the full details on your Membership Benefits page.
            </p>
            <Button variant="link" size="sm" className="p-0 h-auto text-amber-700 dark:text-amber-400 mt-1 text-xs"
              onClick={() => setLocation("/membership")}>
              View founding member benefits →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section F: Affiliate ─────────────────────────────────────────────────────

function AffiliateSection({ affiliate }: { affiliate: DashboardData["affiliate"] }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  if (!affiliate.enrolled) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-semibold mb-1">Affiliate Program — Optional</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Earn commissions on verified product sales when you share Miitro with other drivers.
            Enrollment is optional and commission-based only.
          </p>
          <Button variant="outline" onClick={() => setLocation("/affiliate")}>
            Learn About the Partner Program
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalCommissions = affiliate.pendingCommissions + affiliate.approvedCommissions + affiliate.paidCommissions;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Affiliate Program
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/affiliate")}>
            Full Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Commissions are earned on verified product sales only. Disclosure required when promoting.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Affiliate link */}
        {affiliate.affiliateLink && (
          <div className="bg-muted p-3 rounded-lg flex items-center justify-between gap-3 border">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Your Partner Link</p>
              <p className="font-mono text-xs truncate">{affiliate.affiliateLink}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => copy(affiliate.affiliateLink!, "Partner link")}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Commission stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Pending", value: formatCurrency(affiliate.pendingCommissions), color: "text-amber-600" },
            { label: "Approved", value: formatCurrency(affiliate.approvedCommissions), color: "text-sky-600" },
            { label: "Paid Out", value: formatCurrency(affiliate.paidCommissions), color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-muted/50 rounded-lg p-3 border">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground italic">
          {affiliate.totalSales} total qualified sale{affiliate.totalSales !== 1 ? "s" : ""}.
          Total potential commissions: {formatCurrency(totalCommissions)}.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Section G: Founding Member ───────────────────────────────────────────────

function FoundingMemberSection() {
  const [, setLocation] = useLocation();
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/60 to-background dark:from-amber-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <Shield className="w-5 h-5" /> Founding Member Benefits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {[
            { icon: Zap, label: "Priority Access", desc: "First in line for new features and beta programs" },
            { icon: Star, label: "Premium Recognition", desc: "Founding member badge and community standing" },
            { icon: Clock, label: "Waived Initial Period", desc: "Founding members have initial subscription waived" },
            { icon: TrendingUp, label: "Future Opportunities", desc: "Positioned to benefit from platform growth" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
              <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{label}</p>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mb-3">
          Founding member status does not represent ownership, equity, or guaranteed financial return.
          Future benefits will be communicated transparently as the platform evolves.
        </p>
        <Button variant="outline" size="sm" onClick={() => setLocation("/membership")}>
          View Full Founding Member Details →
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Goals Banner ─────────────────────────────────────────────────────────────
// Shown at the top of the full dashboard when the member has at least one active goal.

function GoalsBanner({ goals }: { goals: DashboardData["activeGoals"] }) {
  const [, setLocation] = useLocation();
  if (!goals || goals.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Active Goals
        </p>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/goals")} className="text-xs h-7">
          Manage Goals <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {goals.map((goal) => {
          const tripPct = goal.tripGoal
            ? Math.min(100, Math.round((goal.tripProgress / goal.tripGoal) * 100))
            : null;
          const earnPct = goal.earningsGoal
            ? Math.min(100, Math.round((goal.earningsProgress / parseFloat(goal.earningsGoal)) * 100))
            : null;

          return (
            <div key={goal.id} className="space-y-2">
              <p className="text-xs text-muted-foreground capitalize flex items-center gap-1.5">
                <span className="font-medium text-foreground">{goal.goalType} goal</span>
                — {goal.daysRemaining} day{goal.daysRemaining !== 1 ? "s" : ""} remaining
              </p>
              {tripPct !== null && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Trips — {goal.tripProgress} / {goal.tripGoal}</span>
                    <span>{tripPct}%</span>
                  </div>
                  <Progress value={tripPct} className="h-1.5" />
                </div>
              )}
              {earnPct !== null && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Earnings — {formatCurrency(goal.earningsProgress)} / {formatCurrency(parseFloat(goal.earningsGoal!))}</span>
                    <span>{earnPct}%</span>
                  </div>
                  <Progress value={earnPct} className="h-1.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function MemberDashboard() {
  const { user, isDriver, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: dashboard, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["member-dashboard"],
    queryFn: async () => {
      const res = await apiFetch("/api/members/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
    enabled: !!user && isDriver,
  });

  const userRole = user?.role;
  const isUserPresent = !!user;

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isUserPresent) { setLocation("/login"); return; }
    if (userRole === "admin") { setLocation("/admin"); return; }
    // Training-only buyers have no platform access — send them to the training center.
    if (user && user.paymentStatus === "paid" && user.productPurchased === "training") {
      setLocation("/training");
      return;
    }
  }, [isAuthLoading, isUserPresent, userRole, user]);

  // Loading spinner
  if (isAuthLoading || !user || user.role === "admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // ── Status-based gating ──────────────────────────────────────────────────────
  // Order matters: applicationStatus is checked first so that pending/suspended
  // members never see the payment enrollment screen, even if paymentStatus is unpaid.

  // Debug: log the exact values the frontend received so gating can be verified.
  console.debug("[MemberDashboard] gating values", {
    applicationStatus: user.applicationStatus,
    paymentStatus: user.paymentStatus,
    productPurchased: user.productPurchased,
  });

  // Suspended (DB value: "rejected") — account unavailable
  if (user.applicationStatus === "rejected") {
    return <SuspendedScreen name={user.fullName} />;
  }

  // Pending — application under review, no access yet
  if (user.applicationStatus === "pending") {
    return <PendingScreen name={user.fullName} />;
  }

  // Approved + unpaid — prompt to complete enrollment / choose a plan.
  // Use !== "paid" rather than === "unpaid" so a missing / null value is also caught.
  if (user.paymentStatus !== "paid") {
    return <ActivateBanner name={user.fullName} />;
  }

  // Training-only buyers have no platform access — useEffect redirect may not
  // have fired yet on first render, so guard here too.
  if (user.productPurchased === "training") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Approved + paid + platform product — falls through to full dashboard below

  // Loading dashboard data
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  // Failed to load
  if (isError || !dashboard) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-lg font-semibold">Unable to load your dashboard</p>
            <p className="text-sm text-muted-foreground">
              There was a problem connecting to the server. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Active goals banner — shown when member has at least one active goal */}
        <GoalsBanner goals={dashboard.activeGoals} />

        {/* A — Overview */}
        <OverviewSection data={dashboard} />

        {/* B + C — Performance & Training side by side on large screens.
              Training card is product-aware:
                bundle     → active TrainingSection (progress + continue button)
                membership → LockedTrainingCard (upgrade prompt, no training access) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceSection perf={dashboard.performance} />
          {dashboard.member.productPurchased === "bundle"
            ? <TrainingSection training={dashboard.training} />
            : <LockedTrainingCard />
          }
        </div>

        {/* D — Community */}
        <CommunitySection events={dashboard.upcomingEvents} announcements={dashboard.announcements} />

        {/* E + F — Membership & Affiliate (Affiliate is bundle-only) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MembershipSection tier={dashboard.member.membershipTier} isFoundingMember={dashboard.member.isFoundingMember} />
          {dashboard.member.productPurchased === "bundle" && (
            <AffiliateSection affiliate={dashboard.affiliate} />
          )}
        </div>

        {/* G — Founding Member (only if founding member) */}
        {dashboard.member.isFoundingMember && <FoundingMemberSection />}

      </div>
    </AppLayout>
  );
}
