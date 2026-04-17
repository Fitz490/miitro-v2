import { AppLayout } from "@/components/layout/app-layout";

export default function PrivacyPolicy() {
  const lastUpdated = "April 2, 2026";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-12 text-muted-foreground leading-relaxed">

          {/* Legal Entity */}
          <section className="bg-muted/40 border border-border rounded-xl p-5">
            <p className="text-sm text-foreground font-medium">
              Miitro is operated by <strong>Unique Horn LLC</strong>, the legal entity responsible for
              this platform, its data practices, and all communications sent on its behalf.
            </p>
          </section>

          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              Miitro ("we," "us," or "our") — a product of Unique Horn LLC — is committed to
              protecting your personal information. This Privacy Policy explains how we collect,
              use, share, and safeguard data when you use the Miitro platform, including our
              website, driver application, and affiliate partner program (collectively, the "Platform").
            </p>
            <p className="mt-3">
              By registering, applying, or otherwise using our Platform, you acknowledge that
              you have read and understood this Privacy Policy. If you disagree with its terms,
              please do not use the Platform.
            </p>
          </section>

          {/* What We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="mb-4">We collect the following categories of personal information:</p>

            <div className="space-y-5">
              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Identity & Contact Information</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>
                    Phone number — collected at registration and used to deliver transactional
                    SMS notifications (account confirmation, affiliate commission alerts, and
                    payout confirmations) to which you explicitly consent during sign-up
                  </li>
                </ul>
              </div>

              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Driver & Vehicle Information</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>City and state of operation</li>
                  <li>Vehicle type</li>
                  <li>Years of driving experience</li>
                </ul>
              </div>

              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Affiliate & Program Data</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your unique affiliate code and partner link, if you enroll in the affiliate program</li>
                  <li>Records of verified product sales attributed to your affiliate link</li>
                  <li>Commission history and payout records</li>
                </ul>
              </div>

              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Payment-Related Data</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Payment status (paid / unpaid) and plan selected at enrollment</li>
                  <li>Stripe checkout session identifiers</li>
                  <li>Transaction timestamps</li>
                </ul>
                <p className="text-sm mt-3">
                  <strong className="text-foreground">Note:</strong> Miitro does not store your full
                  credit or debit card details. All payment card data is handled directly and
                  securely by Stripe, Inc. in accordance with PCI-DSS standards.
                </p>
              </div>

              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Communication Consent</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your explicit opt-in consent to receive SMS notifications, recorded at the time of registration</li>
                  <li>Timestamps of notification consent events</li>
                </ul>
              </div>

              <div className="border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Technical & Usage Data</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>IP address and browser type</li>
                  <li>Pages visited and time spent on the Platform</li>
                  <li>Device and operating system information</li>
                  <li>Session cookies for authentication</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Create and manage your driver account and profile</li>
              <li>Process your onboarding payment and confirm your Founding Driver status</li>
              <li>Generate, track, and attribute affiliate codes and partner commissions on verified product sales</li>
              <li>Calculate and display your affiliate commission history and payout records</li>
              <li>Send transactional email and SMS communications related to your account</li>
              <li>Respond to your inquiries submitted through our contact form</li>
              <li>Detect, investigate, and prevent fraudulent or unauthorized activity</li>
              <li>Improve, analyze, and develop our Platform and services</li>
              <li>Comply with applicable legal and regulatory obligations</li>
            </ul>
          </section>

          {/* SMS Notifications — dedicated section */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. SMS Notifications</h2>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-5">
              <p className="text-sm text-foreground font-medium mb-1">Opt-in requirement</p>
              <p className="text-sm">
                Miitro only sends SMS messages to drivers who have explicitly opted in by
                checking the SMS consent box during registration. We do not send unsolicited
                text messages.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-foreground mb-1">What messages we send</h3>
                <p>
                  SMS notifications are transactional in nature and are limited to account-related
                  events, including:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Account activation confirmation after your membership payment is processed</li>
                  <li>Alerts when a product sale is verified and attributed to your affiliate link</li>
                  <li>Affiliate commission payout confirmations</li>
                </ul>
                <p className="mt-2">
                  <strong className="text-foreground">Message frequency varies</strong> based on your
                  program activity. You will not receive more messages than the account events
                  listed above.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-1">How to opt out</h3>
                <p>
                  You may opt out of SMS notifications at any time by replying{" "}
                  <strong className="text-foreground font-mono">STOP</strong> to any Miitro text
                  message. You will receive a final confirmation message and no further SMS
                  notifications will be sent. To re-enroll, contact us at{" "}
                  <a href="mailto:support@miitro.com" className="text-primary hover:underline">
                    support@miitro.com
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-1">Message and data rates</h3>
                <p>
                  Standard message and data rates may apply depending on your mobile carrier
                  and plan. Miitro is not responsible for any charges incurred from your carrier
                  for receiving text messages.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-1">SMS service provider</h3>
                <p>
                  SMS messages are delivered through Twilio, Inc., a third-party messaging
                  service. Your phone number and the message content are transmitted to Twilio
                  solely for delivery purposes. Twilio's use of your data is governed by the{" "}
                  <a href="https://www.twilio.com/en-us/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Twilio Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-1">TCPA compliance</h3>
                <p>
                  Our SMS program is operated in compliance with the Telephone Consumer
                  Protection Act (TCPA) and applicable carrier guidelines. Consent is obtained
                  at the point of registration and is recorded with a timestamp.
                </p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. How We Share Your Information</h2>
            <p className="mb-3">
              <strong className="text-foreground">We do not sell your personal data.</strong> We
              may share your information only in the following limited circumstances:
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                <span><strong className="text-foreground">Payment Processors:</strong> We share necessary transaction data with Stripe, Inc. to process your onboarding fee. Stripe's use of your data is governed by the <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a>.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                <span><strong className="text-foreground">SMS Messaging Provider:</strong> We share your phone number and message content with Twilio, Inc. solely to deliver transactional SMS messages you have consented to receive. Twilio does not use this data for its own marketing purposes.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                <span><strong className="text-foreground">Email Service Provider:</strong> We share your email address and message content with SendGrid (a Twilio company) to deliver transactional email notifications related to your account.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</span>
                <span><strong className="text-foreground">Other Service Providers:</strong> We may engage trusted third-party vendors (such as hosting providers) who assist us in operating the Platform. These vendors are contractually bound to protect your data and may only use it on our behalf.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">5</span>
                <span><strong className="text-foreground">Legal Obligations:</strong> We may disclose information if required by law, court order, or government authority, or to protect the rights, property, or safety of Miitro, our drivers, or the public.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">6</span>
                <span><strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction, subject to equivalent privacy protections.</span>
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies & Analytics</h2>
            <p className="mb-3">
              We use cookies and similar tracking technologies to operate the Platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong className="text-foreground">Session Cookies:</strong> Required to keep you logged in to your driver or admin account. These expire when your session ends.</li>
              <li><strong className="text-foreground">Persistent Cookies:</strong> Used to remember your preferences and maintain authentication across browser sessions (up to 7 days).</li>
              <li><strong className="text-foreground">Analytics:</strong> We may use anonymized analytics tools to understand how the Platform is used, which pages are most visited, and how to improve our services. No personally identifiable information is used for analytics purposes.</li>
            </ul>
            <p className="text-sm mt-3">
              You can configure your browser to refuse cookies; however, doing so may prevent
              certain features of the Platform from functioning correctly.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Data Security</h2>
            <p>
              We implement industry-standard technical and organizational security measures to
              protect your personal information from unauthorized access, disclosure, alteration,
              or destruction. These include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li>Encrypted HTTPS connections for all data in transit</li>
              <li>Hashed and salted storage of passwords (we never store passwords in plain text)</li>
              <li>Secure, server-side session management with HttpOnly cookies</li>
              <li>Payment card data handled exclusively by PCI-DSS-compliant Stripe</li>
              <li>Phone numbers and message content shared with Twilio only over encrypted channels for SMS delivery</li>
              <li>Access controls restricting data to authorized personnel only</li>
              <li>SMS consent records retained as part of your account history for compliance purposes</li>
            </ul>
            <p className="text-sm mt-3">
              While we strive to protect your information, no transmission or storage method is
              100% secure. We encourage you to use a strong, unique password and notify us
              immediately if you suspect unauthorized use of your account.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Your Rights</h2>
            <p className="mb-3">
              You have the following rights with respect to your personal information:
            </p>
            <ul className="space-y-3 text-sm">
              <li><strong className="text-foreground">Access:</strong> You may request a copy of the personal data we hold about you.</li>
              <li><strong className="text-foreground">Correction:</strong> You may ask us to correct inaccurate or incomplete information in your account.</li>
              <li><strong className="text-foreground">Deletion:</strong> You may request that we delete your personal data, subject to any legal obligations we have to retain it.</li>
              <li><strong className="text-foreground">Portability:</strong> You may request your data in a structured, machine-readable format.</li>
              <li><strong className="text-foreground">SMS Opt-Out:</strong> You may withdraw your SMS consent at any time by replying <strong className="font-mono">STOP</strong> to any Miitro text message. This does not affect any other data processing.</li>
              <li><strong className="text-foreground">Objection:</strong> You may object to certain processing activities, such as marketing communications.</li>
            </ul>
            <p className="text-sm mt-3">
              To exercise any of these rights, please contact us using the details in Section 9 below.
              We will respond within 30 days of receiving your request.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Us</h2>
            <p className="mb-3">
              If you have questions, concerns, or requests regarding this Privacy Policy, our
              SMS program, or the way we handle your data, please reach out to us:
            </p>
            <div className="border border-border rounded-xl p-5 text-sm space-y-1">
              <p><strong className="text-foreground">Miitro — Unique Horn LLC</strong></p>
              <p>Email: <a href="mailto:privacy@miitro.com" className="text-primary hover:underline">privacy@miitro.com</a></p>
              <p>Phone: (555) 000-0001</p>
            </div>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise
              the "Last updated" date at the top of this page. We encourage you to review this
              policy periodically. Continued use of the Platform after changes are posted
              constitutes your acceptance of the revised policy.
            </p>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}
