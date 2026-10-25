import type { SkillLevel } from "@/types";

export interface AssessmentOption {
  id: string;
  label: string;
  score: number;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: AssessmentOption[];
}

export interface AssessmentResult {
  score: number;
  maxScore: number;
  percentage: number;
  skillLevel: SkillLevel;
  explanation: string;
  answers: number[];
}

interface RawAssessmentQuestion {
  id: string;
  question: string;
  options: string[];
}

const QUESTIONS_BY_TOPIC: Record<string, RawAssessmentQuestion[]> = {
  javascript: [
    {
      id: "js-1",
      question: "What does `const` prevent in JavaScript?",
      options: [
        "Changing the variable binding",
        "Changing the value of an object",
        "Using the variable in a function",
        "Using the variable outside a loop",
      ],
    },
    {
      id: "js-2",
      question: "Which method converts JSON text into a JavaScript object?",
      options: [
        "JSON.parse()",
        "JSON.stringify()",
        "JSON.object()",
        "JSON.convert()",
      ],
    },
    {
      id: "js-3",
      question: "What is the output of `typeof null`?",
      options: ["null", "object", "undefined", "boolean"],
    },
    {
      id: "js-4",
      question: "Which keyword is used to define a class in JavaScript?",
      options: ["class", "struct", "object", "type"],
    },
    {
      id: "js-5",
      question:
        "Which array method creates a new array by applying a function to every element?",
      options: ["map()", "forEach()", "filter()", "reduce()"],
    },
  ],

  python: [
    {
      id: "py-1",
      question: "Which keyword defines a function in Python?",
      options: ["def", "func", "function", "define"],
    },
    {
      id: "py-2",
      question: "Which data type stores key-value pairs?",
      options: ["list", "tuple", "dictionary", "set"],
    },
    {
      id: "py-3",
      question: "What does `len()` return?",
      options: [
        "The type of an object",
        "The number of items",
        "The memory address",
        "The last item",
      ],
    },
    {
      id: "py-4",
      question: "Which symbol starts a comment in Python?",
      options: ["//", "#", "/*", "--"],
    },
    {
      id: "py-5",
      question: "Which keyword is used to handle exceptions?",
      options: ["catch", "except", "handle", "error"],
    },
  ],

  java: [
    {
      id: "java-1",
      question: "Which keyword is used to define a class in Java?",
      options: ["class", "struct", "object", "type"],
    },
    {
      id: "java-2",
      question: "Which method is the entry point of a Java application?",
      options: ["start()", "main()", "run()", "execute()"],
    },
    {
      id: "java-3",
      question: "Which keyword is used to inherit a class?",
      options: ["implements", "inherits", "extends", "super"],
    },
    {
      id: "java-4",
      question: "Which collection does not allow duplicate elements?",
      options: ["List", "Set", "ArrayList", "LinkedList"],
    },
    {
      id: "java-5",
      question: "Which keyword is used to create an object?",
      options: ["class", "new", "this", "object"],
    },
  ],

  cybersecurity: [
    {
      id: "cyber-1",
      question: "What does CIA stand for in cybersecurity?",
      options: [
        "Confidentiality, Integrity, Availability",
        "Control, Identity, Access",
        "Cyber, Internet, Authentication",
        "Confidentiality, Identification, Authorization",
      ],
    },
    {
      id: "cyber-2",
      question:
        "Which attack attempts to trick users into revealing sensitive information?",
      options: ["Phishing", "DDoS", "Brute force", "Port scanning"],
    },
    {
      id: "cyber-3",
      question: "What does HTTPS provide compared with HTTP?",
      options: [
        "Encryption in transit",
        "Faster downloads",
        "Unlimited bandwidth",
        "Automatic malware removal",
      ],
    },
    {
      id: "cyber-4",
      question: "Which practice strengthens account security?",
      options: [
        "Reusing passwords",
        "Multi-factor authentication",
        "Sharing passwords",
        "Disabling updates",
      ],
    },
    {
      id: "cyber-5",
      question: "What is the purpose of a firewall?",
      options: [
        "Filter network traffic",
        "Store passwords",
        "Compress files",
        "Create backups",
      ],
    },
  ],

  cybersecurity_basics: [
    {
      id: "cyber-basics-1",
      question: "What does CIA stand for in cybersecurity?",
      options: [
        "Confidentiality, Integrity, Availability",
        "Control, Identity, Access",
        "Cyber, Internet, Authentication",
        "Confidentiality, Identification, Authorization",
      ],
    },
    {
      id: "cyber-basics-2",
      question:
        "Which attack attempts to trick users into revealing sensitive information?",
      options: ["Phishing", "DDoS", "Brute force", "Port scanning"],
    },
    {
      id: "cyber-basics-3",
      question: "What does HTTPS provide compared with HTTP?",
      options: [
        "Encryption in transit",
        "Faster downloads",
        "Unlimited bandwidth",
        "Automatic malware removal",
      ],
    },
    {
      id: "cyber-basics-4",
      question: "Which practice strengthens account security?",
      options: [
        "Reusing passwords",
        "Multi-factor authentication",
        "Sharing passwords",
        "Disabling updates",
      ],
    },
    {
      id: "cyber-basics-5",
      question: "What is the purpose of a firewall?",
      options: [
        "Filter network traffic",
        "Store passwords",
        "Compress files",
        "Create backups",
      ],
    },
  ],
};

const FALLBACK_QUESTIONS: RawAssessmentQuestion[] = [
  {
    id: "general-1",
    question: "How comfortable are you with the fundamentals of this topic?",
    options: [
      "I am completely new to it",
      "I understand some basics",
      "I am comfortable with the basics",
      "I can explain and apply the fundamentals",
    ],
  },
  {
    id: "general-2",
    question: "How often have you practiced this topic?",
    options: [
      "Never",
      "A few times",
      "Regularly",
      "Very frequently",
    ],
  },
  {
    id: "general-3",
    question: "How confidently can you solve basic problems in this topic?",
    options: [
      "I need complete guidance",
      "I can solve some with help",
      "I can solve most independently",
      "I can solve and explain them confidently",
    ],
  },
  {
    id: "general-4",
    question: "How would you rate your practical experience?",
    options: [
      "No practical experience",
      "Limited practice",
      "Several small projects",
      "Strong practical experience",
    ],
  },
  {
    id: "general-5",
    question: "How confident are you in learning advanced concepts in this topic?",
    options: [
      "I need to strengthen the basics first",
      "I can learn with guidance",
      "I can learn independently",
      "I can learn and help others",
    ],
  },
];

function convertQuestions(
  questions: RawAssessmentQuestion[],
): AssessmentQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.question,
    options: question.options.map((label, index) => ({
      id: `${question.id}-option-${index}`,
      label,
      score: index,
    })),
  }));
}

export function getQuestionsForTopic(topic: string): AssessmentQuestion[] {
  const normalizedTopic = topic.trim().toLowerCase();

  const questions =
    QUESTIONS_BY_TOPIC[normalizedTopic] ??
    QUESTIONS_BY_TOPIC[normalizedTopic.replace(/\s+/g, "_")] ??
    FALLBACK_QUESTIONS;

  return convertQuestions(questions);
}

function levelFromScore(score: number): SkillLevel {
  if (score >= 11) {
    return "Advanced";
  }

  if (score >= 6) {
    return "Intermediate";
  }

  return "Beginner";
}

export function calculateAssessmentResult(
  answers: Record<string, number>,
  questionIds: string[] = Object.keys(answers),
): AssessmentResult {
  if (questionIds.length !== 5) {
    throw new Error(
      "Quiz must have exactly 5 integer answers, each from 0 to 3.",
    );
  }

  const orderedAnswers = questionIds.map((id) => {
    const answer = answers[id];

    if (
      answer === undefined ||
      !Number.isInteger(answer) ||
      answer < 0 ||
      answer > 3
    ) {
      throw new Error(
        "Quiz must have exactly 5 integer answers, each from 0 to 3.",
      );
    }

    return answer;
  });

  const score = orderedAnswers.reduce((sum, value) => sum + value, 0);
  const maxScore = 15;
  const percentage = Math.round((score / maxScore) * 10000) / 100;
  const skillLevel = levelFromScore(score);

  const explanation =
    skillLevel === "Advanced"
      ? "You'll be placed as a Strong (Advanced) learner in a balanced group, eligible to lead sub-group activities."
      : skillLevel === "Intermediate"
        ? "You'll be placed as an Average (Intermediate) learner, bridging foundational and advanced concepts."
        : "You'll be placed as a Developing (Beginner) learner to master fundamentals alongside peers.";

  return {
    score,
    maxScore,
    percentage,
    skillLevel,
    explanation,
    answers: orderedAnswers,
  };
}