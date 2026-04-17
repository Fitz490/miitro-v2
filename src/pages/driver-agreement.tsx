import { AppLayout } from "@/components/layout/app-layout";
import { Link } from "wouter";

export default function DriverAgreement() {
  const lastUpdated = "March 29, 2026";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Driver Agreement</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          <p className="text-sm text-muted-foreground mt-1">
            This Agreement is incorporated into and must be read alongside the{" "}
            <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <div className="space-y-12 text-muted-foreground leading-relaxed">

          {/* 1. Independent Contractor Status */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Independent Contractor Status</h2>
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 text-sm mb-4">
              <p className="font-semibold text-foreground">Important Notice</p>
              <p className="mt-1">
                By registering with the Miitro Founding Driver Program, you acknowledge and agree
                that you are entering into this Agreement as an <strong>independent contractor</strong>,
                not as an employee, agent, partner, or joint venturer of Miitro Rideshare.
              </p>
            </div>
            <p>
              Nothing in this Agreement or on the Miitro Platform shall be construed to create an
              employment relationship between you and Miitro. You retain full control over when,
              where, and how you operate, subject to the minimum standards set forth in this
              Agreement and the applicable platform policies.
            </p>
            <p className="mt-3">
              As an independent contractor, Miitro will not withhold income taxes, Social Security,
              or Medicare from any payments made to you. You are solely responsible for reporting
              and paying all applicable federal, state, and local taxes on any income or rewards
              you receive through the Platform.
            </p>
          </section>

          {/* 2. No Guaranteed Income or Ride Volume */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. No Guaranteed Income or Ride Volume</h2>
            <p>
              Miitro does not guarantee any minimum level of earnings, ride requests, partner
              bonuses, or business activity. Your participation in the Founding Driver Program
              provides access to the platform, its training curriculum, and member benefits — it
              does not constitute a promise of income or sustained engagement.
            </p>
            <p className="mt-3">
              Actual earnings, if any, will vary based on factors including your location,
              market demand, and other conditions outside Miitro's control.
              You should not rely solely on Miitro as a source of income or substitute it for
              independent financial planning.
            </p>
          </section>

          {/* 3. Driver Responsibilities */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Driver Responsibilities</h2>
            <p className="mb-4">
              As an independent contractor using the Miitro Platform, you are solely responsible for:
            </p>

            <div className="space-y-4">
              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">A</span>
                  Your Vehicle
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Owning, leasing, or controlling a vehicle that meets platform standards</li>
                  <li>Maintaining your vehicle in a safe, clean, and roadworthy condition</li>
                  <li>Ensuring the vehicle passes all required inspections and registrations</li>
                </ul>
              </div>

              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">B</span>
                  Insurance
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Maintaining valid personal auto insurance that meets or exceeds the minimum requirements in your jurisdiction</li>
                  <li>Obtaining any supplemental rideshare insurance coverage required or recommended by your insurer</li>
                  <li>Notifying your insurer that you may use your vehicle for rideshare or commercial driving purposes</li>
                </ul>
                <p className="text-sm mt-3 text-destructive font-medium">
                  Miitro does not provide insurance coverage of any kind for you, your vehicle, passengers, or third parties.
                </p>
              </div>

              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">C</span>
                  Licensing & Compliance
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Holding and maintaining a valid driver's license appropriate for the type of driving you perform</li>
                  <li>Obtaining any local permits, business licenses, or certifications required to operate as a for-hire driver in your area</li>
                  <li>Complying with all applicable traffic laws, regulations, and local ordinances</li>
                </ul>
              </div>

              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">D</span>
                  Expenses
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All costs related to fuel, vehicle maintenance, repairs, and cleaning</li>
                  <li>Tolls, parking fees, and any other operational expenses</li>
                  <li>All personal and business taxes arising from your activity on the Platform</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Platform Access Only */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Platform Provides Access to Opportunities Only</h2>
            <p>
              The Miitro Platform provides you with access to training materials, member tools,
              a driver dashboard, and program-related communications.
              It does not guarantee ride assignments, customer connections, or the launch of
              rideshare operations in your city by any specific date.
            </p>
            <p className="mt-3">
              Miitro is in an active build phase. While we are committed to launching rideshare
              operations and delivering on the program's stated rewards structure, timelines
              may change. Founding Driver status and program participation do not confer
              contractual rights to specific operational milestones.
            </p>
          </section>

          {/* 5. Affiliate Partner Program Rules */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Affiliate Partner Program Rules</h2>
            <p className="text-sm mb-4">
              Miitro offers an optional affiliate program that allows members to earn a one-time
              commission on verified product sales generated through their personal partner link.
              Participation is entirely voluntary. The following rules apply:
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                <span><strong className="text-foreground">Product Sales Only:</strong> Partner commissions are earned solely on verified purchases of Miitro products (Training Program or Full Bundle) made through your affiliate link. No commission is earned for referring members, recruiting participants, or any activity other than a completed product sale.</span>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                <span><strong className="text-foreground">One Commission Per Sale:</strong> Each qualifying sale may be attributed to one affiliate only. Duplicate attributions, coordinated misuse of affiliate links, or self-referrals will not be credited.</span>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                <span><strong className="text-foreground">No Recruiting Commissions:</strong> Miitro does not pay commissions for recruiting other affiliates, signing up new members, or any multi-level or chain-based reward structure. This is a flat, single-tier product affiliate program only.</span>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</span>
                <span><strong className="text-foreground">Disclosure Required:</strong> When sharing your affiliate link, you must clearly disclose that you may earn a commission from qualifying purchases. This is required by FTC guidelines and Miitro program terms.</span>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">5</span>
                <span><strong className="text-foreground">No Abuse or Fraud:</strong> Any affiliate activity that Miitro determines to be abusive, deceptive, or fraudulent will result in immediate account suspension, cancellation of pending commissions, and possible legal action.</span>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">6</span>
                <span><strong className="text-foreground">Miitro's Right to Audit:</strong> Miitro may audit affiliate activity at any time. Commissions may be withheld pending the outcome of an audit.</span>
              </div>
            </div>
          </section>

          {/* 6. Payment and Commission Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Payment and Commission Terms</h2>
            <p>
              Membership fees and product purchases are one-time, non-refundable payments that
              activate your access to Miitro's training curriculum and member benefits. These
              fees are not subscriptions, deposits, or investments — they are program access fees.
            </p>
            <p className="mt-3">
              Affiliate commissions are paid after the applicable refund review period has passed
              and the underlying sale is verified. Commission amounts are fixed per product type
              as listed in the affiliate program at the time of sale. Miitro reserves the right
              to modify, pause, or discontinue the affiliate program with reasonable notice.
            </p>
            <p className="mt-3">
              All payments and commissions are subject to applicable taxes, which are your
              responsibility to report and remit.
            </p>
          </section>

          {/* 7. Liability Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Liability Disclaimer</h2>
            <p>
              Miitro is not liable for any injury, property damage, loss, or harm that occurs
              in connection with your driving activities, vehicle operation, or interactions
              with passengers or third parties.
            </p>
            <p className="mt-3">
              You agree to indemnify, defend, and hold harmless Miitro, its officers, directors,
              employees, and agents from and against any claims, damages, losses, or expenses
              (including reasonable attorney's fees) arising from or related to your use of the
              Platform, your driving activities, your breach of this Agreement, or your violation
              of any applicable law or third-party right.
            </p>
            <p className="mt-3">
              Miitro's total liability to you under this Agreement shall not exceed the amount
              you paid to Miitro in the twelve (12) months prior to the event giving rise to
              the claim, as further described in the Terms of Service.
            </p>
          </section>

          {/* 8. Agreement to Platform Policies */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Agreement to Platform Policies</h2>
            <p>
              By accepting this Driver Agreement, you confirm that you have read, understood,
              and agreed to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li>This Driver Agreement</li>
              <li>
                The{" "}
                <Link href="/terms-of-service" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                The{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            <p className="text-sm mt-4">
              You acknowledge that these documents together form the complete agreement between
              you and Miitro governing your participation in the Founding Driver Program. If any
              provision of this Agreement is found to be unenforceable, the remaining provisions
              shall continue in full force and effect.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Questions</h2>
            <p className="mb-3">
              For questions about this Driver Agreement, contact us:
            </p>
            <div className="border border-border rounded-xl p-5 text-sm space-y-1">
              <p><strong className="text-foreground">Miitro Rideshare</strong></p>
              <p>Email: <a href="mailto:legal@miitro.com" className="text-primary hover:underline">legal@miitro.com</a></p>
              <p>Phone: (555) 000-0001</p>
            </div>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}
