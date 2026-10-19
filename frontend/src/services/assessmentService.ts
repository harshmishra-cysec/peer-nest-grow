import { QUIZ_SCORE_THRESHOLDS } from "@/constants";
import type { SkillLevel } from "@/types";

export interface QuizOption {
  id: string;
  label: string;
  score: number; // 0 - 3
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

export interface AssessmentResult {
  score: number;
  maxScore: number;
  skillLevel: SkillLevel;
  explanation: string;
}

/**
 * 5 topic-relevant multiple choice questions evaluating comfort, problem-solving,
 * independent building, debugging, and system architecture.
 */
export const ASSESSMENT_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "How comfortable are you with core concepts and fundamentals in this topic?",
    options: [
      { id: "q1-0", label: "Brand new — still learning syntax and vocabulary", score: 0 },
      {
        id: "q1-1",
        label: "Familiar with basics, but need to look up concepts frequently",
        score: 1,
      },
      { id: "q1-2", label: "Comfortable applying main concepts without constant guides", score: 2 },
      {
        id: "q1-3",
        label: "Deep intuition — can explain subtleties and trade-offs to others",
        score: 3,
      },
    ],
  },
  {
    id: "q2",
    prompt: "What is your experience building practical projects in this area?",
    options: [
      { id: "q2-0", label: "Followed simple tutorial steps or hello-world examples", score: 0 },
      { id: "q2-1", label: "Built 1-2 small personal exercises with guided assistance", score: 1 },
      {
        id: "q2-2",
        label: "Built complete standalone applications or modules independently",
        score: 2,
      },
      { id: "q2-3", label: "Designed and delivered production-grade or complex systems", score: 3 },
    ],
  },
  {
    id: "q3",
    prompt: "How would you rate your problem-solving speed and independence?",
    options: [
      { id: "q3-0", label: "Often get stuck and need step-by-step guidance to proceed", score: 0 },
      { id: "q3-1", label: "Can solve straightforward problems with reference docs", score: 1 },
      {
        id: "q3-2",
        label: "Solve most problems quickly and know how to find edge cases",
        score: 2,
      },
      {
        id: "q3-3",
        label: "Rapidly identify bottlenecks and optimize alternative approaches",
        score: 3,
      },
    ],
  },
  {
    id: "q4",
    prompt: "When you encounter unfamiliar errors or bugs, what is your approach?",
    options: [
      { id: "q4-0", label: "Struggle to interpret the stack trace or error log", score: 0 },
      { id: "q4-1", label: "Search error messages on forums until a fix works", score: 1 },
      {
        id: "q4-2",
        label: "Systematically isolate with breakpoints or logs to pinpoint cause",
        score: 2,
      },
      { id: "q4-3", label: "Quickly reason about root causes and write defensive tests", score: 3 },
    ],
  },
  {
    id: "q5",
    prompt:
      "How comfortable are you collaborating on code reviews and providing architectural input?",
    options: [
      { id: "q5-0", label: "Prefer observing and learning from others' code reviews", score: 0 },
      { id: "q5-1", label: "Can review formatting and simple logic in peers' work", score: 1 },
      {
        id: "q5-2",
        label: "Provide constructive feedback on modularity, naming, and patterns",
        score: 2,
      },
      { id: "q5-3", label: "Confident leading design discussions and mentoring peers", score: 3 },
    ],
  },
];

/**
 * Pure scoring function: sums answer scores and evaluates level based on constants.
 * Score >= 12 -> Advanced
 * Score >= 6 -> Intermediate
 * Else -> Beginner
 */
export function calculateAssessmentResult(answers: Record<string, number>): AssessmentResult {
  const scores = Object.values(answers);
  const score = scores.reduce((sum, val) => sum + val, 0);
  const maxScore = ASSESSMENT_QUESTIONS.length * 3; // 5 * 3 = 15

  let skillLevel: SkillLevel = "Beginner";
  let explanation =
    "You'll be placed as a Developing (Beginner) learner to master fundamentals alongside peers.";

  if (score >= QUIZ_SCORE_THRESHOLDS.ADVANCED_MIN) {
    skillLevel = "Advanced";
    explanation =
      "You'll be placed as a Strong (Advanced) learner in a balanced group, eligible to lead sub-group activities.";
  } else if (score >= QUIZ_SCORE_THRESHOLDS.INTERMEDIATE_MIN) {
    skillLevel = "Intermediate";
    explanation =
      "You'll be placed as an Average (Intermediate) learner, bridging foundational and advanced concepts.";
  }

  return {
    score,
    maxScore,
    skillLevel,
    explanation,
  };
}
