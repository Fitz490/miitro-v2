import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, BookOpen, Users, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Dark abstract background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Founding Driver Program Now Open
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
            Drive the Future.<br/>
            <span className="text-gradient">Own Your Success.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join Miitro as a Founding Driver. Get access to professional driver training, live coaching, and a member community — built to help you earn more and drive smarter.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/join">
              <Button size="lg" className="w-full sm:w-auto group">
                View Plans &amp; Join
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-background/50 backdrop-blur-sm">
                See Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join Miitro?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We're building a platform designed around drivers — with real training, a professional community, and tools that help you succeed on your own terms.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Founding Member Status</h3>
              <p className="text-muted-foreground leading-relaxed">
                Early members receive founding status — priority access, recognition, and a seat at the table as the Miitro platform grows into full rideshare operations.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Training</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access a full curriculum built for rideshare drivers — safety, compliance, earnings optimization, tax guidance, and more. Learn at your own pace.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with other professional drivers, attend live coaching sessions, and grow alongside a community that takes the job seriously.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070')] opacity-10 bg-cover bg-center mix-blend-overlay z-0"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Take the Wheel?</h2>
          <p className="text-xl text-white/80 mb-10">
            One-time membership fee. Immediate access to training, live coaching, and the full member community.
          </p>
          <Link href="/join">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-10 text-lg font-bold rounded-full shadow-2xl">
              Choose Your Plan
            </Button>
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
