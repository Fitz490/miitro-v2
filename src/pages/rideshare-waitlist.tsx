import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  Car, Shield, Trophy, Clock, Star, Users, Zap,
  CheckCircle2, ArrowRight, TrendingUp, MapPin,
} from "lucide-react";

const ROADMAP_PHASES = [
  {
    phase: "Phase 1",
    label: "Foundation",
    status: "current",
    description: "Building the driver training platform, community infrastructure, and founding member base.",
    milestones: [
      "Professional training curriculum",
      "Live coaching program",
      "Member community launch",
      "Founding member program",
    ],
  },
  {
    phase: "Phase 2",
    label: "Community Growth",
    status: "upcoming",
    description: "Expanding the driver network, adding advanced training content, and developing platform partnerships.",
    milestones: [
      "Advanced training modules",
      "Driver resource expansion",
      "Partner integrations",
      "Mobile app launch",
    ],
  },
  {
    phase: "Phase 3",
    label: "Platform Development",
    status: "planned",
    description: "Beginning development of the Miitro driver-first dispatch and rideshare platform infrastructure.",
    milestones: [
      "Platform technology development",
      "Market research & regulatory review",
      "Pilot program design",
      "Founding member priority access",
    ],
  },
  {
    phase: "Phase 4",
    label: "Rideshare Launch",
    status: "planned",
    description: "Launching the Miitro rideshare platform where drivers keep significantly more of what they earn.",
    milestones: [
      "Platform pilot in select markets",
      "Driver-first pricing model",
      "Founding member early access",
      "Full platform rollout",
    ],
  },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  current: { label: "In Progress", className: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  upcoming: { label: "Next Up", className: "bg-sky-100 text-sky-700 border-sky-300" },
  planned: { label: "Planned", className: "bg-muted text-muted-foreground" },
};

export default function RideshareWaitlist() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [joined, setJoined] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">

        {/* Hero */}
        <div className="text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">Platform Roadmap</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            The future belongs to drivers
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Miitro is building toward a driver-first rideshare platform — where drivers keep significantly
            more of what they earn and have a real voice in how the platform operates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => setLocation("/dashboard")}>
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => setLocation("/join?plan=membership")}>
                  Join as Founding Member <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation("/pricing")}>
                  View Plans
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Vision section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: TrendingUp,
              title: "Driver-First Economics",
              desc: "A platform model designed from the ground up so drivers keep significantly more of every fare — not as a side note, but as the core design principle.",
            },
            {
              icon: Shield,
              title: "Transparency & Fairness",
              desc: "No surge pricing surprises for drivers. No opaque deductions. Clear, predictable platform fees communicated upfront.",
            },
            {
              icon: Users,
              title: "Community Governance",
              desc: "Founding members and active drivers will have a meaningful voice in how platform policies and pricing evolve over time.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="text-center p-1">
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Roadmap */}
        <div>
          <h2 className="text-2xl font-bold mb-2 text-center">Platform Roadmap</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Here's where Miitro is today and where we're headed. Founding members are positioned to benefit
            from each phase as the platform grows.
          </p>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

            <div className="space-y-6">
              {ROADMAP_PHASES.map((phase, idx) => {
                const statusCfg = STATUS_BADGE[phase.status] ?? STATUS_BADGE.planned;
                return (
                  <div key={phase.phase} className="flex gap-6">
                    {/* Timeline dot */}
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                      phase.status === "current"
                        ? "bg-primary border-primary text-primary-foreground"
                        : phase.status === "upcoming"
                        ? "bg-background border-primary/50"
                        : "bg-muted border-border"
                    }`}>
                      {phase.status === "current"
                        ? <Zap className="w-5 h-5" />
                        : <span className="text-sm font-bold">{idx + 1}</span>
                      }
                    </div>

                    <Card className={`flex-1 ${phase.status === "current" ? "border-primary/50" : ""}`}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                          <div>
                            <span className="text-xs text-muted-foreground font-medium">{phase.phase}</span>
                            <h3 className="font-bold text-base">{phase.label}</h3>
                          </div>
                          <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {phase.milestones.map((m) => (
                            <div key={m} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                                phase.status === "current" ? "text-emerald-500" : "text-muted-foreground/40"
                              }`} />
                              {m}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Founding member CTA */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-primary-foreground text-center">
          <Star className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Be part of what's next</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6 text-sm md:text-base">
            Founding members are not just early customers — they're the drivers who help shape what Miitro
            becomes. As the platform evolves, founding members may receive priority access, recognition,
            and early opportunities that general members will not.
          </p>
          <p className="text-xs text-primary-foreground/60 mb-6 italic">
            Founding membership does not represent ownership, equity, or guaranteed financial return.
            Future benefits will be communicated transparently.
          </p>
          {!isAuthenticated ? (
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold"
              onClick={() => setLocation("/join?plan=membership")}
            >
              Join as a Founding Member <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold"
              onClick={() => setLocation("/dashboard")}
            >
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
          The roadmap above represents Miitro's current intentions and is subject to change based on
          market conditions, regulatory requirements, and business decisions. Nothing on this page
          constitutes a promise, guarantee, or legally binding commitment. Platform features and timelines
          may be adjusted without notice.
        </p>

      </div>
    </AppLayout>
  );
}
