import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useMemberGate } from "@/hooks/use-member-gate";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen, Play, FileText, Lock, CheckCircle2,
  Clock, ChevronRight, Download, Video, ArrowRight,
} from "lucide-react";

interface TrainingModule {
  id: number;
  title: string;
  description: string | null;
  moduleType: "video" | "pdf" | "quiz" | "live";
  sectionTitle: string | null;
  orderIndex: number;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
  requiredTier: string;
  isAccessible: boolean;
  isLocked: boolean;
  progress: {
    status: "not_started" | "in_progress" | "completed";
    progressPercent: number;
    completedAt: string | null;
    lastAccessedAt: string | null;
  };
}

const TYPE_ICON: Record<string, React.ElementType> = {
  video: Video,
  pdf: FileText,
  quiz: BookOpen,
  live: Play,
};

const STATUS_CONFIG = {
  not_started: { label: "Start", variant: "default" as const, className: "" },
  in_progress: { label: "Continue", variant: "default" as const, className: "bg-amber-500 hover:bg-amber-600" },
  completed: { label: "Review", variant: "outline" as const, className: "border-emerald-500 text-emerald-700" },
};

function ModuleCard({ mod }: { mod: TrainingModule }) {
  const [, setLocation] = useLocation();
  const Icon = TYPE_ICON[mod.moduleType] ?? BookOpen;
  const statusCfg = STATUS_CONFIG[mod.progress.status];

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
      mod.isLocked
        ? "opacity-60 bg-muted/20"
        : mod.progress.status === "completed"
        ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
        : "bg-card hover:border-primary/40 hover:shadow-sm"
    }`}>
      {/* Thumbnail / icon */}
      <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${
        mod.isLocked ? "bg-muted" : "bg-primary/10"
      }`}>
        {mod.isLocked
          ? <Lock className="w-5 h-5 text-muted-foreground" />
          : mod.progress.status === "completed"
          ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          : <Icon className="w-6 h-6 text-primary" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-sm leading-snug">{mod.title}</p>
          <div className="flex items-center gap-1.5 shrink-0">
            {mod.moduleType === "pdf" && (
              <Badge variant="secondary" className="text-xs">PDF</Badge>
            )}
            {mod.requiredTier !== "starter" && (
              <Badge variant="outline" className="text-xs capitalize">{mod.requiredTier}+</Badge>
            )}
          </div>
        </div>

        {mod.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{mod.description}</p>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {mod.durationMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {mod.durationMinutes} min
              </span>
            )}
            {mod.progress.status === "in_progress" && (
              <span className="text-amber-600 font-medium">In Progress</span>
            )}
            {mod.progress.status === "completed" && (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            )}
          </div>

          {!mod.isLocked && (
            <Button
              size="sm"
              variant={statusCfg.variant}
              className={`h-7 text-xs shrink-0 ${statusCfg.className}`}
              onClick={() => setLocation(`/training/${mod.id}`)}
            >
              {statusCfg.label} <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          )}

          {mod.isLocked && (
            <Badge variant="outline" className="text-xs text-muted-foreground capitalize">
              {mod.requiredTier} tier
            </Badge>
          )}
        </div>

        {/* Progress bar for in-progress */}
        {mod.progress.status === "in_progress" && mod.progress.progressPercent > 0 && (
          <div className="mt-2">
            <Progress value={mod.progress.progressPercent} className="h-1" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrainingCenter() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { blocked } = useMemberGate({ requireTraining: true }); // training + bundle only

  const { data: modules, isLoading } = useQuery<TrainingModule[]>({
    queryKey: ["training-modules"],
    queryFn: async () => {
      const res = await fetch("/api/training/modules");
      if (!res.ok) throw new Error("Failed to load modules");
      return res.json();
    },
    enabled: !blocked && !!user,
  });

  if (blocked || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const completedCount = modules?.filter((m) => m.progress.status === "completed").length ?? 0;
  const totalCount = modules?.length ?? 0;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group modules by section
  const sections = modules?.reduce<Record<string, TrainingModule[]>>((acc, mod) => {
    const section = mod.sectionTitle ?? "General";
    if (!acc[section]) acc[section] = [];
    acc[section].push(mod);
    return acc;
  }, {}) ?? {};

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Training Center</h1>
          <p className="text-muted-foreground">
            Professional driver training — video modules, guides, and downloadable resources.
          </p>
        </div>

        {/* Progress overview */}
        {totalCount > 0 && (
          <Card>
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">Your Overall Progress</p>
                  <p className="text-sm text-muted-foreground">{completedCount} of {totalCount} modules completed</p>
                </div>
                <span className="text-2xl font-bold text-primary">{pct}%</span>
              </div>
              <Progress value={pct} className="h-3" />
              <div className="flex gap-6 mt-4 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> {completedCount} Completed
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <Play className="w-4 h-4" /> {modules?.filter((m) => m.progress.status === "in_progress").length ?? 0} In Progress
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" /> {modules?.filter((m) => m.progress.status === "not_started").length ?? 0} Not Started
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && totalCount === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Training modules coming soon</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Our team is preparing your training curriculum. Check back shortly for video modules and resources.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Module sections */}
        {!isLoading && Object.entries(sections).map(([sectionTitle, mods]) => (
          <div key={sectionTitle}>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {sectionTitle}
              <Badge variant="secondary" className="ml-1">{mods.length}</Badge>
            </h2>
            <div className="space-y-3">
              {mods.map((mod) => (
                <ModuleCard key={mod.id} mod={mod} />
              ))}
            </div>
          </div>
        ))}

        {/* Resources section */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="w-5 h-5 text-primary" /> Downloadable Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              PDFs, templates, checklists, and guides are available in your resource library.
            </p>
            <Button variant="outline" onClick={() => setLocation("/membership")}>
              Browse Resources <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
