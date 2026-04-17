import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, user, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Detect ?reset=success from the reset-password page
  const resetSuccess = new URLSearchParams(window.location.search).get("reset") === "success";

  // Redirect already-authenticated users to their dashboard.
  const isUserPresent = !!user;
  useEffect(() => {
    if (!isLoading && isUserPresent) {
      setLocation(isAdmin ? "/admin" : "/dashboard");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isUserPresent, isAdmin]);

  const { register, handleSubmit, setValue, setFocus, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    try {
      await login(data);
    } catch (err: unknown) {
      // Clear the password field and return focus to it so the user can retry immediately.
      setValue("password", "");
      setFocus("password");

      // The generated API client throws an ApiError with a numeric .status
      // on HTTP errors. 401 means bad credentials; anything else (network
      // failure, 5xx server error, etc.) gets a different message so the
      // user isn't misled into thinking their password is wrong.
      const httpStatus = (err as { status?: number }).status;
      setLoginError(
        httpStatus === 401
          ? "Invalid email or password."
          : "Unable to log in right now. Please check your connection and try again."
      );
    }
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Log in to your Miitro account.</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="pt-8">
            {resetSuccess && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400 mb-5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Password reset successfully. Please log in with your new password.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  {...register("email", { onChange: () => setLoginError(null) })}
                  type="email"
                  inputMode="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
                {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    {...register("password", { onChange: () => setLoginError(null) })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-sm text-destructive">{errors.password.message}</span>}
              </div>

              {loginError && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in…" : "Log In"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/join" className="text-primary font-semibold hover:underline">
                View plans and join
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
