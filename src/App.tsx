import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Public pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Pricing from "@/pages/pricing";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import Join from "@/pages/join";
import Apply from "@/pages/apply";
import Login from "@/pages/login";
import RideshareWaitlist from "@/pages/rideshare-waitlist";

// Payment flow
import Payment from "@/pages/payment";
import MockCheckout from "@/pages/mock-checkout";

// Member protected pages
import MemberDashboard from "@/pages/member-dashboard";
import TrainingCenter from "@/pages/training-center";
import TrainingModule from "@/pages/training-module";
import LiveEvents from "@/pages/live-events";
import MembershipBenefits from "@/pages/membership-benefits";
import AffiliatePage from "@/pages/affiliate";
import ProfileSettings from "@/pages/profile-settings";
import TripLog from "@/pages/trip-log";
import Goals from "@/pages/goals";

// Admin
import AdminDashboard from "@/pages/admin-dashboard";

// Legal & auth
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import DriverAgreement from "@/pages/driver-agreement";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import VerifyCode from "@/pages/verify-code";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* ── Public ───────────────────────────────────────────────────── */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/pricing" component={Pricing} />
      {/* Legacy /program route → redirect to /pricing */}
      <Route path="/program" component={Pricing} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contact" component={Contact} />
      <Route path="/join" component={Join} />
      <Route path="/apply" component={Apply} />
      <Route path="/login" component={Login} />
      <Route path="/roadmap" component={RideshareWaitlist} />

      {/* ── Payment flow ─────────────────────────────────────────────── */}
      <Route path="/payment" component={Payment} />
      <Route path="/payment/success" component={Payment} />
      <Route path="/payment/mock-checkout" component={MockCheckout} />

      {/* ── Member protected ─────────────────────────────────────────── */}
      <Route path="/dashboard" component={MemberDashboard} />
      <Route path="/training" component={TrainingCenter} />
      <Route path="/training/:id" component={TrainingModule} />
      <Route path="/events" component={LiveEvents} />
      <Route path="/membership" component={MembershipBenefits} />
      <Route path="/affiliate" component={AffiliatePage} />
      <Route path="/trip-log" component={TripLog} />
      <Route path="/goals" component={Goals} />
      <Route path="/settings" component={ProfileSettings} />

      {/* ── Admin ────────────────────────────────────────────────────── */}
      <Route path="/admin" component={AdminDashboard} />

      {/* ── Auth ─────────────────────────────────────────────────────── */}
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-code" component={VerifyCode} />

      {/* ── Legal ────────────────────────────────────────────────────── */}
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/driver-agreement" component={DriverAgreement} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
