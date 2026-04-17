import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMemberGate } from "@/hooks/use-member-gate";
import {
  CheckCircle2, Lock, Star, Shield, Trophy, Zap,
  BookOpen, Users, Calendar, Clock, TrendingUp, ArrowRight,
} from "lucide-react";

const TIERS = [
  {
    key: "starter",
    label: "Starter",
    color: "sky",
    headline: "Begin your professional journey",
    description: "All members start at Starter. Access the core training curriculum and join the Miitro community.",
    howToUnlock: "Unlocked automatically upon enrollment.",
    perks: [
      { icon: BookOpen, text: "Full core training curriculum access" },
      { icon: Users, text: "Miitro member community access" },
      { icon: Calendar, text: "Live Zoom session participation" },
      { icon: Star, text: "Basic resource library" },
      { icon: Trophy, text: "Starter member recognition" },
    ],
  },
  {
    key: "builder",
    label: "Builder",
    color: "violet",
    headline: "Deepen your knowledge & engagement",
    description: "Builder status is earned by completing training modules and actively participating in the community.",
    howToUnlock: "Earned through training completion and community engagement.",
    perks: [
      { icon: BookOpen, text: "Advanced training modules unlocked" },
      { icon: Calendar, text: "Priority event registration" },
      { icon: Star, text: "Exclusive resource library" },
      { icon: Users, text: "Builder community recognition" },
      { icon: TrendingUp, text: "Advanced performance tools" },
    ],
  },
  {
    key: "elite",
    label: "Elite",
    color: "amber",
    headline: "Lead, contribute & access premium opportunities",
    description: "Elite status is earned by sustained participation, contribution, and consistent community engagement.",
    howToUnlock: "Earned through sustained contribution and participation over time.",
    perks: [
      { icon: Star, text: "1-on-1 coaching opportunities" },
      { icon: Zap, text: "Early access to new platform features" },
      { icon: Shield, text: "Elite recognition & premium badge" },
      { icon: TrendingUp, text: "Early access to future opportunities" },
      { icon: Trophy, text: "Featured member spotlight opportunities" },
    ],
  },
];

const FOUNDING_BENEFITS = [
  {
    icon: Zap,
    label: "Priority Platform Access",
    desc: "Founding members are first in line for new features, beta programs, and platform expansions.",
  },
  {
    icon: Clock,
    label: "Waived Initial Subscription Period",
    desc: "When Miitro transitions to a subscription model, founding members will have their initial period waived.",
  },
  {
    icon: Star,
    label: "Founding Member Recognition",
    desc: "A permanent founding member badge and recognition in the Miitro community.",
  },
  {
    icon: TrendingUp,
    label: "Early Feature Access",
    desc: "Founding members gain access to new capabilities before general availability.",
  },
  {
    icon: Shield,
    label: "Premium Standing",
    desc: "Founding member status is preserved regardless of future plan changes or tier restructuring.",
  },
  {
    icon: Users,
    label: "Community Influence",
    desc: "Input on platform direction through founding member surveys and feedback programs.",
  },
];

export default function MembershipBenefits() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { blocked } = useMemberGate({ requirePlatform: true }); // membership + bundle only

  if (blocked || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const currentTier = user.membershipTier ?? "starter";
  const isFoundingMember = user.isFoundingMember ?? false;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Membership Benefits</h1>
          <p className="text-muted-foreground">
            Your membership level is earned through training, participation, and engagement — not through
            sales or recruiting. Here's everything available to you at each level.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const tierOrder = ["starter", "builder", "elite"];
            const currentIndex = tierOrder.indexOf(currentTier);
            const tierIndex = tierOrder.indexOf(tier.key);
            const isCurrent = tier.key === currentTier;
            const isUnlocked = tierIndex <= currentIndex;

            return (
              <Card
                key={tier.key}
                className={`relative ${
                  isCurrent
                    ? "border-primary ring-1 ring-primary shadow-lg shadow-primary/10"
                    : isUnlocked
                    ? "border-emerald-300 dark:border-emerald-700"
                    : "opacity-70"
                } transition-all`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow font-semibold">Your Level</Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-lg">{tier.label}</CardTitle>
                    {isUnlocked && !isCurrent && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {!isUnlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{tier.headline}</p>
                  <p className="text-xs text-muted-foreground">{tier.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">How to unlock</p>
                    <p className="text-sm text-muted-foreground italic">{tier.howToUnlock}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Benefits</p>
                    <ul className="space-y-2">
                      {tier.perks.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-start gap-2 text-sm">
                          <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isUnlocked ? "text-primary" : "text-muted-foreground/50"}`} />
                          <span className={isUnlocked ? "" : "text-muted-foreground"}>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tier note */}
        <Card className="border-sky-200 bg-sky-50 dark:bg-sky-900/10 dark:border-sky-800">
          <CardContent className="py-4">
            <p className="text-sm text-sky-800 dark:text-sky-300">
              <strong>Important:</strong> Membership levels are based entirely on training completion,
              participation, and engagement. They are <em>not</em> tied to sales performance, affiliate
              commissions, or recruiting other members. Higher tiers unlock more content and opportunities —
              nothing more.
            </p>
          </CardContent>
        </Card>

        {/* Training access note — shown only to membership-only buyers */}
        {user.productPurchased === "membership" && (
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800">
            <CardContent className="py-4 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-1">
                  Training curriculum not included in your plan
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                  Your Founding Membership includes platform access — community, live coaching, and events.
                  The video training curriculum and PDF modules require a <strong>Training Only</strong> or <strong>Bundle</strong> purchase.
                  Upgrade to the Bundle to unlock both.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Founding member section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">Founding Member Benefits</h2>
            {isFoundingMember && (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300/40">
                ⭐ Your Status
              </Badge>
            )}
          </div>

          {!isFoundingMember && (
            <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800">
              <CardContent className="py-4 flex items-center gap-4">
                <Star className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">You are not yet a founding member</p>
                  <p className="text-sm text-amber-700/70 dark:text-amber-400/70">
                    Founding member status is granted to early enrollees. Upgrade to the Bundle to qualify.
                  </p>
                </div>
                <Button size="sm" onClick={() => setLocation("/pricing")} className="shrink-0">
                  See Plans <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FOUNDING_BENEFITS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className={`p-4 rounded-xl border ${
                  isFoundingMember
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                    : "bg-muted/30 opacity-70"
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${isFoundingMember ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} />
                <p className="font-semibold text-sm mb-1">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground italic mt-4">
            Founding member benefits are subject to program terms. These benefits do not represent ownership,
            equity, or guaranteed financial return. Future platform features and opportunities will be
            communicated as the platform evolves. Miitro does not guarantee any specific outcome from membership.
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
