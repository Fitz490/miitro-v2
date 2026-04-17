import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { Check } from "lucide-react";

// ─── Password rules (mirrored from apply page) ────────────────────────────────

const PASSWORD_RULES = [
  { label: "At least 8 characters",        test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter (A–Z)",    test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter (a–z)",    test: (v: string) => /[a-z]/.test(v) },
  { label: "One number (0–9)",              test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character (!@#…)",  test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Extract the token from the URL query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setError("No reset token found. Please request a new password reset link.");
      setStatus("error");
    } else {
      setToken(t);
    }
  }, []);

  const passedRules = PASSWORD_RULES.filter((r) => r.test(newPassword));
  const passwordValid = passedRules.length === PASSWORD_RULES.length;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError("Your password does not meet all the requirements below.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, newPassword }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || "Something went wrong. Please try again.");
      }

      setStatus("success");
      // Redirect to login with a success flag after a short delay
      setTimeout(() => setLocation("/login?reset=success"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-4 py-24">
          <Card className="shadow-xl">
            <CardContent className="pt-10 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Password Reset!</h2>
              <p className="text-muted-foreground">
                Your password has been updated. Redirecting you to log in…
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const isTokenError = status === "error" && !token;

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-muted-foreground">
            Choose a strong, new password for your Miitro account.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="pt-8">
            {isTokenError ? (
              <div className="text-center space-y-4">
                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
                <Link href="/forgot-password" className="text-primary font-semibold hover:underline text-sm">
                  Request a new reset link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                      disabled={status === "loading"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password requirements */}
                  {newPassword && (
                    <ul className="mt-2 space-y-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(newPassword);
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
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    disabled={status === "loading"}
                  />
                  {confirmPassword && (
                    <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-emerald-600" : "text-destructive"}`}>
                      {passwordsMatch
                        ? <><Check className="w-3 h-3" /> Passwords match</>
                        : <><AlertCircle className="w-3 h-3" /> Passwords do not match</>
                      }
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={status === "loading" || !passwordValid || !passwordsMatch}
                >
                  {status === "loading" ? "Resetting…" : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
