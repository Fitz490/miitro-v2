import { Link } from "wouter";
import { MiitroLogo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-16 border-t border-border/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <MiitroLogo variant="dark" />
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              Empowering drivers to take control of their future. The Founding Driver Program is our commitment to those who build the network with us.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/program" className="hover:text-primary transition-colors">Program Details</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/driver-agreement" className="hover:text-primary transition-colors">Driver Agreement</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <p>© {new Date().getFullYear()} Miitro Rideshare. All rights reserved.</p>
            <p className="text-xs opacity-60">Miitro is a product of Unique Horn LLC.</p>
          </div>
          <div className="flex gap-6">
            <span className="opacity-40 cursor-not-allowed select-none" title="Coming soon">Twitter</span>
            <span className="opacity-40 cursor-not-allowed select-none" title="Coming soon">LinkedIn</span>
            <span className="opacity-40 cursor-not-allowed select-none" title="Coming soon">Instagram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
