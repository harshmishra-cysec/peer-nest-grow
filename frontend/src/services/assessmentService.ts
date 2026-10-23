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
  /** score / maxScore x 100 (two decimals). */
  percentage: number;
  skillLevel: SkillLevel;
  explanation: string;
}

interface QuizDomain {
  id: string;
  name: string;
  questions: QuizQuestion[];
}

/**
 * Domain-specific skill assessment (5 questions per topic, each option scores 0-3,
 * total out of 15). Source: skill_assessment_questions.json.
 * The quiz is asked ONLY when a user joins a circle, using that circle's topic.
 */
export const ASSESSMENT_DOMAINS: QuizDomain[] = [
  {
    "id": "data-structures-algorithms",
    "name": "Data Structures & Algorithms",
    "questions": [
      {
        "id": "d1q1",
        "prompt": "How comfortable are you with core concepts and fundamentals in this topic?",
        "options": [
          {
            "id": "d1q1-0",
            "label": "Brand new — still learning syntax and vocabulary",
            "score": 0
          },
          {
            "id": "d1q1-1",
            "label": "Familiar with basics, but need to look up concepts frequently",
            "score": 1
          },
          {
            "id": "d1q1-2",
            "label": "Comfortable applying main concepts without constant guides",
            "score": 2
          },
          {
            "id": "d1q1-3",
            "label": "Deep intuition — can explain subtleties and trade-offs to others",
            "score": 3
          }
        ]
      },
      {
        "id": "d1q2",
        "prompt": "How well do you know arrays, linked lists, stacks and queues?",
        "options": [
          {
            "id": "d1q2-0",
            "label": "Heard of them, never used",
            "score": 0
          },
          {
            "id": "d1q2-1",
            "label": "Can use them with some help",
            "score": 1
          },
          {
            "id": "d1q2-2",
            "label": "Use them confidently in problems",
            "score": 2
          },
          {
            "id": "d1q2-3",
            "label": "Can pick the best one and justify it",
            "score": 3
          }
        ]
      },
      {
        "id": "d1q3",
        "prompt": "How do you handle sorting, searching and recursion?",
        "options": [
          {
            "id": "d1q3-0",
            "label": "Haven't tried them yet",
            "score": 0
          },
          {
            "id": "d1q3-1",
            "label": "Can write basic ones, e.g. binary search",
            "score": 1
          },
          {
            "id": "d1q3-2",
            "label": "Solve most problems on my own",
            "score": 2
          },
          {
            "id": "d1q3-3",
            "label": "Optimize and adapt them to new problems",
            "score": 3
          }
        ]
      },
      {
        "id": "d1q4",
        "prompt": "How comfortable are you with Big-O time and space complexity?",
        "options": [
          {
            "id": "d1q4-0",
            "label": "Don't know what it means",
            "score": 0
          },
          {
            "id": "d1q4-1",
            "label": "Know the idea, can't always calculate it",
            "score": 1
          },
          {
            "id": "d1q4-2",
            "label": "Can analyze most of my own code",
            "score": 2
          },
          {
            "id": "d1q4-3",
            "label": "Can compare approaches and trade-offs easily",
            "score": 3
          }
        ]
      },
      {
        "id": "d1q5",
        "prompt": "How familiar are you with trees, graphs and hash maps?",
        "options": [
          {
            "id": "d1q5-0",
            "label": "Not yet",
            "score": 0
          },
          {
            "id": "d1q5-1",
            "label": "Know the basics, e.g. BFS/DFS",
            "score": 1
          },
          {
            "id": "d1q5-2",
            "label": "Can implement and apply them",
            "score": 2
          },
          {
            "id": "d1q5-3",
            "label": "Can solve hard problems using them",
            "score": 3
          }
        ]
      }
    ]
  },
  {
    "id": "web-development",
    "name": "Web Development",
    "questions": [
      {
        "id": "d2q1",
        "prompt": "How comfortable are you with core concepts and fundamentals in this topic?",
        "options": [
          {
            "id": "d2q1-0",
            "label": "Brand new — still learning syntax and vocabulary",
            "score": 0
          },
          {
            "id": "d2q1-1",
            "label": "Familiar with basics, but need to look up concepts frequently",
            "score": 1
          },
          {
            "id": "d2q1-2",
            "label": "Comfortable applying main concepts without constant guides",
            "score": 2
          },
          {
            "id": "d2q1-3",
            "label": "Deep intuition — can explain subtleties and trade-offs to others",
            "score": 3
          }
        ]
      },
      {
        "id": "d2q2",
        "prompt": "How well do you know HTML and CSS?",
        "options": [
          {
            "id": "d2q2-0",
            "label": "Just starting out",
            "score": 0
          },
          {
            "id": "d2q2-1",
            "label": "Can build simple static pages",
            "score": 1
          },
          {
            "id": "d2q2-2",
            "label": "Can build responsive layouts",
            "score": 2
          },
          {
            "id": "d2q2-3",
            "label": "Can write clean, accessible, scalable styles",
            "score": 3
          }
        ]
      },
      {
        "id": "d2q3",
        "prompt": "How comfortable are you with JavaScript?",
        "options": [
          {
            "id": "d2q3-0",
            "label": "Haven't written any",
            "score": 0
          },
          {
            "id": "d2q3-1",
            "label": "Can write basic scripts and DOM code",
            "score": 1
          },
          {
            "id": "d2q3-2",
            "label": "Comfortable with async code and ES6+",
            "score": 2
          },
          {
            "id": "d2q3-3",
            "label": "Understand closures, event loop and performance",
            "score": 3
          }
        ]
      },
      {
        "id": "d2q4",
        "prompt": "What is your experience with a framework (React, Vue, Angular)?",
        "options": [
          {
            "id": "d2q4-0",
            "label": "None yet",
            "score": 0
          },
          {
            "id": "d2q4-1",
            "label": "Followed tutorials only",
            "score": 1
          },
          {
            "id": "d2q4-2",
            "label": "Built small apps with components and state",
            "score": 2
          },
          {
            "id": "d2q4-3",
            "label": "Designed full apps with solid architecture",
            "score": 3
          }
        ]
      },
      {
        "id": "d2q5",
        "prompt": "How familiar are you with backend, APIs and databases?",
        "options": [
          {
            "id": "d2q5-0",
            "label": "Not at all",
            "score": 0
          },
          {
            "id": "d2q5-1",
            "label": "Can call or build a simple API",
            "score": 1
          },
          {
            "id": "d2q5-2",
            "label": "Can build a full CRUD app",
            "score": 2
          },
          {
            "id": "d2q5-3",
            "label": "Can design secure, scalable backends",
            "score": 3
          }
        ]
      }
    ]
  },
  {
    "id": "ui-design",
    "name": "UI Design",
    "questions": [
      {
        "id": "d3q1",
        "prompt": "How comfortable are you with core concepts and fundamentals in this topic?",
        "options": [
          {
            "id": "d3q1-0",
            "label": "Brand new — still learning syntax and vocabulary",
            "score": 0
          },
          {
            "id": "d3q1-1",
            "label": "Familiar with basics, but need to look up concepts frequently",
            "score": 1
          },
          {
            "id": "d3q1-2",
            "label": "Comfortable applying main concepts without constant guides",
            "score": 2
          },
          {
            "id": "d3q1-3",
            "label": "Deep intuition — can explain subtleties and trade-offs to others",
            "score": 3
          }
        ]
      },
      {
        "id": "d3q2",
        "prompt": "How well do you know design principles (spacing, hierarchy, contrast)?",
        "options": [
          {
            "id": "d3q2-0",
            "label": "Not aware of them",
            "score": 0
          },
          {
            "id": "d3q2-1",
            "label": "Know the terms, apply them rarely",
            "score": 1
          },
          {
            "id": "d3q2-2",
            "label": "Apply them regularly in my work",
            "score": 2
          },
          {
            "id": "d3q2-3",
            "label": "Can explain and critique them in any design",
            "score": 3
          }
        ]
      },
      {
        "id": "d3q3",
        "prompt": "How comfortable are you with tools like Figma?",
        "options": [
          {
            "id": "d3q3-0",
            "label": "Never opened one",
            "score": 0
          },
          {
            "id": "d3q3-1",
            "label": "Can make simple frames",
            "score": 1
          },
          {
            "id": "d3q3-2",
            "label": "Can build layouts with components",
            "score": 2
          },
          {
            "id": "d3q3-3",
            "label": "Can build design systems and prototypes",
            "score": 3
          }
        ]
      },
      {
        "id": "d3q4",
        "prompt": "How do you use color and typography?",
        "options": [
          {
            "id": "d3q4-0",
            "label": "Choose by feel",
            "score": 0
          },
          {
            "id": "d3q4-1",
            "label": "Know basic pairing rules",
            "score": 1
          },
          {
            "id": "d3q4-2",
            "label": "Build consistent palettes and type scales",
            "score": 2
          },
          {
            "id": "d3q4-3",
            "label": "Craft accessible, brand-driven systems",
            "score": 3
          }
        ]
      },
      {
        "id": "d3q5",
        "prompt": "How familiar are you with UX basics (user flows, wireframes, usability)?",
        "options": [
          {
            "id": "d3q5-0",
            "label": "Not familiar",
            "score": 0
          },
          {
            "id": "d3q5-1",
            "label": "Can sketch a basic wireframe",
            "score": 1
          },
          {
            "id": "d3q5-2",
            "label": "Create flows and test with users",
            "score": 2
          },
          {
            "id": "d3q5-3",
            "label": "Lead research-based design decisions",
            "score": 3
          }
        ]
      }
    ]
  },
  {
    "id": "machine-learning",
    "name": "Machine Learning",
    "questions": [
      {
        "id": "d4q1",
        "prompt": "How comfortable are you with core concepts and fundamentals in this topic?",
        "options": [
          {
            "id": "d4q1-0",
            "label": "Brand new — still learning syntax and vocabulary",
            "score": 0
          },
          {
            "id": "d4q1-1",
            "label": "Familiar with basics, but need to look up concepts frequently",
            "score": 1
          },
          {
            "id": "d4q1-2",
            "label": "Comfortable applying main concepts without constant guides",
            "score": 2
          },
          {
            "id": "d4q1-3",
            "label": "Deep intuition — can explain subtleties and trade-offs to others",
            "score": 3
          }
        ]
      },
      {
        "id": "d4q2",
        "prompt": "How well do you know the math behind ML (statistics, linear algebra)?",
        "options": [
          {
            "id": "d4q2-0",
            "label": "Little to none",
            "score": 0
          },
          {
            "id": "d4q2-1",
            "label": "Know the basics",
            "score": 1
          },
          {
            "id": "d4q2-2",
            "label": "Can follow most ML math",
            "score": 2
          },
          {
            "id": "d4q2-3",
            "label": "Can derive and explain it confidently",
            "score": 3
          }
        ]
      },
      {
        "id": "d4q3",
        "prompt": "How comfortable are you with Python, NumPy and Pandas?",
        "options": [
          {
            "id": "d4q3-0",
            "label": "Haven't used them",
            "score": 0
          },
          {
            "id": "d4q3-1",
            "label": "Can do basic data handling",
            "score": 1
          },
          {
            "id": "d4q3-2",
            "label": "Clean and analyze data independently",
            "score": 2
          },
          {
            "id": "d4q3-3",
            "label": "Write efficient, production-quality code",
            "score": 3
          }
        ]
      },
      {
        "id": "d4q4",
        "prompt": "How familiar are you with classic models (regression, trees, clustering)?",
        "options": [
          {
            "id": "d4q4-0",
            "label": "Heard the names only",
            "score": 0
          },
          {
            "id": "d4q4-1",
            "label": "Trained a few with tutorials",
            "score": 1
          },
          {
            "id": "d4q4-2",
            "label": "Can choose and tune models myself",
            "score": 2
          },
          {
            "id": "d4q4-3",
            "label": "Can explain bias, variance and trade-offs",
            "score": 3
          }
        ]
      },
      {
        "id": "d4q5",
        "prompt": "How do you evaluate models (accuracy, F1, cross-validation)?",
        "options": [
          {
            "id": "d4q5-0",
            "label": "Don't know how",
            "score": 0
          },
          {
            "id": "d4q5-1",
            "label": "Know accuracy and basic metrics",
            "score": 1
          },
          {
            "id": "d4q5-2",
            "label": "Use proper metrics and validation",
            "score": 2
          },
          {
            "id": "d4q5-3",
            "label": "Diagnose overfitting and improve systematically",
            "score": 3
          }
        ]
      }
    ]
  },
  {
    "id": "system-design",
    "name": "System Design",
    "questions": [
      {
        "id": "d5q1",
        "prompt": "How comfortable are you with core concepts and fundamentals in this topic?",
        "options": [
          {
            "id": "d5q1-0",
            "label": "Brand new — still learning syntax and vocabulary",
            "score": 0
          },
          {
            "id": "d5q1-1",
            "label": "Familiar with basics, but need to look up concepts frequently",
            "score": 1
          },
          {
            "id": "d5q1-2",
            "label": "Comfortable applying main concepts without constant guides",
            "score": 2
          },
          {
            "id": "d5q1-3",
            "label": "Deep intuition — can explain subtleties and trade-offs to others",
            "score": 3
          }
        ]
      },
      {
        "id": "d5q2",
        "prompt": "How well do you understand client-server architecture and networking?",
        "options": [
          {
            "id": "d5q2-0",
            "label": "Not yet",
            "score": 0
          },
          {
            "id": "d5q2-1",
            "label": "Know the basic flow of a request",
            "score": 1
          },
          {
            "id": "d5q2-2",
            "label": "Understand HTTP, DNS and load balancers",
            "score": 2
          },
          {
            "id": "d5q2-3",
            "label": "Can explain the full request lifecycle in depth",
            "score": 3
          }
        ]
      },
      {
        "id": "d5q3",
        "prompt": "How comfortable are you with databases (SQL vs NoSQL, indexing)?",
        "options": [
          {
            "id": "d5q3-0",
            "label": "Haven't used them",
            "score": 0
          },
          {
            "id": "d5q3-1",
            "label": "Can write basic queries",
            "score": 1
          },
          {
            "id": "d5q3-2",
            "label": "Choose and model databases for a use case",
            "score": 2
          },
          {
            "id": "d5q3-3",
            "label": "Design sharding, replication and indexing",
            "score": 3
          }
        ]
      },
      {
        "id": "d5q4",
        "prompt": "How familiar are you with caching, queues and load balancing?",
        "options": [
          {
            "id": "d5q4-0",
            "label": "Never heard of them",
            "score": 0
          },
          {
            "id": "d5q4-1",
            "label": "Know what they are",
            "score": 1
          },
          {
            "id": "d5q4-2",
            "label": "Have used some in a project",
            "score": 2
          },
          {
            "id": "d5q4-3",
            "label": "Can decide where and why to use each",
            "score": 3
          }
        ]
      },
      {
        "id": "d5q5",
        "prompt": "How do you think about scalability and reliability?",
        "options": [
          {
            "id": "d5q5-0",
            "label": "Haven't thought about it",
            "score": 0
          },
          {
            "id": "d5q5-1",
            "label": "Know the terms only",
            "score": 1
          },
          {
            "id": "d5q5-2",
            "label": "Can design for moderate scale",
            "score": 2
          },
          {
            "id": "d5q5-3",
            "label": "Can reason about CAP, failover and bottlenecks",
            "score": 3
          }
        ]
      }
    ]
  },
  {
    "id": "mobile-development",
    "name": "Mobile Development",
    "questions": [
      {
        "id": "d6q1",
        "prompt": "How comfortable are you with core concepts and fundamentals in this topic?",
        "options": [
          {
            "id": "d6q1-0",
            "label": "Brand new — still learning syntax and vocabulary",
            "score": 0
          },
          {
            "id": "d6q1-1",
            "label": "Familiar with basics, but need to look up concepts frequently",
            "score": 1
          },
          {
            "id": "d6q1-2",
            "label": "Comfortable applying main concepts without constant guides",
            "score": 2
          },
          {
            "id": "d6q1-3",
            "label": "Deep intuition — can explain subtleties and trade-offs to others",
            "score": 3
          }
        ]
      },
      {
        "id": "d6q2",
        "prompt": "How well do you know a mobile language (Kotlin, Swift, Dart, JS)?",
        "options": [
          {
            "id": "d6q2-0",
            "label": "Just starting",
            "score": 0
          },
          {
            "id": "d6q2-1",
            "label": "Can write basic programs",
            "score": 1
          },
          {
            "id": "d6q2-2",
            "label": "Comfortable building features",
            "score": 2
          },
          {
            "id": "d6q2-3",
            "label": "Know advanced language features deeply",
            "score": 3
          }
        ]
      },
      {
        "id": "d6q3",
        "prompt": "How comfortable are you with UI building (layouts, navigation)?",
        "options": [
          {
            "id": "d6q3-0",
            "label": "Haven't built any",
            "score": 0
          },
          {
            "id": "d6q3-1",
            "label": "Can make a simple screen",
            "score": 1
          },
          {
            "id": "d6q3-2",
            "label": "Can build multi-screen apps",
            "score": 2
          },
          {
            "id": "d6q3-3",
            "label": "Create smooth, adaptive, polished UIs",
            "score": 3
          }
        ]
      },
      {
        "id": "d6q4",
        "prompt": "How do you handle app state and data (storage, APIs)?",
        "options": [
          {
            "id": "d6q4-0",
            "label": "Not yet",
            "score": 0
          },
          {
            "id": "d6q4-1",
            "label": "Can show static or hard-coded data",
            "score": 1
          },
          {
            "id": "d6q4-2",
            "label": "Fetch API data and store locally",
            "score": 2
          },
          {
            "id": "d6q4-3",
            "label": "Architect with clean patterns like MVVM",
            "score": 3
          }
        ]
      },
      {
        "id": "d6q5",
        "prompt": "How familiar are you with device features (camera, GPS, notifications)?",
        "options": [
          {
            "id": "d6q5-0",
            "label": "Not familiar",
            "score": 0
          },
          {
            "id": "d6q5-1",
            "label": "Read about them",
            "score": 1
          },
          {
            "id": "d6q5-2",
            "label": "Have integrated one or two",
            "score": 2
          },
          {
            "id": "d6q5-3",
            "label": "Integrate them with permissions and edge cases handled",
            "score": 3
          }
        ]
      }
    ]
  }
];

/** Fallback when a topic has no dedicated question set. */
export const ASSESSMENT_QUESTIONS: QuizQuestion[] = ASSESSMENT_DOMAINS[0]!.questions;

/** Questions for a circle's topic (matched by domain name), with a safe fallback. */
export function getQuestionsForTopic(topic?: string): QuizQuestion[] {
  const match = ASSESSMENT_DOMAINS.find((domain) => domain.name === topic);
  return match ? match.questions : ASSESSMENT_QUESTIONS;
}

/**
 * Skill bands by percentage: 0-39% Beginner, 40-69% Intermediate, 70-100% Advanced.
 * With 5 questions x 3 points (max 15) this equals the JSON bands 0-5 / 6-10 / 11-15.
 */
export function levelFromPercent(percentage: number): SkillLevel {
  if (percentage >= 70) return "Advanced";
  if (percentage >= 40) return "Intermediate";
  return "Beginner";
}

/** Pure scoring function: sums answer scores, converts to a percentage, maps to a level. */
export function calculateAssessmentResult(answers: Record<string, number>): AssessmentResult {
  const score = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const maxScore = 15;
  const percentage = Math.round((score / maxScore) * 10000) / 100;
  const skillLevel = levelFromPercent(percentage);

  const explanation =
    skillLevel === "Advanced"
      ? "You'll be placed as a Strong (Advanced) learner in a balanced group, eligible to lead sub-group activities."
      : skillLevel === "Intermediate"
        ? "You'll be placed as an Average (Intermediate) learner, bridging foundational and advanced concepts."
        : "You'll be placed as a Developing (Beginner) learner to master fundamentals alongside peers.";

  return { score, maxScore, percentage, skillLevel, explanation };
}
