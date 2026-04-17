import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemberGate } from "@/hooks/use-member-gate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Car, Plus, Clock } from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const PLATFORMS = ["Miitro", "Uber", "Lyft", "Other"] as const;

interface TripRecord {
  id: number;
  tripDate: string;
  earningsAmount: string;
  platform: string | null;
  createdAt: string;
}

// ─── Trip Log Page ─────────────────────────────────────────────────────────────

export default function TripLog() {
  const { blocked } = useMemberGate({ requirePlatform: true }); // membership + bundle only
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [tripDate, setTripDate] = useState("");
  const [earnings, setEarnings] = useState("");
  const [platform, setPlatform] = useState("Miitro");
  const [customPlatform, setCustomPlatform] = useState("");

  const effectivePlatform =
    platform === "Other" ? customPlatform.trim() || "Other" : platform;

  // Recent trips
  const { data: trips = [], isLoading: tripsLoading } = useQuery<TripRecord[]>({
    queryKey: ["member-trips"],
    queryFn: async () => {
      const res = await fetch("/api/members/trips");
      if (!res.ok) throw new Error("Failed to load trips");
      return res.json();
    },
    enabled: !blocked,
  });

  const tripMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/members/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripDate,
          earningsAmount: parseFloat(earnings),
          platform: effectivePlatform || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to log trip");
      }
      return res.json();
    },
    onSuccess: () => {
      setTripDate("");
      setEarnings("");
      setPlatform("Miitro");
      setCustomPlatform("");
      queryClient.invalidateQueries({ queryKey: ["member-trips"] });
      queryClient.invalidateQueries({ queryKey: ["member-dashboard"] });
      toast({ title: "Trip logged!", description: "Your earnings have been recorded." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  if (blocked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const canSubmit = !!tripDate && !!earnings && parseFloat(earnings) > 0 && !tripMutation.isPending;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        <div>
          <h1 className="text-3xl font-bold mb-1">Trip Log</h1>
          <p className="text-muted-foreground">
            Manually log trips and earnings to track your performance. Future platform integrations
            will automate this.
          </p>
        </div>

        {/* Log a trip */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Log a Trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {/* Date */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Trip Date</label>
                <Input
                  type="date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  max={today}
                />
              </div>

              {/* Earnings */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Earnings ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={earnings}
                  onChange={(e) => setEarnings(e.target.value)}
                  placeholder="24.50"
                />
              </div>

              {/* Platform dropdown */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Custom platform name (revealed when "Other" is selected) */}
              {platform === "Other" && (
                <div>
                  <label className="text-sm font-medium block mb-1.5">Platform Name</label>
                  <Input
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    placeholder="e.g. Via, Wingz…"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={() => tripMutation.mutate()}
              disabled={!canSubmit}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {tripMutation.isPending ? "Logging…" : "Log Trip"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent trips */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" /> Recent Trips
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your last 50 logged trips.</p>
          </CardHeader>
          <CardContent>
            {tripsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed bg-muted/20">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="font-semibold text-muted-foreground">No trips logged yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the form above to start tracking your earnings.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {trips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {trip.platform ?? "Unknown platform"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(trip.tripDate)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600 shrink-0">
                      {formatCurrency(parseFloat(trip.earningsAmount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
