package com.skillnest.config;

import com.skillnest.dto.QuizResult;
import com.skillnest.entity.Circle;
import com.skillnest.entity.CircleMember;
import com.skillnest.entity.CircleStatus;
import com.skillnest.entity.CommitmentLevel;
import com.skillnest.entity.GoalType;
import com.skillnest.entity.Message;
import com.skillnest.entity.Role;
import com.skillnest.entity.SubGroup;
import com.skillnest.entity.SubGroupMember;
import com.skillnest.entity.Task;
import com.skillnest.entity.TaskStatus;
import com.skillnest.entity.TaskVerification;
import com.skillnest.entity.User;
import com.skillnest.repository.CircleMemberRepository;
import com.skillnest.repository.CircleRepository;
import com.skillnest.repository.MessageRepository;
import com.skillnest.repository.SubGroupMemberRepository;
import com.skillnest.repository.SubGroupRepository;
import com.skillnest.repository.TaskRepository;
import com.skillnest.repository.TaskVerificationRepository;
import com.skillnest.repository.UserRepository;
import com.skillnest.service.QuizScoringService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Creates stable local/demo records without interfering with a live Circle A after its final join. */
@Component
public class DataSeeder implements CommandLineRunner {
    public static final String ADMIN_EMAIL = "admin@skillnest.com";
    public static final String ADMIN_PASSWORD = "AdminPass123";
    public static final String LEARNER_PASSWORD = "LearnSkill123";
    public static final String CIRCLE_A_NAME = "DSA Sprint - Graph Mastery";
    public static final String CIRCLE_B_NAME = "Full-Stack Spring & React";
    public static final String CIRCLE_C_NAME = "System Design Cohort";

    private static final List<LearnerSeed> LEARNERS = List.of(
            new LearnerSeed("Aarav Mehta", "learner01@skillnest.com", "Enjoys algorithm contests and explaining data structures."),
            new LearnerSeed("Diya Nair", "learner02@skillnest.com", "Computer science student exploring backend engineering."),
            new LearnerSeed("Rohan Kapoor", "learner03@skillnest.com", "Building small apps and learning by shipping."),
            new LearnerSeed("Ananya Iyer", "learner04@skillnest.com", "Interested in accessible design and frontend craft."),
            new LearnerSeed("Kabir Shah", "learner05@skillnest.com", "Practicing problem solving before internship interviews."),
            new LearnerSeed("Meera Joshi", "learner06@skillnest.com", "Likes study groups, clear notes, and steady progress."),
            new LearnerSeed("Ishaan Rao", "learner07@skillnest.com", "Learning cloud systems and distributed computing."),
            new LearnerSeed("Sara Thomas", "learner08@skillnest.com", "Full stack learner with a soft spot for clean APIs."),
            new LearnerSeed("Vivaan Desai", "learner09@skillnest.com", "Working toward a first production-ready Spring project."),
            new LearnerSeed("Tara Kulkarni", "learner10@skillnest.com", "Curious about React, testing, and product engineering."),
            new LearnerSeed("Neel Banerjee", "learner11@skillnest.com", "Enjoys systems thinking and collaborative learning."),
            new LearnerSeed("Zoya Fernandes", "learner12@skillnest.com", "Learning Java fundamentals and improving daily."),
            new LearnerSeed("Arjun Pillai", "learner13@skillnest.com", "Interested in architecture, databases, and reliability."),
            new LearnerSeed("Kavya Menon", "learner14@skillnest.com", "Frontend developer growing into full stack work."),
            new LearnerSeed("Reyansh Verma", "learner15@skillnest.com", "Preparing for interviews with consistent practice."));

    private final UserRepository users;
    private final CircleRepository circles;
    private final CircleMemberRepository circleMembers;
    private final SubGroupRepository subGroups;
    private final SubGroupMemberRepository subGroupMembers;
    private final TaskRepository tasks;
    private final TaskVerificationRepository verifications;
    private final MessageRepository messages;
    private final PasswordEncoder passwordEncoder;
    private final QuizScoringService quizScoringService;
    private final Environment environment;

    public DataSeeder(UserRepository users, CircleRepository circles, CircleMemberRepository circleMembers,
                      SubGroupRepository subGroups, SubGroupMemberRepository subGroupMembers,
                      TaskRepository tasks, TaskVerificationRepository verifications, MessageRepository messages,
                      PasswordEncoder passwordEncoder, QuizScoringService quizScoringService, Environment environment) {
        this.users = users; this.circles = circles; this.circleMembers = circleMembers; this.subGroups = subGroups;
        this.subGroupMembers = subGroupMembers; this.tasks = tasks; this.verifications = verifications;
        this.messages = messages; this.passwordEncoder = passwordEncoder; this.quizScoringService = quizScoringService;
        this.environment = environment;
    }

    @Override
    @Transactional
    public void run(String... args) {
        boolean local = List.of(environment.getActiveProfiles()).contains("local");
        if (users.count() != 0 && !local) {
            System.out.println("SkillNest demo seeding skipped (users already exist; activate the local profile to reconcile demo data).");
            return;
        }
        User admin = getOrCreateUser("SkillNest Admin", ADMIN_EMAIL, ADMIN_PASSWORD,
                "Platform administrator for local demonstrations.", Role.ADMIN);
        Map<Integer, User> learners = new LinkedHashMap<>();
        for (int i = 0; i < LEARNERS.size(); i++) {
            LearnerSeed seed = LEARNERS.get(i);
            learners.put(i + 1, getOrCreateUser(seed.name(), seed.email(), LEARNER_PASSWORD, seed.bio(), Role.LEARNER));
        }

        Circle circleA = getOrCreateCircle(CIRCLE_A_NAME, "Data Structures & Algorithms", "LEARN together on graph algorithms and interview patterns.", GoalType.LEARN, CommitmentLevel.SERIOUS, 9, CircleStatus.OPEN);
        addCircleMembersUntil(circleA, learners, List.of(1, 2, 3, 4, 5, 6, 7, 8), List.of(14, 12, 9, 8, 6, 5, 4, 2), 8);

        Circle circleB = getOrCreateCircle(CIRCLE_B_NAME, "Full Stack Java", "BUILD a small full stack product with Spring and React.", GoalType.BUILD, CommitmentLevel.CASUAL, 12, CircleStatus.OPEN);
        addCircleMembersUntil(circleB, learners, List.of(9, 10, 11), List.of(13, 9, 4), 3);

        Circle circleC = getOrCreateCircle(CIRCLE_C_NAME, "System Design", "A formed cohort practicing practical system design.", GoalType.LEARN, CommitmentLevel.SERIOUS, 9, CircleStatus.GROUPED);
        addCircleMembersUntil(circleC, learners, List.of(7, 8, 9, 10, 11, 12, 13, 14, 15), List.of(14, 8, 4, 12, 9, 5, 11, 6, 3), 9);
        seedCircleCWorkspace(circleC, learners);
        circleC.setStatus(CircleStatus.GROUPED);
        circles.save(circleC);

        printDemoInstructions(admin, learners, circleA, circleB, circleC);
    }

    private User getOrCreateUser(String name, String email, String password, String bio, Role role) {
        return users.findByEmail(email).orElseGet(() -> {
            User user = new User(); user.setName(name); user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(password)); user.setBio(bio);
            user.setRole(role); user.setCurrentStreakDays(0); return users.save(user);
        });
    }

    private Circle getOrCreateCircle(String name, String topic, String description, GoalType goal,
                                     CommitmentLevel commitment, int capacity, CircleStatus status) {
        return circles.findByName(name).orElseGet(() -> {
            Circle circle = new Circle(); circle.setName(name); circle.setTopic(topic); circle.setDescription(description);
            circle.setGoalType(goal); circle.setCommitment(commitment); circle.setCapacity(capacity);
            circle.setDeadline(LocalDate.now().plusDays(90)); circle.setStatus(status); return circles.save(circle);
        });
    }

    private void addCircleMembersUntil(Circle circle, Map<Integer, User> learnerByNumber, List<Integer> roster,
                                       List<Integer> scores, int targetCount) {
        for (int i = 0; i < roster.size() && circleMembers.countByCircleId(circle.getId()) < targetCount; i++) {
            User user = learnerByNumber.get(roster.get(i));
            if (circleMembers.existsByCircleIdAndUserId(circle.getId(), user.getId())) continue;
            QuizResult result = quizScoringService.calculateAssessment(answersForScore(scores.get(i)));
            CircleMember member = new CircleMember(); member.setCircle(circle); member.setUser(user);
            member.setAssessmentScore(result.rawScore()); member.setSkillLevel(result.skillLevel()); circleMembers.save(member);
        }
    }

    private List<Integer> answersForScore(int score) {
        List<Integer> answers = new ArrayList<>(5); int remaining = score;
        for (int i = 0; i < 5; i++) { int answer = Math.min(3, remaining); answers.add(answer); remaining -= answer; }
        return answers;
    }

    private void seedCircleCWorkspace(Circle circle, Map<Integer, User> learners) {
        List<List<Integer>> rosters = List.of(List.of(7, 8, 9), List.of(10, 11, 12), List.of(13, 14, 15));
        List<String> names = List.of("Sub-Group Alpha", "Sub-Group Beta", "Sub-Group Gamma");
        List<SubGroup> foundGroups = subGroups.findByCircleId(circle.getId());
        for (int i = 0; i < names.size(); i++) {
            List<Integer> roster = rosters.get(i);
            String subgroupName = names.get(i);
            SubGroup group = foundGroups.stream().filter(existing -> subgroupName.equals(existing.getName())).findFirst().orElseGet(() -> {
                SubGroup created = new SubGroup(); created.setCircle(circle); created.setName(subgroupName);
                created.setBalanceLabel("Best Possible Balance"); created.setLeader(learners.get(roster.get(0)));
                return subGroups.save(created);
            });
            for (Integer learnerNumber : roster) {
                User memberUser = learners.get(learnerNumber);
                if (!subGroupMembers.existsBySubGroupIdAndUserId(group.getId(), memberUser.getId())) {
                    SubGroupMember membership = new SubGroupMember(); membership.setSubGroup(group); membership.setUser(memberUser); subGroupMembers.save(membership);
                }
            }
            seedSampleTasksAndMessages(group, roster.stream().map(learners::get).toList(), names.get(i));
        }
    }

    private void seedSampleTasksAndMessages(SubGroup group, List<User> members, String groupName) {
        User assignee = members.get(1); User peer = members.get(2);
        seedTask(group, members.get(0), groupName + " - map the system boundaries", TaskStatus.IN_PROGRESS, null, null);
        seedTask(group, assignee, groupName + " - add the API contract draft", TaskStatus.PENDING_PEER_CONFIRMATION, "https://example.com/demo-proof", null);
        Task verified = seedTask(group, members.get(2), groupName + " - document the data model", TaskStatus.VERIFIED, "https://example.com/demo-model", null);
        if (verified != null) {
            // Keep the verifier distinct from the assignee, matching the live peer-review rule.
            User verifier = members.get(0);
            if (!verifications.existsByTaskIdAndVerifiedById(verified.getId(), verifier.getId())) {
            TaskVerification record = new TaskVerification(); record.setTask(verified); record.setVerifiedBy(verifier); verifications.save(record);
            }
        }
        List<String> seededMessages = List.of("Welcome to " + groupName + " — share one design question to get started.",
                "I added a first pass at the requirements. Please leave feedback in the task thread.");
        List<Message> existing = messages.findBySubGroupIdOrderBySentAtAsc(group.getId());
        for (int i = 0; i < seededMessages.size(); i++) {
            String body = seededMessages.get(i);
            if (existing.stream().noneMatch(m -> body.equals(m.getBody()))) {
                Message message = new Message(); message.setSubGroup(group); message.setSender(members.get(i)); message.setBody(body); messages.save(message);
            }
        }
    }

    private Task seedTask(SubGroup group, User assignee, String title, TaskStatus status, String proofUrl, String reviewNote) {
        Task existing = tasks.findBySubGroupId(group.getId()).stream().filter(task -> title.equals(task.getTitle())).findFirst().orElse(null);
        if (existing != null) return existing;
        Task task = new Task(); task.setSubGroup(group); task.setAssignee(assignee); task.setTitle(title);
        task.setDescription("Sample workspace task for the SkillNest live demo."); task.setDueDate(LocalDate.now().plusDays(7));
        task.setStatus(status); task.setProofUrl(proofUrl); task.setReviewNote(reviewNote); return tasks.save(task);
    }

    private void printDemoInstructions(User admin, Map<Integer, User> learners, Circle circleA, Circle circleB, Circle circleC) {
        long circleACount = circleMembers.countByCircleId(circleA.getId());
        long circleBCount = circleMembers.countByCircleId(circleB.getId());
        long circleCCount = circleMembers.countByCircleId(circleC.getId());
        System.out.println("\n================ SKILLNEST DEMO DATA ================");
        System.out.println("Admin: " + admin.getEmail() + " / " + ADMIN_PASSWORD);
        System.out.println("Learners (all use password " + LEARNER_PASSWORD + "):");
        learners.forEach((number, user) -> System.out.printf("  %02d. %-30s %s%n", number, user.getName(), user.getEmail()));
        System.out.println("Circles:");
        System.out.println("  Circle A: " + CIRCLE_A_NAME + " — " + circleACount + "/" + circleA.getCapacity() + " members, " + circleA.getStatus());
        System.out.println("  Circle B: " + CIRCLE_B_NAME + " — " + circleBCount + "/" + circleB.getCapacity() + " members, " + circleB.getStatus());
        System.out.println("  Circle C: " + CIRCLE_C_NAME + " — " + circleCCount + " members, " + circleC.getStatus() + ", " + subGroups.findByCircleId(circleC.getId()).size() + " sub-groups");
        if (circleACount == 8 && circleA.getStatus() == CircleStatus.OPEN) {
            System.out.println("Live grouping demo: log in as learner09@skillnest.com, list circles, then join Circle A with any five answers from 0 to 3.");
            System.out.println("After the ninth member joins, Circle A becomes GROUPED and GET /api/circles/{id}/subgroups returns the generated sub-groups.");
        } else {
            System.out.println("Circle A has already moved beyond its fresh 8/9 demo state. To replay the ninth-member flow, start with an empty local demo database.");
        }
        System.out.println("======================================================\n");
    }

    private record LearnerSeed(String name, String email, String bio) { }
}
