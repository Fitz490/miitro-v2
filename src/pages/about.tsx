import { AppLayout } from "@/components/layout/app-layout";

export default function About() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">About Miitro</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-muted-foreground leading-relaxed mb-12">
            Miitro was born out of frustration with the status quo. For too long, 
            rideshare platforms have treated drivers as an endless, disposable resource 
            while extracting maximum value from their labor. We're changing the equation.
          </p>

          <div className="my-16 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={`${import.meta.env.BASE_URL}images/about-driver.png`}
              alt="Professional driver next to SUV" 
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12 mt-16">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-muted-foreground">
                To build a sustainable, equitable transportation network where drivers 
                are treated as true partners and rewarded for their contribution to the 
                platform's growth.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">The Vision</h2>
              <p className="text-muted-foreground">
                We envision a future where drivers don't just work for an app—they own a 
                stake in its success. The Founding Driver Program is the first step in 
                building a community-driven fleet.
              </p>
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-border">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Miitro is a driver-focused rideshare platform developed and operated by{" "}
              <strong className="text-foreground">Unique Horn LLC</strong>. Unique Horn LLC is the legal entity
              responsible for the Miitro platform, the Founding Driver Program, and all associated services.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
