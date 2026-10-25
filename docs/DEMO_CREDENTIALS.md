# SkillNest demo credentials

These accounts are created when the database is empty. With the `local` Spring profile active, startup safely creates any missing demo records. All passwords are BCrypt encoded in the database.

## Admin

| Role | Email | Password |
|---|---|---|
| Admin | `admin@skillnest.com` | `AdminPass123` |

## Learners

All learner accounts use password **`LearnSkill123`**.

| # | Learner | Email | Circle A | Circle B | Circle C |
|---:|---|---|:---:|:---:|:---:|
| 01 | Aarav Mehta | `learner01@skillnest.com` | ✓ | — | — |
| 02 | Diya Nair | `learner02@skillnest.com` | ✓ | — | — |
| 03 | Rohan Kapoor | `learner03@skillnest.com` | ✓ | — | — |
| 04 | Ananya Iyer | `learner04@skillnest.com` | ✓ | — | — |
| 05 | Kabir Shah | `learner05@skillnest.com` | ✓ | — | — |
| 06 | Meera Joshi | `learner06@skillnest.com` | ✓ | — | — |
| 07 | Ishaan Rao | `learner07@skillnest.com` | ✓ | — | ✓ |
| 08 | Sara Thomas | `learner08@skillnest.com` | ✓ | — | ✓ |
| 09 | Vivaan Desai | `learner09@skillnest.com` | — | ✓ | ✓ |
| 10 | Tara Kulkarni | `learner10@skillnest.com` | — | ✓ | ✓ |
| 11 | Neel Banerjee | `learner11@skillnest.com` | — | ✓ | ✓ |
| 12 | Zoya Fernandes | `learner12@skillnest.com` | — | — | ✓ |
| 13 | Arjun Pillai | `learner13@skillnest.com` | — | — | ✓ |
| 14 | Kavya Menon | `learner14@skillnest.com` | — | — | ✓ |
| 15 | Reyansh Verma | `learner15@skillnest.com` | — | — | ✓ |

## Circle membership and live grouping demonstration

- **Circle A — DSA Sprint - Graph Mastery:** learners 01–08. Before the demo it is `OPEN`, has capacity 9, and contains exactly **8/9** members. The eight stored quizzes span Advanced (scores 14 and 12), Intermediate (9, 8 and 6), and Beginner (5, 4 and 2).
- **Circle B — Full-Stack Spring & React:** learners 09–11. It remains `OPEN` with exactly 3/12 members.
- **Circle C — System Design Cohort:** learners 07–15. It is `GROUPED` and has Alpha, Beta and Gamma subgroups with three members apiece. Learners 07–09 are in Alpha, 10–12 in Beta and 13–15 in Gamma. Learner 07 leads Alpha.

Use **learner 09** (`learner09@skillnest.com` / `LearnSkill123`) for the live Circle A ninth-member demo. This account is not already a member of Circle A. It can log in, list circles, and join Circle A with any five quiz answers from 0 through 3.

Expected transition:

1. Before joining: Circle A is `OPEN`, **8/9**; no subgroups exist for it.
2. Join with `POST /api/circles/{circleAId}/join`. The existing quiz scoring and locked join transaction run normally.
3. After joining: Circle A is `GROUPED`, **9/9**; the P4 grouping service has created three subgroups and their subgroup memberships. Retrieve them with `GET /api/circles/{circleAId}/subgroups` or `GET /api/circles/{circleAId}/my-subgroup`.

Postman collection: [`postman/skillnest.postman_collection.json`](postman/skillnest.postman_collection.json). Use its **Circle A live grouping demo** folder in sequence, followed by **Circle C workspace peer-review demo** to exercise task submission and peer confirmation with two known member accounts.
