import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, HelpCircle } from "lucide-react";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getQuestionsForTopic,
  calculateAssessmentResult,
  type AssessmentResult,
} from "@/services/assessmentService";
import type { SkillLevel } from "@/types";

interface SkillQuizWizardProps {
  topic?: string;
  onComplete: (level: SkillLevel, result: AssessmentResult) => void;
  onCancel?: () => void;
  confirmButtonLabel?: string;
}

export function SkillQuizWizard({
  topic = "this topic",
  onComplete,
  onCancel,
  confirmButtonLabel = "Confirm Skill Level",
}: SkillQuizWizardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completedResult, setCompletedResult] = useState<AssessmentResult | null>(null);

  const questions = useMemo(() => getQuestionsForTopic(topic), [topic]);
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex]!;
  const selectedOptionScore = answers[currentQuestion.id];

  const handleSelectOption = (score: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: score }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate assessment result through isolated service function
      const result = calculateAssessmentResult(answers);
      setCompletedResult(result);
    }
  };

  const handleBack = () => {
    if (completedResult) {
      setCompletedResult(null);
      return;
    }
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // Result View
  if (completedResult) {
    return (
      <div className="surface space-y-6 p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Award className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Assessed Skill Level</h3>
            <p className="text-xs text-muted-foreground">Evaluation for {topic}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <div className="flex justify-center">
            <SkillBadge
              level={completedResult.skillLevel}
              className="px-4 py-1 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold">
              Score: {completedResult.score} / {completedResult.maxScore}
            </p>
            <p className="text-sm text-muted-foreground">{completedResult.explanation}</p>
          </div>

          <div className="rounded-lg bg-surface p-3 text-xs text-muted-foreground">
            Balanced engine evaluation: Grouping will automatically balance you with peers of
            complementary skill tiers when capacity reaches 9.
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <ArrowLeft className="size-3.5" /> Retake Quiz
          </Button>
          <Button
            size="lg"
            onClick={() => onComplete(completedResult.skillLevel, completedResult)}
            className="gap-2"
          >
            <CheckCircle2 className="size-4" /> {confirmButtonLabel}
          </Button>
        </div>
      </div>
    );
  }

  // Question Wizard Step View
  return (
    <div className="surface space-y-6 p-6 sm:p-8">
      {/* Header and Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="size-3.5 text-primary" /> Skill Assessment · {topic}
          </span>
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      {/* Question Prompt */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold leading-snug sm:text-xl">{currentQuestion.prompt}</h3>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionScore === option.score;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option.score)}
                className={`w-full rounded-xl border p-4 text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground shadow-2xs"
                    : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-surface"
                }`}
              >
                <div
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  }`}
                >
                  {isSelected && <span className="size-1.5 rounded-full bg-background" />}
                </div>
                <span className={`text-sm ${isSelected ? "font-medium text-foreground" : ""}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button type="button" variant="outline" size="sm" onClick={handleBack} className="gap-1.5">
          <ArrowLeft className="size-3.5" />
          {currentQuestionIndex === 0 ? "Cancel" : "Previous"}
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={selectedOptionScore === undefined}
          onClick={handleNext}
          className="gap-1.5"
        >
          {currentQuestionIndex === totalQuestions - 1 ? (
            <>
              See Assessed Level <CheckCircle2 className="size-3.5" />
            </>
          ) : (
            <>
              Next Question <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
