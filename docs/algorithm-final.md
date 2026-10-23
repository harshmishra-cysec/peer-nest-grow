# SkillNest — Final Group Formation Algorithm (as implemented)

## Rules
- Circle capacity N: 9, 12, 15, 18, 21, 24, 27, 30 (9 <= N <= 30, N % 3 = 0). Sub-group size = 3.
- Number of groups K = N / 3, so nobody is ever left over.
- Skill is per circle: each member takes a topic-specific 5-question MCQ **once, when joining that circle**
  (5 x 3 points = 15). `percentage = score / 15 x 100`.
- Bands: 0-39% Beginner (tier 1), 40-69% Intermediate (tier 2), 70-100% Advanced (tier 3).
  (Equals scores 0-5 / 6-10 / 11-15.) First attempt counts; no retakes.

## Formation (runs once, when the last slot is filled)
1. Sort members: tier DESC, percentage DESC, earlier assessment, lower user id (deterministic, no randomness).
2. Build three starting formations: greedy (strongest K seed the groups, rest go to the lowest-score open group),
   snake (0..K-1, K-1..0, ...) and deal (0..K-1, 0..K-1, ...).
3. Improve each by swapping two members between groups while this lowers
   `cost = (max group score - min group score) + 10 x (same-tier pairs inside groups)`.
   Group score = sum of member percentages. Tier diversity is preferred, never forced.
4. Keep the lowest-cost formation. Label it **Perfect Balance** only if every group has Advanced + Intermediate +
   Beginner, otherwise **Best Possible Balance** (the UI must not claim 1:1:1 then).
5. Validate: K groups, every group has exactly 3, every member appears exactly once. If not, throw and save nothing.
6. Leader per group: tier -> percentage -> earlier assessment -> lower user id. The circle creator is NOT
   automatically a leader.

Tested for N = 9..30 with uniform, skewed and 7A/5I/3B mixes: always N/3 groups of 3, no member missing or duplicated.

## Lifecycle
- OPEN -> FULL -> FORMED ("Grouped" in the UI). An OPEN circle past its deadline is EXPIRED: no joining, no partial groups.
- Leave before formation: member removed, circle stays open for a replacement.
- Leave after formation: no reshuffle. The group is marked **Needs Rebalancing**; if the leader left, the next best
  member becomes leader; a replacement who joins goes into that group.
- Leader privilege: only the leader can assign tasks to other members (anyone can add tasks for themselves).
- Task authorization is checked in the service layer: only the assignee marks done, only a non-assignee group member
  confirms, only group members comment or add tasks.

## Flaw status
| # | Flaw | Status |
|---|---|---|
| 1 | Perfect 3-3-3 is rare | Fixed - best possible balance with a measurable objective |
| 2 | Fallback ignored skill | Fixed - score-aware search (spread + diversity) |
| 3 | Silent member loss | Fixed - capacity rule + validation before saving |
| 4 | Quiz gameable | Partly - topic MCQs, % bands, one attempt. Guessing and question-bank quality remain |
| 5 | Weak Stage-1 recommendation | Fixed - joinable only, score > 0, top 5, deadline in score |
| 6 | No deadline fallback | Fixed - Expired status (backend job must persist it) |
| 7 | Leader has no purpose | Partly - leader assigns tasks, succession on leave |
| 8 | No leave / rebalancing | Fixed - see lifecycle (no admin rebalance screen yet) |
| 9 | Authorization only in UI | Fixed in services; Spring Security must repeat it |
| 10 | Concurrency | Simulated (idempotent join, capacity re-check, formation once). Real fix: DB transaction + unique constraint |
| 11 | Restrictions / streak / badges | Partly - join restriction enforced. Streak and badge calculation need timestamps and a DB (backend) |

## For the Spring Boot backend
Port `groupingService.ts` as-is (same steps, same tie-breakers). Do grouping server-side, in the same transaction
that accepts the last member; React only animates the result.
