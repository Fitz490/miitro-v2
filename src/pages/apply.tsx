import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { getPlan } from "@/lib/plans";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StateSelectElement } from "@/lib/us-states";
import { useRegisterDriver, getGetCurrentUserQueryKey, type UserProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";

// ─── Common passwords blocklist ───────────────────────────────────────────────

const COMMON_PASSWORDS = new Set([
  "password", "password1", "password12", "password123",
  "12345678", "123456789", "1234567890", "qwerty123",
  "iloveyou", "sunshine", "princess", "welcome1",
  "monkey123", "dragon123", "master123", "letmein1",
  "football", "baseball", "superman", "batman123",
  "admin123", "driver123", "miitro1234", "miitro2024",
]);

// ─── Password rules ───────────────────────────────────────────────────────────

interface PasswordRule {
  label: string;
  test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters",        test: (v) => v.length >= 8 },
  { label: "One uppercase letter (A–Z)",    test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter (a–z)",    test: (v) => /[a-z]/.test(v) },
  { label: "One number (0–9)",              test: (v) => /[0-9]/.test(v) },
  { label: "One special character (!@#…)",  test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function passwordScore(value: string): number {
  if (!value) return 0;
  return PASSWORD_RULES.filter((r) => r.test(value)).length;
}

function strengthLabel(score: number): { label: string; color: string; barColor: string } {
  if (score <= 1) return { label: "Weak",   color: "text-red-500",    barColor: "bg-red-500" };
  if (score <= 2) return { label: "Fair",   color: "text-orange-500", barColor: "bg-orange-400" };
  if (score <= 3) return { label: "Good",   color: "text-yellow-600", barColor: "bg-yellow-400" };
  if (score === 4) return { label: "Strong", color: "text-emerald-600", barColor: "bg-emerald-400" };
  return            { label: "Very Strong", color: "text-emerald-600", barColor: "bg-emerald-500" };
}

// ─── Strength indicator component ─────────────────────────────────────────────

function PasswordStrengthIndicator({ value }: { value: string }) {
  if (!value) return null;

  const score = passwordScore(value);
  const { label, color, barColor } = strengthLabel(score);
  const isCommon = COMMON_PASSWORDS.has(value.toLowerCase());

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= score ? barColor : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold whitespace-nowrap ${color}`}>{label}</span>
      </div>

      {/* Common password warning */}
      {isCommon && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X className="w-3 h-3" /> This is a commonly used password. Please choose a different one.
        </p>
      )}

      {/* Checklist */}
      <ul className="space-y-1">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(value);
          return (
            <li key={rule.label} className={`flex items-center gap-1.5 text-xs transition-colors ${passed ? "text-emerald-600" : "text-muted-foreground"}`}>
              {passed
                ? <Check className="w-3 h-3 shrink-0 text-emerald-500" />
                : <div className="w-3 h-3 shrink-0 rounded-full border border-muted-foreground/40" />
              }
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Form schema ──────────────────────────────────────────────────────────────

const applySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character")
    .refine(
      (v) => !COMMON_PASSWORDS.has(v.toLowerCase()),
      "This password is too common. Please choose a stronger one."
    ),
  phone: z.string().min(10, "Valid phone number required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  vehicleType: z.string().min(2, "Vehicle type is required"),
  yearsExperience: z.coerce.number().min(0, "Must be a positive number"),
  referralCode: z.string().optional(),
  agreedToTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
  // SMS consent is optional — users may register without it.
  smsConsent: z.boolean().optional().default(false),
});

type ApplyFormValues = z.infer<typeof applySchema>;

// ─── Page component ───────────────────────────────────────────────────────────

export default function Apply() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const { data: products = [], isLoading: productsLoading } = useProducts();

  // Read selected plan from ?plan= URL param (defaults to bundle).
  // planKey is stable from the URL; plan is derived once products load.
  const planKey = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("plan");
  }, []);

  const plan = useMemo(
    () => (products.length > 0 ? getPlan(planKey, products) : null),
    [planKey, products],
  );

  const registerMutation = useRegisterDriver({
    mutation: {
      onSuccess: (data) => {
        // Populate the auth cache with the freshly-registered user so the
        // payment page guard sees a logged-in user immediately (avoids the
        // stale-null cache causing a spurious redirect to /login).
        queryClient.setQueryData(getGetCurrentUserQueryKey(), (data as { user: UserProfile }).user);
        setLocation(`/payment?plan=${plan?.key ?? "bundle"}`);
      },
      onError: (error: unknown) => {
        const anyError = error as { data?: { message?: string }; message?: string };
        const serverMsg = anyError?.data?.message;
        setFormError(serverMsg || anyError?.message || "An error occurred. Please try again.");
      },
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
  });

  // Auto-fill referral/affiliate code from ?ref= URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setValue("referralCode", ref.trim().toUpperCase());
    }
  }, [setValue]);


  const onSubmit = (data: ApplyFormValues) => {
    setFormError(null);
    const { firstName, lastName, ...rest } = data;
    registerMutation.mutate({
      data: { ...rest, fullName: `${firstName.trim()} ${lastName.trim()}` } as any,
    });
  };

  const passwordInputProps = register("password", {
    onChange: (e) => setPasswordValue(e.target.value),
  });

  // Wait for products to load so plan label/price are available in the form header
  if (productsLoading || !plan) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {plan ? `${plan.label} — ${plan.priceDisplay} one-time` : "Loading plan…"}
          </div>
          <h1 className="text-4xl font-bold mb-4">Create Your Account</h1>
          <p className="text-muted-foreground">
            Complete your profile to continue to the{" "}
            <strong>{plan?.label ?? "checkout"}</strong>.
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* First + Last name */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input {...register("firstName")} placeholder="Jane" />
                  {errors.firstName && <span className="text-xs text-destructive">{errors.firstName.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input {...register("lastName")} placeholder="Doe" />
                  {errors.lastName && <span className="text-xs text-destructive">{errors.lastName.message}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input {...register("email")} type="email" placeholder="jane@example.com" />
                {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
              </div>

              {/* Password + Phone */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      {...passwordInputProps}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator value={passwordValue} />
                  {errors.password && (
                    <span className="text-xs text-destructive block mt-1">{errors.password.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input {...register("phone")} placeholder="(555) 000-0000" />
                  {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
                </div>
              </div>

              {/* City + State */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input {...register("city")} placeholder="Austin" />
                  {errors.city && <span className="text-xs text-destructive">{errors.city.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <StateSelectElement
                    value={watch("state") ?? ""}
                    onChange={(val) => setValue("state", val, { shouldValidate: true })}
                  />
                  {errors.state && <span className="text-xs text-destructive">{errors.state.message}</span>}
                </div>
              </div>

              {/* Vehicle + Experience */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <Input {...register("vehicleType")} placeholder="e.g. Sedan, SUV" />
                  {errors.vehicleType && <span className="text-xs text-destructive">{errors.vehicleType.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Years Driving Experience</label>
                  <Input {...register("yearsExperience")} type="number" min="0" placeholder="5" />
                  {errors.yearsExperience && <span className="text-xs text-destructive">{errors.yearsExperience.message}</span>}
                </div>
              </div>

              {/* Referral code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Code (Optional)</label>
                <Input
                  {...register("referralCode")}
                  placeholder="Enter code if you have one"
                  className="bg-primary/5 border-primary/20 focus-visible:ring-primary/20"
                />
              </div>

              {/* ── Required legal consent ───────────────────────────────── */}
              <div className="pt-4 border-t space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required</p>
                <div className="flex items-start space-x-3 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    {...register("agreedToTerms")}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="space-y-1">
                    <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                      I agree to the{" "}
                      <Link href="/driver-agreement" target="_blank" className="text-primary hover:underline">Driver Agreement</Link>
                      {", "}
                      <Link href="/terms-of-service" target="_blank" className="text-primary hover:underline">Terms of Service</Link>
                      {", and "}
                      <Link href="/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      I understand this application requires a {plan!.priceDisplay} payment on the next step to activate my account.
                    </p>
                    {errors.agreedToTerms && <p className="text-xs text-destructive">{errors.agreedToTerms.message}</p>}
                  </div>
                </div>
              </div>

              {/* ── Optional SMS consent ─────────────────────────────────── */}
              <div className="pt-3 border-t border-dashed space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Optional</p>
                <div className="flex items-start space-x-3 pt-1">
                  <input
                    type="checkbox"
                    id="smsConsent"
                    {...register("smsConsent")}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="space-y-1">
                    <label htmlFor="smsConsent" className="text-sm leading-snug cursor-pointer text-muted-foreground">
                      I agree to receive SMS updates about my account (optional). Message frequency varies. Message &amp; data rates may apply. Reply STOP to opt out, HELP for help. Consent is not required to use this service.
                    </label>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Submitting…"
                  : `Continue to Payment (${plan!.priceDisplay})`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
