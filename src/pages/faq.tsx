import { AppLayout } from "@/components/layout/app-layout";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is the membership fee for?",
    a: "The one-time membership fee covers your enrollment in the Miitro Founding Driver Program. It gives you immediate access to the full training curriculum, live coaching sessions, the member community, and your driver dashboard. The fee is not a subscription — it is a one-time program access payment. It does not represent an investment, deposit, or equity in Miitro."
  },
  {
    q: "What training is included?",
    a: "Your membership includes access to Miitro's full professional driver training library — video modules, PDF guides, safety and compliance content, earnings optimization strategies, and tax guidance. Training is self-paced and available immediately after enrollment. Live Zoom coaching sessions are also included for all active members."
  },
  {
    q: "Is there a referral or affiliate program?",
    a: "Miitro offers an optional affiliate program for enrolled members. If you choose to participate, you can earn a flat commission when someone purchases a Miitro product through your personal affiliate link. Commissions are based on verified product sales only — not on recruiting other members. Participation is entirely voluntary and has no effect on your own membership benefits."
  },
  {
    q: "Is the Founding Driver membership permanent?",
    a: "Yes. Once enrolled in good standing, your Founding Member status is preserved. This gives you priority access, recognition, and the benefits described at enrollment. Your membership is not tied to recruiting other members or maintaining any sales activity."
  },
  {
    q: "What kind of vehicle do I need?",
    a: "We accept most 4-door vehicles that are 2010 or newer, in good cosmetic and mechanical condition. Specific requirements may vary by city and local regulations."
  },
  {
    q: "Does Miitro guarantee any earnings?",
    a: "No. Miitro does not guarantee any level of income, earnings, or financial return from membership. The platform provides training, resources, and community access to help you develop your driving career. Any results will depend on your individual effort, local market conditions, and factors outside Miitro's control."
  }
];

export default function Faq() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-lg">Everything you need to know about the Founding Driver Program.</p>
        </div>

        <Accordion.Root type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <Accordion.Item 
              key={i} 
              value={`item-${i}`}
              className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm hover:border-primary/50 transition-colors"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex flex-1 items-center justify-between py-5 px-6 font-medium transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180 w-full text-left">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-up data-[state=open]:slide-down">
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </AppLayout>
  );
}
