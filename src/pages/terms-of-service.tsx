import { AppLayout } from "@/components/layout/app-layout";

export default function TermsOfService() {
  const lastUpdated = "March 29, 2026";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-12 text-muted-foreground leading-relaxed">

          {/* Legal Entity */}
          <section className="bg-muted/40 border border-border rounded-xl p-5">
            <p className="text-sm text-foreground font-medium">
              This platform is owned and operated by <strong>Unique Horn LLC</strong>.
              "Miitro" is a brand name and product of Unique Horn LLC, the legal entity
              entering into these Terms with you.
            </p>
          </section>

          {/* 1. Acceptance */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using any part of the Miitro platform — including our website,
              driver application portal, training platform, and driver dashboard (collectively,
              the "Platform") — you agree to be bound by these Terms of Service ("Terms").
              If you do not agree to these Terms in their entirety, you must not access or
              use the Platform.
            </p>
            <p className="mt-3">
              These Terms constitute a legally binding agreement between you ("Driver," "you,"
              or "your") and Unique Horn LLC, doing business as Miitro ("Miitro," "we," "us,"
              or "our"). We reserve the right to update these Terms at any time. Continued use
              of the Platform after changes are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* 2. Description */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of the Miitro Platform</h2>
            <p>
              Miitro is a driver training and membership platform operating a Founding Driver
              Program. Through this Program, qualifying drivers pay a one-time membership fee to
              access professional driver training content, live coaching sessions, a member
              community, and program-related tools and resources. Founding Driver status provides
              priority access and recognition as the platform grows toward full rideshare
              operations.
            </p>
            <p className="mt-3">
              Miitro does not currently operate as a licensed transportation carrier. The Platform
              facilitates driver enrollment, training delivery, and member dashboard access. Actual
              rideshare operations, licensing, and insurance obligations will be governed by
              separate agreements issued at the time the Miitro rideshare service launches in
              your area.
            </p>
            <p className="mt-3">
              Miitro also offers an optional affiliate program through which enrolled members may
              earn a flat commission on verified product sales generated through their affiliate
              link. Participation in the affiliate program is entirely voluntary and separate from
              the core membership. No commissions are paid for recruiting other members or for
              any activity other than a completed, verified product sale.
            </p>
          </section>

          {/* 3. Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Eligibility</h2>
            <p className="mb-3">To register for and participate in the Miitro Founding Driver Program, you must:</p>
            <ul className="space-y-2 text-sm">
              {[
                "Be at least 18 years of age at the time of application",
                "Hold a valid, unexpired driver's license issued by a recognized government authority",
                "Have access to a qualifying vehicle that meets Miitro's minimum vehicle standards",
                "Be legally authorized to work and drive for hire in your jurisdiction",
                "Provide accurate, complete, and truthful information during and after the application process",
                "Not be currently suspended, banned, or otherwise restricted from the Platform",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-4">
              Miitro reserves the right to verify eligibility at any time and to deny or revoke
              access to the Platform if eligibility requirements are not or are no longer met.
            </p>
          </section>

          {/* 4. Account Responsibility */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Account Responsibility</h2>
            <p>
              You are solely responsible for maintaining the confidentiality of your account
              credentials, including your email address and password. You agree to notify Miitro
              immediately if you suspect unauthorized access to your account.
            </p>
            <p className="mt-3">
              You may not share, transfer, sell, or assign your account or Founding Driver
              status to any other person. Each driver may hold only one account. Any attempt
              to create duplicate or fraudulent accounts will result in immediate termination
              of all associated accounts and forfeiture of any rewards or fees paid.
            </p>
            <p className="mt-3">
              All activity conducted through your account — including referrals, payment
              submissions, and dashboard activity — is your responsibility, whether or not
              authorized by you.
            </p>
          </section>

          {/* 5. Payment Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Payment Terms</h2>
            <div className="border border-border rounded-xl p-5 text-sm space-y-3">
              <div>
                <p className="font-semibold text-foreground">One-Time Program Fee</p>
                <p className="mt-1">
                  Participation in the Founding Driver Program requires a one-time, non-refundable
                  fee based on the plan selected at enrollment:{" "}
                  <strong className="text-foreground">$150</strong> (Training Program),{" "}
                  <strong className="text-foreground">$250</strong> (Founding Membership), or{" "}
                  <strong className="text-foreground">$400</strong> (Full Bundle — Training + Membership).
                  The applicable fee is displayed and confirmed during checkout before any charge is made.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Non-Refundable Policy</p>
                <p className="mt-1">
                  All fees paid are non-refundable except where expressly required by applicable
                  law or as otherwise stated in writing by Miitro at the time of payment. Founding
                  Driver status is granted upon successful payment confirmation.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Payment Processing</p>
                <p className="mt-1">
                  Payments are processed securely through Stripe, Inc. By completing a payment,
                  you also agree to Stripe's Terms of Service. Miitro does not store your full
                  payment card details.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Failed or Disputed Payments</p>
                <p className="mt-1">
                  If your payment fails or is later disputed or charged back, your Founding
                  Driver status may be suspended or revoked until the matter is resolved. Miitro
                  reserves the right to recover any disputed amounts through available legal means.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Affiliate Program */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Affiliate Program Terms</h2>
            <p className="mb-4">
              Enrolled members may optionally participate in the Miitro Affiliate Program, subject
              to the following terms. Participation is voluntary and entirely separate from core
              membership benefits.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">A</span>
                <span><strong className="text-foreground">Product Sales Only:</strong> Affiliate commissions are earned solely on verified purchases of Miitro products (Training Program or Full Bundle) made through your affiliate link. No commission is earned for referring new members, recruiting participants, or any activity other than a completed, verified product sale.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">B</span>
                <span><strong className="text-foreground">No Multi-Level or Tiered Commissions:</strong> Miitro does not operate a multi-level, pyramid, or tiered commission structure. Commission rates are flat and fixed per product type. No commissions are paid for recruiting other affiliates or signing up new members.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">C</span>
                <span><strong className="text-foreground">Disclosure Required:</strong> When sharing your affiliate link, you must clearly disclose that you may earn a commission from qualifying purchases. This is required by applicable FTC guidelines. Failure to disclose may result in suspension from the affiliate program.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">D</span>
                <span><strong className="text-foreground">No Fraudulent Activity:</strong> Self-referrals, coordinated misuse of affiliate links, or any deceptive affiliate activity is strictly prohibited and will result in account suspension and forfeiture of pending commissions.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">E</span>
                <span><strong className="text-foreground">Miitro's Right to Modify:</strong> Miitro reserves the right to modify, suspend, or discontinue the affiliate program at any time with reasonable notice. Changes will not retroactively affect commissions already approved and credited prior to the change date.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">F</span>
                <span><strong className="text-foreground">Commission Verification:</strong> Commission payouts are subject to verification of the underlying sale and may be withheld pending review. Miitro reserves the right to withhold or reverse commissions where fraud, chargebacks, or policy violations are identified.</span>
              </li>
            </ul>
          </section>

          {/* 7. No Guarantee of Earnings */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. No Guarantee of Earnings</h2>
            <p>
              Miitro makes no representations, warranties, or guarantees of any kind regarding
              the income or earnings you may generate through the Platform, including but not
              limited to affiliate commissions, future rideshare commissions, or any other monetary
              benefit.
            </p>
            <p className="mt-3">
              Any earnings projections, examples, or testimonials presented on the Platform
              are illustrative only and do not constitute a promise of similar results. Your
              actual results will depend on your individual effort, local market conditions,
              and other factors outside Miitro's control.
            </p>
          </section>

          {/* 8. Platform Usage Rules */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Platform Usage Rules</h2>
            <p className="mb-3">You agree not to use the Platform to:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Violate any applicable local, state, federal, or international law or regulation</li>
              <li>Submit false, misleading, or fraudulent information at any stage of registration or operation</li>
              <li>Attempt to gain unauthorized access to any part of the Platform or its underlying systems</li>
              <li>Interfere with or disrupt the integrity or performance of the Platform</li>
              <li>Scrape, crawl, or extract data from the Platform without express written permission</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity</li>
              <li>Use the Platform for any commercial purpose other than as expressly permitted by Miitro</li>
            </ul>
          </section>

          {/* 9. Suspension and Termination */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Suspension and Termination</h2>
            <p>
              Miitro reserves the right, at its sole discretion, to suspend, restrict, or
              permanently terminate your account and access to the Platform at any time, with
              or without notice, for any of the following reasons:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li>Violation of these Terms or any Miitro policy</li>
              <li>Fraudulent, abusive, or deceptive conduct</li>
              <li>Failure to meet or maintain eligibility requirements</li>
              <li>Non-payment or disputed payment of the onboarding fee</li>
              <li>Any conduct Miitro determines to be harmful to drivers, users, or the Platform</li>
            </ul>
            <p className="text-sm mt-3">
              Upon termination, your right to use the Platform ceases immediately. Any accrued
              but unpaid rewards may be forfeited at Miitro's discretion where the termination
              is due to policy violations. The program fee paid at enrollment is non-refundable upon
              termination in all cases not expressly covered by law.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Miitro, its officers, directors,
              employees, and agents shall not be liable for any indirect, incidental, special,
              consequential, punitive, or exemplary damages arising out of or in connection
              with your use of — or inability to use — the Platform. This includes but is not
              limited to loss of profits, loss of data, loss of goodwill, or any other
              intangible losses.
            </p>
            <p className="mt-3">
              Miitro's total cumulative liability to you for any claim arising out of or related
              to these Terms or the Platform shall not exceed the amount you actually paid to
              Miitro in the twelve (12) months preceding the event giving rise to the claim.
            </p>
            <p className="mt-3">
              Some jurisdictions do not allow the exclusion or limitation of certain damages.
              In such jurisdictions, Miitro's liability will be limited to the greatest extent
              permitted by law.
            </p>
          </section>

          {/* 11. Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Changes to These Terms</h2>
            <p>
              We may revise these Terms at any time. When we do, we will update the "Last
              updated" date at the top of this page. For material changes, we will make
              reasonable efforts to notify you via the email address associated with your
              account or through a prominent notice on the Platform.
            </p>
            <p className="mt-3">
              Your continued use of the Platform following the posting of revised Terms
              constitutes your acceptance of the changes. If you do not agree to the revised
              Terms, you must stop using the Platform immediately.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Contact</h2>
            <p className="mb-3">
              If you have questions about these Terms or wish to exercise any rights under
              them, please contact us:
            </p>
            <div className="border border-border rounded-xl p-5 text-sm space-y-1">
              <p><strong className="text-foreground">Miitro — Unique Horn LLC</strong></p>
              <p>Email: <a href="mailto:legal@miitro.com" className="text-primary hover:underline">legal@miitro.com</a></p>
              <p>Phone: (555) 000-0001</p>
            </div>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}
