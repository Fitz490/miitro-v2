import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, Users, Trophy, Zap } from "lucide-react";

export default function Program() {
  return (
    <AppLayout>
      <div className="bg-muted/30 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Founding Driver Program</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional driver training, a member community, and founding status — built for
              drivers who take their career seriously.
            </p>
          </div>

          {/* Membership overview */}
          <Card className="mb-16 border-primary/20 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-10"></div>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-4">
                <CardTitle className="text-3xl">One-Time Membership</CardTitle>
                <span className="text-4xl font-bold text-primary">$400</span>
              </div>
              <p className="text-muted-foreground text-lg">
                A single one-time fee covers your full enrollment in the Founding Driver Program.
                This is not a subscription — it is a one-time program access payment that does not
                represent an investment or equity in Miitro.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {[
                  "Founding Member status and recognition",
                  "Full professional driver training curriculum",
                  "Live Zoom coaching sessions with expert instructors",
                  "Member community access",
                  "Driver dashboard and progress tracking",
                  "Downloadable resources and PDF guides",
                  "Optional affiliate partner program access",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What's inside */}
          <h2 className="text-3xl font-bold mb-8 text-center">What's Inside the Program</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="pt-2">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Training Library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Video modules, PDF guides, safety and compliance content, earnings optimization,
                  and tax guidance — all self-paced and available immediately after enrollment.
                </p>
              </CardContent>
            </Card>

            <Card className="pt-2 border-primary shadow-lg shadow-primary/10">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Live Coaching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Regular live Zoom sessions with professional instructors. Ask questions, get
                  feedback, and grow alongside other members of the community.
                </p>
              </CardContent>
            </Card>

            <Card className="pt-2">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Founding Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Early members receive founding recognition and priority access as Miitro grows
                  toward full rideshare operations in your area.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Affiliate note */}
          <Card className="border-dashed mb-12">
            <CardContent className="py-6 px-8">
              <div className="flex items-start gap-4">
                <Zap className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Optional: Affiliate Partner Program</p>
                  <p className="text-sm text-muted-foreground">
                    Enrolled members may optionally participate in the Miitro affiliate program and
                    earn a flat commission when someone purchases a Miitro product through their
                    personal affiliate link. Participation is entirely voluntary and based solely on
                    verified product sales — not on recruiting other members or any other activity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal disclaimer */}
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto mb-10">
            Miitro does not guarantee any income, earnings, or financial return from membership.
            The $400 fee is not an investment and does not represent equity in Miitro.
            Affiliate commissions depend on verified product sales and program terms.
          </p>

          <div className="text-center">
            <Link href="/join">
              <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-full shadow-xl">
                Choose Your Plan
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
