/**
 * Types for the rich training module content returned by /api/training/modules/:id.
 * The actual content data lives in api-server/src/lib/training-content.ts and is
 * merged into the API response by the training route.
 */

export interface LessonSection {
  heading: string;
  body: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleContent {
  lessonSections: LessonSection[] | null;
  quizData: QuizQuestion[] | null;
  videoScript: string | null;
  workbookTitle: string | null;
  workbookDescription: string | null;
}
