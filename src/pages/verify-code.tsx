import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { AlertCircle, CheckCircle2, Loader2, Mail, RefreshCw, ShieldCheck } from "lucide-react";

const CODE_LENGTH = 6;
const EXPIRY_SECONDS = 15 * 60;

export default function VerifyCode() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const mfaToken = new URLSearchParams(window.location.search).get("token") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [currentToken, setCurrentToken] = useState(mfaToken);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError(null);
    if (char && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
    // Auto-submit when all digits are filled
    if (char && index === CODE_LENGTH - 1 && next.every(d => d !== "")) {
      submitCode(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        focusInput(index - 1);
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted.length) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted);
    } else {
      focusInput(Math.min(pasted.length, CODE_LENGTH - 1));
    }
  };

  const submitCode = useCallback(async (codeOverride?: string) => {
    const code = codeOverride ?? digits.join("");
    if (code.length < CODE_LENGTH) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mfaToken: currentToken, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorType(data.error ?? "InvalidCode");
        setError(data.message ?? "Verification failed.");
        if (data.error !== "CodeExpired") {
          setDigits(Array(CODE_LENGTH).fill(""));
          focusInput(0);
        }
        return;
      }
      // Success — set user in cache and go to admin
      queryClient.setQueryData(getGetCurrentUserQueryKey(), data.user);
      setLocation("/admin");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [digits, currentToken, queryClient, setLocation]);

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    setError(null);
    setErrorType(null);
    try {
      const res = await fetch("/api/auth/resend-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mfaToken: currentToken }),
      });
      const data = await res.json();
      if (data.mfaToken) {
        setCurrentToken(data.mfaToken);
        setDigits(Array(CODE_LENGTH).fill(""));
        setSecondsLeft(EXPIRY_SECONDS);
        setResendSuccess(true);
        focusInput(0);
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const isExpired = secondsLeft <= 0;
  const codeComplete = digits.every(d => d !== "");

  if (!mfaToken) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Invalid verification session. Please <a href="/login" className="text-primary underline">log in again</a>.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-5">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verify Your Identity</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A 6-digit verification code was sent to your admin email address.
            <br />Enter it below to complete sign-in.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="pt-8 pb-8">

            {/* Timer */}
            <div className={`text-center text-sm font-medium mb-6 ${isExpired ? "text-destructive" : secondsLeft < 60 ? "text-amber-600" : "text-muted-foreground"}`}>
              {isExpired
                ? "Code expired — please request a new one"
                : <>Code expires in <span className="font-mono font-bold">{formatTime(secondsLeft)}</span></>
              }
            </div>

            {/* Success banner (resend) */}
            {resendSuccess && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400 mb-5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                A new code has been sent to your email.
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* 6-digit input boxes */}
            <div className="flex justify-center gap-2 mb-7" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={submitting || (isExpired && errorType !== "CodeExpired")}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  className={`w-11 h-14 text-center text-2xl font-bold rounded-lg border-2 bg-background outline-none transition-all
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    ${digit ? "border-primary/60" : "border-border"}
                    ${error && errorType !== "CodeExpired" ? "border-destructive/60 bg-destructive/5" : ""}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Verify button */}
            <Button
              className="w-full"
              size="lg"
              onClick={() => submitCode()}
              disabled={!codeComplete || submitting || isExpired}
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</>
                : <><ShieldCheck className="w-4 h-4 mr-2" />Verify Code</>
              }
            </Button>

            {/* Resend button */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {resending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending…</>
                  : <><RefreshCw className="w-3.5 h-3.5" />Resend Code</>
                }
              </button>
            </div>

            {/* Back to login */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <a href="/login" className="hover:text-primary transition-colors">← Back to login</a>
            </div>

          </CardContent>
        </Card>

        {/* Security note */}
        <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-3">
          <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Check your admin email inbox. The code is valid for 5 minutes and can only be used once. Max 5 attempts.</span>
        </div>
      </div>
    </AppLayout>
  );
}
