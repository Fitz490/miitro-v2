import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMemberGate } from "@/hooks/use-member-gate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Target, Plus, Trash2, CheckCircle2, Clock, TrendingUp,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ActiveGoal {
  id: number;
  goalType: string;
  dateFrom: string;
  dateTo: string;
  tripGoal: number | null;
  earningsGoal: string | null;
  tripProgress: number;
  earningsProgress: number;
  daysRemaining: number;
  createdAt: string;
}

// The GET /api/members/goals endpoint returns all goals (not just active ones),
// so we distinguish them by date for the "active" label in the UI.
type GoalRecord = ActiveGoal;

// ─── Helper: format a date range label ────────────────────────────────────────

function dateRangeLabel(from: string, to: string) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(from)} – ${fmt(to)}`;
}

// ─── Helper: is a goal currently active? ─────────────────────────────────────

function isGoalActive(goal: GoalRecord): boolean {
  const now = Date.now();
  return new Date(goal.dateFrom).getTime() <= now && now <= new Date(goal.dateTo).getTime();
}

// ─── Single Goal Card ──────────────────────────────────────────────────────────

function GoalCard({
  goal,
  onDelete,
  deleting,
}: {
  goal: GoalRecord;
  onDelete: (id: number) => void;
  deleting: boolean;
}) {
  const active = isGoalActive(goal);
  const past = new Date(goal.dateTo).getTime() < Date.now();

  const tripPct = goal.tripGoal
    ? Math.min(100, Math.round((goal.tripProgress / goal.tripGoal) * 100))
    : null;
  const earnPct = goal.earningsGoal
    ? Math.min(
        100,
        Math.round(
          (goal.earningsProgress / parseFloat(goal.earningsGoal)) * 100
        )
      )
    : null;

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${active ? "border-primary/40 bg-primary/5" : "bg-muted/20"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm capitalize">{goal.goalType} Goal</span>
          <span className="text-xs text-muted-foreground">{dateRangeLabel(goal.dateFrom, goal.dateTo)}</span>
          {active && (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
              Active · {goal.daysRemaining}d left
            </Badge>
          )}
          {past && (
            <Badge variant="secondary" className="text-xs">Completed</Badge>
          )}
          {!active && !past && (
            <Badge variant="outline" className="text-xs">Upcoming</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive h-7 w-7"
          onClick={() => onDelete(goal.id)}
          disabled={deleting}
          title="Delete goal"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Trip goal progress */}
      {goal.tripGoal !== null && tripPct !== null && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Trips — {goal.tripProgress} / {goal.tripGoal}
            </span>
            <span>{tripPct}%</span>
          </div>
          <Progress value={tripPct} className="h-2" />
        </div>
      )}

      {/* Earnings goal progress */}
      {goal.earningsGoal !== null && earnPct !== null && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              Earnings — {formatCurrency(goal.earningsProgress)} / {formatCurrency(parseFloat(goal.earningsGoal))}
            </span>
            <span>{earnPct}%</span>
          </div>
          <Progress value={earnPct} className="h-2" />
        </div>
      )}
    </div>
  );
}

// ─── Goals Page ────────────────────────────────────────────────────────────────

export default function Goals() {
  const { blocked } = useMemberGate({ requirePlatform: true }); // membership + bundle only
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [goalType, setGoalType] = useState<"weekly" | "monthly">("weekly");
  const [dateFrom, setDateFrom] = useState("");
  const [tripGoal, setTripGoal] = useState("");
  const [earningsGoal, setEarningsGoal] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Fetch all goals
  const { data: goals = [], isLoading } = useQuery<GoalRecord[]>({
    queryKey: ["member-goals"],
    queryFn: async () => {
      const res = await fetch("/api/members/goals");
      if (!res.ok) throw new Error("Failed to load goals");
      return res.json();
    },
    enabled: !blocked,
  });

  // Create goal
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = { goalType, dateFrom };
      if (tripGoal) payload.tripGoal = parseInt(tripGoal, 10);
      if (earningsGoal) payload.earningsGoal = parseFloat(earningsGoal);

      const res = await fetch("/api/members/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? "Failed to create goal");
      return body;
    },
    onSuccess: () => {
      setDateFrom("");
      setTripGoal("");
      setEarningsGoal("");
      queryClient.invalidateQueries({ queryKey: ["member-goals"] });
      queryClient.invalidateQueries({ queryKey: ["member-dashboard"] });
      toast({ title: "Goal set!", description: "Your new goal has been saved." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  // Delete goal
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/members/goals/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to delete goal");
      }
    },
    onSuccess: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["member-goals"] });
      queryClient.invalidateQueries({ queryKey: ["member-dashboard"] });
      toast({ title: "Goal removed" });
    },
    onError: (err: Error) => {
      setDeletingId(null);
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const canCreate =
    !!dateFrom &&
    (!!tripGoal || !!earningsGoal) &&
    !createMutation.isPending;

  if (blocked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const activeGoals = goals.filter(isGoalActive);
  const otherGoals = goals.filter((g) => !isGoalActive(g));

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        <div>
          <h1 className="text-3xl font-bold mb-1">Goals</h1>
          <p className="text-muted-foreground">
            Set weekly or monthly trip and earnings targets to keep your progress on track.
          </p>
        </div>

        {/* Create goal */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Set a New Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type + start date */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Goal Type</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as "weekly" | "monthly")}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="weekly">Weekly (7 days)</option>
                  <option value="monthly">Monthly (30 days)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Start Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  min={today}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  End date is auto-calculated ({goalType === "weekly" ? "7 days" : "30 days"}).
                </p>
              </div>
            </div>

            {/* Trip + Earnings targets */}
            <p className="text-sm text-muted-foreground -mb-1">
              Set at least one target below:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Trip Target <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={tripGoal}
                  onChange={(e) => setTripGoal(e.target.value)}
                  placeholder="e.g. 40"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Earnings Target ($) <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={earningsGoal}
                  onChange={(e) => setEarningsGoal(e.target.value)}
                  placeholder="e.g. 800"
                />
              </div>
            </div>

            <Button onClick={() => createMutation.mutate()} disabled={!canCreate}>
              <Target className="w-4 h-4 mr-1.5" />
              {createMutation.isPending ? "Saving…" : "Save Goal"}
            </Button>
          </CardContent>
        </Card>

        {/* Active goals */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {activeGoals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Active Goals
                </h2>
                <div className="space-y-3">
                  {activeGoals.map((g) => (
                    <GoalCard
                      key={g.id}
                      goal={g}
                      onDelete={handleDelete}
                      deleting={deletingId === g.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {otherGoals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" /> Past & Upcoming
                </h2>
                <div className="space-y-3">
                  {otherGoals.map((g) => (
                    <GoalCard
                      key={g.id}
                      goal={g}
                      onDelete={handleDelete}
                      deleting={deletingId === g.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {goals.length === 0 && (
              <div className="text-center py-12 rounded-xl border border-dashed bg-muted/20">
                <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="font-semibold text-muted-foreground">No goals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the form above to set your first trip or earnings goal.
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </AppLayout>
  );
}
