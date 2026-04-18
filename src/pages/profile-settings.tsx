import { apiFetch } from "@/lib/api-fetch";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMemberGate } from "@/hooks/use-member-gate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { StateSelectElement } from "@/lib/us-states";
import {
  User, CreditCard, KeyRound, CheckCircle2, Eye, EyeOff,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PayoutInfo {
  payoutMethod: string | null;
  payoutFullName: string | null;
  payoutContact: string | null;
  payoutNotes: string | null;
  payoutUpdatedAt: string | null;
}

const PAYOUT_METHODS = [
  { value: "zelle",         label: "Zelle",         contactLabel: "Zelle email or phone" },
  { value: "cash_app",      label: "Cash App",       contactLabel: "Cash App $cashtag or phone" },
  { value: "paypal",        label: "PayPal",         contactLabel: "PayPal email" },
  { value: "bank_transfer", label: "Bank Transfer",  contactLabel: "Account email / routing info" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProfileSettings() {
  const { user } = useAuth();
  const { blocked } = useMemberGate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── Profile state ──────────────────────────────────────────────────────────
  // firstName / lastName are derived from user.fullName for display; on save they
  // are concatenated back into fullName so the backend field is unchanged.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  useEffect(() => {
    if (user) {
      const parts = (user.fullName ?? "").trim().split(/\s+/);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
      setPhone((user as any).phone ?? "");
      setCity((user as any).city ?? "");
      setState((user as any).state ?? "");
      setVehicleType((user as any).vehicleType ?? "");
    }
  }, [user]);

  // ── Payout state ───────────────────────────────────────────────────────────
  const [method, setMethod] = useState("");
  const [payoutName, setPayoutName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [payoutSaved, setPayoutSaved] = useState(false);

  // ── Password state ─────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Payout query ───────────────────────────────────────────────────────────
  const { data: payoutInfo } = useQuery<PayoutInfo>({
    queryKey: ["member-payout-info"],
    queryFn: async () => {
      const res = await apiFetch("/api/members/payout-info");
      if (!res.ok) throw new Error("Failed to load payout info");
      return res.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (payoutInfo) {
      setMethod(payoutInfo.payoutMethod ?? "");
      setPayoutName(payoutInfo.payoutFullName ?? "");
      setContact(payoutInfo.payoutContact ?? "");
      setNotes(payoutInfo.payoutNotes ?? "");
    }
  }, [payoutInfo]);

  // ── Profile mutation ───────────────────────────────────────────────────────
  const profileMutation = useMutation({
    mutationFn: async () => {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await apiFetch("/api/members/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, city, state, vehicleType }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Profile updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["member-dashboard"] });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  // ── Payout mutation ────────────────────────────────────────────────────────
  const payoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/api/members/payout-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutMethod: method,
          payoutFullName: payoutName,
          payoutContact: contact,
          payoutNotes: notes,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Save failed");
      return body;
    },
    onSuccess: () => {
      setPayoutSaved(true);
      setTimeout(() => setPayoutSaved(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["member-payout-info"] });
      toast({ title: "Saved", description: "Payout information updated." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  // ── Password mutation ──────────────────────────────────────────────────────
  const passwordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/api/members/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? "Password update failed");
      return body;
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated", description: "Your password has been changed." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const selectedMethod = PAYOUT_METHODS.find((m) => m.value === method);
  const contactLabel = selectedMethod?.contactLabel ?? "Email or phone";

  if (blocked || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const canChangePassword =
    !!currentPassword && !!newPassword && !!confirmPassword && !passwordMutation.isPending;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        <div>
          <h1 className="text-3xl font-bold mb-1">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile, payout info, and security.</p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First name */}
              <div>
                <label className="text-sm font-medium block mb-1.5">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                />
              </div>
              {/* Last name */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  type="tel"
                />
              </div>
              {/* City */}
              <div>
                <label className="text-sm font-medium block mb-1.5">City</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Atlanta"
                />
              </div>
              {/* State dropdown */}
              <div>
                <label className="text-sm font-medium block mb-1.5">State</label>
                <StateSelectElement value={state} onChange={setState} />
              </div>
              {/* Vehicle */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Vehicle Type</label>
                <Input
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  placeholder="Toyota Camry 2021"
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-3">
                Account email: <strong>{user.email}</strong> (contact support to change)
              </p>
              <Button
                onClick={() => profileMutation.mutate()}
                disabled={profileMutation.isPending}
              >
                {profileMutation.isPending ? "Saving…" : "Save Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Change Password
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              You must confirm your current password before setting a new one.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current password */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="text-sm font-medium block mb-1.5">New Password</label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters.</p>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match.</p>
                )}
              </div>

              <Button
                onClick={() => passwordMutation.mutate()}
                disabled={!canChangePassword || (!!newPassword && newPassword !== confirmPassword)}
              >
                {passwordMutation.isPending ? "Updating…" : "Update Password"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payout info */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Payout Information
              </CardTitle>
              {payoutInfo?.payoutUpdatedAt && (
                <span className="text-xs text-muted-foreground">
                  Updated {formatDate(payoutInfo.payoutUpdatedAt)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Used for affiliate commission payouts only. Kept secure and never shared.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Payout Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>Select a method…</option>
                  {PAYOUT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Full Name (for payment)</label>
                  <Input
                    value={payoutName}
                    onChange={(e) => setPayoutName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                  <p className="text-xs text-muted-foreground mt-1">As it appears on your payment account</p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">{contactLabel}</label>
                  <Input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={method === "cash_app" ? "$YourCashTag" : "email@example.com"}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional payout instructions…"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => payoutMutation.mutate()}
                  disabled={payoutMutation.isPending}
                >
                  {payoutMutation.isPending ? "Saving…" : "Save Payout Info"}
                </Button>
                {payoutSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Saved
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
