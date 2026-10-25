# SkillNest: Project Handoff Summary

**Purpose of this file:** paste it into any AI tool so it has full context and can continue from where we stopped. Written as of roughly Oct 2026.

---

## 0. Instructions for the AI reading this

- Treat every item under "Locked decisions" as final. Do not re-propose alternatives unless the user asks, or you find a genuine flaw (then explain it first, and ask before changing anything).
- The user is a beginner student, writes in Hinglish (Hindi in Roman script + English), and wants honest reviews, not flattery. Reply in the language the user writes in, keep explanations simple, and say clearly what is done, what is mock, and what is missing.
- Never claim backend, database, JWT or Docker exist. They do not exist yet.
- When generating prompts for Lovable / Google AI Studio / any code generator, always include the **Code Quality Guardrails** in section 9.
- Their mentor dislikes "vibe-coded" projects. Code must look human-written, and no AI-tool branding should appear in the repo, commit history or docs.
- Ask at most one question at a time. Prefer small, surgical steps.

---

## 1. Academic context

- **Course:** Mini-Project, Full Stack Java Programming (course code 2343611), BE INFT, Mumbai University. Department of Information Technology, Atharva College of Engineering, A.Y. 2026-27.
- **Team of 4:** Harsh Mishra, Yash Patil, Dhruv Patel, Alekh Vishwakarma.
- **Syllabus modules the project must cover:**
  1. Intro to full-stack, MVC.
  2. HTML5/CSS3/Bootstrap, React basics (Axios/Fetch).
  3. Spring Boot REST APIs, controllers/services/repositories, exception handling.
  4. MySQL + Spring Data JPA, JPQL, relationships.
  5. Full-stack integration: React ↔ Spring Boot, JWT with Spring Security, Postman, error handling.
  6. Docker and docker-compose deployment.
- Lab outcomes: CRUD with Hibernate/JPA, REST APIs, JWT, integration, Docker deployment.
- Time budget: about 2 months. The user is a beginner.

---

## 2. How the project evolved (short history)

1. Started by brainstorming mini-project ideas. First picks were Campus Lost & Found and a Skill-Based Study Group Formation Tool. The user wanted "3 roles + one small security feature" and a unique, non-common idea.
2. The Study Group Tool was finalized and presented to the full-stack/DBMS teacher. The faculty asked for a **bigger, scalable, community-style platform** (not limited to one college or faculty-triggered groups).
3. The concept was redesigned into **SkillNest**: topic-based "Learning Circles" that anyone can create or join, auto-split into balanced sub-groups.
4. The algorithm was finalized through several review rounds (see section 4). Teacher approved the algorithm and asked for a UI to be shown.
5. UI was built with Lovable (credits ran out) and then moved to Google AI Studio Build mode. Lovable traces were later removed from code and git history.
6. A friend's similar project (SkillNestUI) was reviewed. Good ideas were selected for merging (section 7).
7. Current state: a working **frontend with mock data**, a real grouping algorithm in the client code, and no backend. The guide asked the team to present what exists to the **HoD**.

---

## 3. Product concept

SkillNest is a peer-learning platform. Users join or create topic-based **Circles** (DSA, Web Dev, UI Design, ML, System Design, Mobile Dev) with a goal, commitment level and deadline. When a circle reaches **9 members**, an algorithm splits them into **balanced sub-groups of 3** (one Strong/Advanced, one Average/Intermediate, one Weak/Beginner). Each sub-group gets chat, tasks, milestones, resources and peer-verified completion.

Tagline in use: "Learn together. Grow with the right people." (The friend's project uses "Turn Individual Learning into Collaborative Growth". Ours is different.)

Roles: **Learner** (default) and **Admin** (seeded account, platform oversight). There is **no permanent circle leader**. The circle creator is just the first member.

---

## 4. Locked decisions (algorithm and rules)

**Stage 0: Make a circle.** Creator fills Topic, Goal type (Learn / Build / Compete), Commitment (Casual / Serious), Deadline. The creator becomes the **first member, not a leader**. Circle status starts `Open`.

**Stage 1: Recommendation (Join).**
- User gives the same tags. The system ranks open circles by tag match. Current code scores topic ×3, goal ×2, commitment ×1.
- **Skill level is deliberately NOT used here.** Reason: no leader or algorithm bias at joining time.
- Shortlist is intended to be 4-5 circles, with no essay-style profile reading.

**Skill assessment.** On joining a circle the user takes a **5-question scored quiz** (each option scores 0-3, max 15): score ≥ 12 → Advanced, ≥ 6 → Intermediate, else Beginner. Level is stored per member per circle. Skill is **hidden from other members until grouping**.

**Stage 2: Balanced grouping.**
- `CIRCLE_CAPACITY = 9`, `SUB_GROUP_SIZE = 3`. At 9 members the circle becomes `Grouped` and sub-groups are computed automatically with no human input.
- Bucket by tier (Strong/Average/Weak), distribute round-robin for a 1:1:1 split, apply a fallback when uneven, and flag `isPerfectBalance`.
- **Sub-group leader = highest-tier member** of that group (tie → joined earlier). Leader is computed, not assigned manually.

**Inside a sub-group:** group chat (plain text + attachments), tasks (anyone can add), milestones, resources (shared links), task flow: assignee "Mark as Done" (optional proof link/files) → another member (not the assignee) confirms → Verified. Philosophy: "accountability + honesty is the algorithm". There is no AI grading.

**Engagement:** streak counter (daily activity), completion badge (all tasks verified before deadline), **restriction rule** (3+ joined circles with 0 verified completions → blocked from joining new circles).

**Admin:** seeded account (e.g. admin@skillnest.com with role ADMIN). Handles reports and disputes.

**Planned extras (decided, not built):** third verification state **"Changes Requested"** (with a note), a simple **Report member** action.

**Explicitly excluded:** ML recommendations, complex reputation or karma, real-time WebSockets (polling is fine), full admin mini-app (only reports/moderation if time permits).

---

## 5. Current codebase state

**Repo:** GitHub, private, renamed to `Skillnest-Collaborative-Learning-Platform` (the AI Studio project was linked to the old name `peer-nest-grow`). Git history was rewritten to be clean. Lovable traces (`.lovable`, tagger plugin, error-reporting hook) were removed. `README.md` was rewritten.

**Stack in code:** React 19, TypeScript (strict), TanStack Start (SSR, Nitro) + TanStack Router (file-based) + React Query, Tailwind CSS v4, Radix UI/shadcn primitives, Lucide icons, Sonner toasts. About 6.8k lines excluding the UI primitives.

**Structure (`src/`):** `components/` (brand, forms, layout, shared, workspace, ui), `constants/index.ts`, `hooks/`, `lib/`, `routes/`, `services/`, `types/index.ts`.

**Routes:** `/` landing, `/auth`, `/start`, `/circles/new`, `/circles/join`, `/circles/recommended`, `/circles/$circleId` (dashboard), `/circles/$circleId/subgroup` (workspace), `/profile`.

**Implemented and working with mock data:**
- All screens above, the 5-question quiz wizard, and the join modal.
- Workspace: chat with attachments, task list, Add Task, Mark-as-Done dialog (proof link + uploads), review/confirm dialog, Milestones list, Resources list, formation modal.
- `groupingService.ts`: pure function `computeBalancedSubGroups(circleId, members)` that returns sub-groups, leader, `isPerfectBalance`, tier counts and a summary. This is real logic computed from member data, not cosmetic.
- `assessmentService.ts`: questions plus the pure `calculateAssessmentResult`.
- `circleService.ts`: tag-score recommendation, create/join (the 9th join sets status `Grouped`).
- Services are isolated behind `apiClient.simulateRequest`, so swapping to real HTTP later touches only `/services`.
- Logo concepts and favicon exist (recommended logo: three-node network = a 3-person group).

**Mock only:** all data lives in `mockData.ts` (in memory, resets on refresh); login always succeeds; no persistence.

**Not implemented yet in the frontend:**
1. Restriction rule enforcement (only a boolean field).
2. Streak and badge calculation (hardcoded).
3. "Changes Requested" status (types have only In Progress / Pending Peer Confirmation / Verified).
4. Report-member feature and any Admin screens.
5. Route guards, token storage, real auth.
6. Deadline handling and the `Full` status.
7. Small fixes: outdated `roadmap.md`, "Browse other circles" link on the Make Circle confirmation, a leftover debug `console.log` in `subGroupService`, and recommendations can include Full circles.
8. The status of the landing / login / circle-dashboard restyle prompts is **unverified**, so check in the code.

---

## 6. Known flaws in the grouping algorithm (reviewed against the code)

| # | Flaw | Severity |
|---|---|---|
| 1 | A perfect 3-3-3 tier split is rare (about 8.5% if tiers were equally likely), so the fallback is effectively the main path. | High |
| 2 | The fallback balances group **size only**, not skill, although a code comment claims it minimizes skill variance. | High |
| 3 | `floor(N/3)` groups can leave members unassigned when N is not a multiple of 3 (latent while capacity is fixed at 9). | High |
| 4 | The quiz is self-rated and gameable, with unlimited retakes, topic-agnostic questions and uncalibrated thresholds. | Medium |
| 5 | Stage 1 ignores deadline preference, can recommend Full/Grouped circles, has no topic filter or top-5 cap. | Medium |
| 6 | No deadline fallback when a circle never fills. | Medium |
| 7 | Leader has no powers and no succession logic. | Medium |
| 8 | No rebalancing if a member leaves or goes inactive. | Low-Medium |
| 9 | Authorization is UI-only. `confirmTask` does not verify that the confirmer is not the assignee. It must be enforced in the backend service layer. | Medium |
| 10 | Backend concurrency risk: two users taking the 9th slot, or grouping running twice. | Medium |
| 11 | Restriction, streak and badge logic exist only on paper. | Low-Medium |

**Proposed fix (NOT yet approved by the user):** group by the numeric quiz score using a snake draft. Store `assessmentScore` on the member. Sort by score DESC (tie by joinedAt). `g = max(1, floor(N/3))`. Snake order 0..g-1, g-1..0, repeating. Never drop a member (groups may have 4). Leader = highest score. Compute score-total spread and label "Balanced Group" or "Standard Group" honestly. Deadline job: if members ≥ 3, group the current members. If fewer than 3, close the circle. This changes two earlier decisions (tiers → scores, and "single group" → "group if N ≥ 3"), so confirm it with the team first.

---

## 7. Friend's project review (SkillNestUI)

**Adopt:** login page style (including an "Admin Portal Login" link), landing copy and the "Balanced Grouping Engine" explainer section, the scored multi-question quiz (already adopted), the formation "analyzing" animation, workspace tabs (Milestones, Resources, Progress), the 3-state verification, simplified admin reports/moderation, and a richer profile.

**Do NOT copy:** his grouping "algorithm". `formGroups()` only flips a status string, and the "10 Strong / 10 Average / 10 Weak" display is hardcoded, so it is UI theater. Also skip configurable capacity/group size (we keep fixed 9 and 3) and his full 8-screen admin app.

---

## 8. Remaining work (honest estimate: about 32% done overall)

| Area | Weight | Done |
|---|---|---|
| Planning, algorithm design | 10% | 100% |
| Frontend | 25% | ~80% |
| Backend + MySQL/JPA | 35% | 0% |
| Integration (JWT, API wiring, errors) | 15% | 0% |
| Docker | 5% | 0% |
| Docs, tests, report, PPT, viva | 10% | ~25% |

**Backend to-do:**
- Spring Boot project and MySQL schema (User, Circle, CircleMember with `assessmentScore`, SubGroup, Task, Message, Milestone, Resource, Badge, Report).
- JPA entities/repositories, service layer, REST controllers.
- Port the grouping algorithm to Java with JUnit tests (cases: 3-3-3, all Intermediate, skewed tiers, N=7, N=10, N=3).
- Spring Security + JWT with roles.
- Service-layer authorization (assignee cannot confirm own task, only members can access their group data).
- `@ControllerAdvice` error handling and validation.
- Multipart upload for proofs/attachments (the frontend currently uses data URLs).
- `@Scheduled` job (deadline expiry, streak reset), seeded admin.
- Concurrency-safe join: unique (circle, user), lock the row, and run grouping once in the same transaction as the 9th join.

**Integration:** replace mocks in `/services` with real Axios/fetch calls, token handling, CORS, loading and error states, Postman collection.

**Deployment:** Dockerfiles plus docker-compose (Spring Boot, MySQL, frontend). Note: TanStack Start needs a Node/Nitro server, so nginx-only static hosting may not work. Either use a Node container or switch the frontend to a plain Vite SPA.

**Docs:** ER diagram, API list, report/synopsis, updated PPT, README, viva Q&A.

**Suggested order:** (1) repo restructure and backend skeleton + schema + JWT; (2) circles/join/grouping in Java; (3) tasks/chat/verification APIs and frontend wiring; (4) frontend gaps; (5) Docker, Postman, docs, PPT.

---

## 9. Code Quality Guardrails (include in every code-generator prompt)

1. **Modular, surgical edits:** change only the targeted function/component. No unrelated refactors, no deleting comments, no full-file overwrites, no monolith files. Reuse existing components before creating new ones.
2. **Human-readable code:** descriptive names, comments explaining WHY, no magic numbers (central `/constants` or `/config`), explicit code over clever one-liners.
3. **Architectural isolation:** network/state logic only in `/lib` or `/services`. Never create clients or network calls inside components or `useEffect` bodies. TypeScript interfaces for all payloads, props and entities in `/types`.
4. **Safe lifecycles:** every listener, timer or subscription has cleanup. Never wipe real data with defaults. Destructive actions must be explicit.
5. **Scope discipline:** build only what is asked. Ask before touching working code.
6. **No fake logic:** features must run on real computed data, not hardcoded demo values.

---

## 10. Tooling notes and lessons learned

- **Lovable:** free credits ran out (about 5 per 15-18 hours). Complex screens take 2-3 cycles. Project was exported and moved on.
- **Google AI Studio Build mode (Gemini):** hit quota errors and "retryable error from model provider" loops. A half-applied edit can leave a file broken, so check the Code tab. Its GitHub sync can **force-push and replace `main`**, which is dangerous in a team. Renaming the GitHub repo broke the sync link until it was reconnected.
- **Git hygiene lesson:** commit often, and use local git (VS Code) as the source of truth.
- **Team workflow (4 people, one repo):** everyone is a collaborator, `main` is protected (PR + 1 approval, no force push), feature branches (`feature/...`, `fix/...`, `docs/...`), commit prefixes (`feat:`, `fix:`, `docs:`), restructure into `frontend/`, `backend/`, `docs/` **before** parallel work starts, split ownership by area, never commit secrets (`.env`), and run AI Studio sync on `main` never.

---

## 11. Presentation to HoD (planned)

Position it honestly as **Phase 1 complete**: problem, algorithm design, working frontend with a real grouping algorithm. Phase 2 is Spring Boot, MySQL, JWT and Docker. Suggested 10-12 minutes: problem → solution → design decisions (no permanent leader, two separate stages, computed leader) → live demo from a local `npm run dev` (keep a screen-recording backup) → architecture → status and timeline.

The existing PPT needs fixes: replace stock mockup images with real screenshots, verify or replace the generic references, fill in the guide's name, and align the scope slides (9 members, groups of 3, no permanent leader).

Likely HoD questions: how is this different from Discord, skill honesty / quiz gaming, why 9, who becomes leader, backend timeline, security plan.

---

## 12. Open items to decide next

1. Approve or reject the snake-draft grouping and the deadline rule (section 6).
2. Add `assessmentScore` to the member entity and types.
3. Repo restructure (`frontend/` + `backend/` + `docs/`) and branch protection.
4. Divide the work among the 4 members.
5. Choose between keeping TanStack Start or simplifying to a Vite SPA for Docker.
6. Draft the ER diagram and MySQL schema (recommended next step).
