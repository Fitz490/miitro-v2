import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMemberGate } from "@/hooks/use-member-gate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { LessonSection, QuizQuestion } from "@/lib/training-content";
import {
  ArrowLeft, CheckCircle2, Clock, Download, ExternalLink,
  Play, FileText, BookOpen, ChevronRight, RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModuleDetail {
  id: number;
  title: string;
  description: string | null;
  moduleType: "video" | "pdf" | "quiz" | "live";
  sectionTitle: string | null;
  orderIndex: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
  requiredTier: string;
  // Rich static content merged by the API
  lessonSections: LessonSection[] | null;
  quizData: QuizQuestion[] | null;
  videoScript: string | null;
  workbookTitle: string | null;
  workbookDescription: string | null;
  progress: {
    status: "not_started" | "in_progress" | "completed";
    progressPercent: number;
    completedAt: string | null;
    lastAccessedAt: string | null;
  };
}

// ─── Lesson Sections ──────────────────────────────────────────────────────────

function LessonContent({ sections }: { sections: LessonSection[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" /> Lesson Content
      </h2>
      <div className="space-y-3">
        {sections.map((section, i) => (
          <Card key={i} className="border-border/60">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-foreground">{section.heading}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Video Script ─────────────────────────────────────────────────────────────

function VideoScriptCard({ script }: { script: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" /> Video Script
          </CardTitle>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? "Collapse" : "Read full script"}
            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Full narration for this module's video — read along or use as a study reference.
        </p>
      </CardHeader>
      {expanded && (
        <CardContent className="px-5 pb-5">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-mono">{script}</p>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Quiz Component ───────────────────────────────────────────────────────────

interface QuizState {
  selected: (number | null)[];
  submitted: boolean;
}

function QuizSection({ questions }: { questions: QuizQuestion[] }) {
  const [state, setState] = useState<QuizState>({
    selected: Array(questions.length).fill(null),
    submitted: false,
  });

  const score = state.submitted
    ? state.selected.filter((sel, i) => sel === questions[i].correctIndex).length
    : 0;

  const allAnswered = state.selected.every((s) => s !== null);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (state.submitted) return;
    setState((prev) => {
      const updated = [...prev.selected];
      updated[qIdx] = optIdx;
      return { ...prev, selected: updated };
    });
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setState((prev) => ({ ...prev, submitted: true }));
  };

  const handleRetake = () => {
    setState({ selected: Array(questions.length).fill(null), submitted: false });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-primary" /> Knowledge Check
      </h2>

      {state.submitted && (
        <Card className={`border ${score === questions.length ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20" : "border-amber-300 bg-amber-50 dark:bg-amber-950/20"}`}>
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">
                {score === questions.length
                  ? "🎉 Perfect score!"
                  : `${score} / ${questions.length} correct`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {score === questions.length
                  ? "You nailed every question."
                  : "Review the explanations below, then retake when ready."}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleRetake}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retake
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const selected = state.selected[qIdx];
          const isCorrect = selected === q.correctIndex;

          return (
            <Card key={qIdx} className={`border ${state.submitted ? (isCorrect ? "border-emerald-300" : "border-red-300") : "border-border/60"}`}>
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-medium leading-snug">
                  {qIdx + 1}. {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-2">
                {q.options.map((opt, optIdx) => {
                  let optClass =
                    "w-full text-left px-4 py-2.5 rounded-md border text-sm transition-colors ";
                  if (!state.submitted) {
                    optClass +=
                      selected === optIdx
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border hover:border-primary/50 hover:bg-muted/50";
                  } else {
                    if (optIdx === q.correctIndex) {
                      optClass += "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 font-medium";
                    } else if (optIdx === selected && !isCorrect) {
                      optClass += "border-red-400 bg-red-50 dark:bg-red-950/20 line-through text-muted-foreground";
                    } else {
                      optClass += "border-border text-muted-foreground";
                    }
                  }
                  return (
                    <button
                      key={optIdx}
                      className={optClass}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      disabled={state.submitted}
                    >
                      {opt}
                    </button>
                  );
                })}

                {state.submitted && (
                  <div className={`mt-2 p-3 rounded-md text-xs leading-relaxed ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"}`}>
                    <span className="font-semibold">{isCorrect ? "✓ Correct — " : "✗ Incorrect — "}</span>
                    {q.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!state.submitted && (
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full"
        >
          {allAnswered ? "Submit Answers" : `Answer all ${questions.length} questions to submit`}
        </Button>
      )}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function TrainingModule() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { blocked } = useMemberGate({ requireTraining: true }); // training + bundle only
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localPct, setLocalPct] = useState(0);

  const { data: module, isLoading, error } = useQuery<ModuleDetail>({
    queryKey: ["training-module", id],
    queryFn: async () => {
      const res = await fetch(`/api/training/modules/${id}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message ?? "Module not found");
      }
      return res.json();
    },
    enabled: !blocked && !!user && !!id,
  });

  useEffect(() => {
    if (module) setLocalPct(module.progress.progressPercent);
  }, [module]);

  const progressMutation = useMutation({
    mutationFn: async ({ pct, status }: { pct: number; status?: string }) => {
      const res = await fetch(`/api/training/modules/${id}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressPercent: pct, status }),
      });
      if (!res.ok) throw new Error("Failed to save progress");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-modules"] });
      queryClient.invalidateQueries({ queryKey: ["training-module", id] });
      queryClient.invalidateQueries({ queryKey: ["member-dashboard"] });
    },
  });

  const markComplete = () => {
    progressMutation.mutate({ pct: 100, status: "completed" });
    toast({ title: "Module completed!", description: "Your progress has been saved." });
  };

  if (blocked || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h2 className="text-xl font-bold mb-2">Module unavailable</h2>
          <p className="text-muted-foreground mb-6">{(error as Error).message}</p>
          <Button onClick={() => setLocation("/training")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Training Center
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading || !module) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  const isCompleted = module.progress.status === "completed";
  const hasContent = !!(module.lessonSections?.length || module.quizData?.length || module.videoScript);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Back nav */}
        <button
          onClick={() => setLocation("/training")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Training Center
        </button>

        {/* Module header */}
        <div>
          {module.sectionTitle && (
            <p className="text-sm text-muted-foreground mb-1">{module.sectionTitle}</p>
          )}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">{module.title}</h1>
            {isCompleted && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            {module.durationMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {module.durationMinutes} min
              </span>
            )}
            <span className="capitalize flex items-center gap-1">
              {module.moduleType === "video" && <Play className="w-4 h-4" />}
              {module.moduleType === "pdf" && <FileText className="w-4 h-4" />}
              {module.moduleType}
            </span>
          </div>
        </div>

        {/* Progress tracker */}
        {!isCompleted && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>Your progress</span>
                <span className="font-semibold">{localPct}%</span>
              </div>
              <Progress value={localPct} className="h-2 mb-3" />
              <input
                type="range"
                min={0}
                max={100}
                value={localPct}
                className="w-full accent-primary"
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setLocalPct(v);
                  progressMutation.mutate({ pct: v });
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Drag to update your progress through this module
              </p>
            </CardContent>
          </Card>
        )}

        {/* Video player */}
        {module.moduleType === "video" && module.videoUrl && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={module.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={module.title}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video script — shown when videoUrl is null but script content exists */}
        {module.moduleType === "video" && !module.videoUrl && module.videoScript && (
          <VideoScriptCard script={module.videoScript} />
        )}

        {/* PDF viewer */}
        {module.moduleType === "pdf" && module.pdfUrl && (
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {module.workbookTitle ?? "PDF Resource"}
                </p>
                <a href={module.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1.5" /> Download
                  </Button>
                </a>
              </div>
              {module.workbookDescription && (
                <p className="text-sm text-muted-foreground mb-4">{module.workbookDescription}</p>
              )}
              <div className="bg-muted rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-3">
                  Click the link below to open the PDF in a new tab
                </p>
                <a href={module.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-1.5" /> Open PDF
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workbook card for PDF modules with no URL yet */}
        {module.moduleType === "pdf" && !module.pdfUrl && (module.workbookTitle || module.workbookDescription) && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-5 pb-5">
              <p className="font-medium flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                {module.workbookTitle ?? "Downloadable Resource"}
              </p>
              {module.workbookDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">{module.workbookDescription}</p>
              )}
              <p className="text-xs text-muted-foreground mt-3 italic">
                The PDF for this module will be available for download shortly.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lesson sections */}
        {module.lessonSections && module.lessonSections.length > 0 && (
          <LessonContent sections={module.lessonSections} />
        )}

        {/* Quiz */}
        {module.quizData && module.quizData.length > 0 && (
          <QuizSection questions={module.quizData} />
        )}

        {/* No-content fallback — shown only when no media and no static content */}
        {!module.videoUrl && !module.pdfUrl && !hasContent && (
          <Card>
            <CardContent className="py-14 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-semibold mb-2">Content coming soon</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                This module's content is being prepared. It will appear here automatically once it's ready — no action needed from you.
              </p>
            </CardContent>
          </Card>
        )}

        {/* About this module */}
        {module.description && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">About this module</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Mark complete / back */}
        <div className="flex items-center gap-3 flex-wrap">
          {!isCompleted ? (
            <Button onClick={markComplete} disabled={progressMutation.isPending}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {progressMutation.isPending ? "Saving…" : "Mark as Complete"}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <CheckCircle2 className="w-5 h-5" /> Module completed
            </div>
          )}
          <Button variant="outline" onClick={() => setLocation("/training")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Training
          </Button>
        </div>

      </div>
    </AppLayout>
  );
}
