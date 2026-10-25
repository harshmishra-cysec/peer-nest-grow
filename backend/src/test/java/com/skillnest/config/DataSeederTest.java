package com.skillnest.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.skillnest.entity.Circle;
import com.skillnest.entity.CircleStatus;
import com.skillnest.entity.SubGroup;
import com.skillnest.entity.TaskStatus;
import com.skillnest.repository.CircleMemberRepository;
import com.skillnest.repository.CircleRepository;
import com.skillnest.repository.MessageRepository;
import com.skillnest.repository.SubGroupMemberRepository;
import com.skillnest.repository.SubGroupRepository;
import com.skillnest.repository.TaskRepository;
import com.skillnest.repository.TaskVerificationRepository;
import com.skillnest.repository.UserRepository;
import com.skillnest.service.QuizScoringService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@DataJpaTest
class DataSeederTest {
    @Autowired private UserRepository users;
    @Autowired private CircleRepository circles;
    @Autowired private CircleMemberRepository circleMembers;
    @Autowired private SubGroupRepository subGroups;
    @Autowired private SubGroupMemberRepository subGroupMembers;
    @Autowired private TaskRepository tasks;
    @Autowired private TaskVerificationRepository verifications;
    @Autowired private MessageRepository messages;
    private DataSeeder seeder;
    private BCryptPasswordEncoder encoder;

    @BeforeEach void setUp() {
        encoder = new BCryptPasswordEncoder();
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("local");
        seeder = new DataSeeder(users, circles, circleMembers, subGroups, subGroupMembers, tasks,
                verifications, messages, encoder, new QuizScoringService(), environment);
    }

    @Test void seedsDemoDataAndReconcilesSafelyOnRepeatedLocalStartup() throws Exception {
        seeder.run();
        assertEquals(16, users.count());
        assertTrue(encoder.matches(DataSeeder.ADMIN_PASSWORD, users.findByEmail(DataSeeder.ADMIN_EMAIL).orElseThrow().getPasswordHash()));
        assertTrue(encoder.matches(DataSeeder.LEARNER_PASSWORD, users.findByEmail("learner01@skillnest.com").orElseThrow().getPasswordHash()));

        Circle a = circles.findByName(DataSeeder.CIRCLE_A_NAME).orElseThrow();
        Circle b = circles.findByName(DataSeeder.CIRCLE_B_NAME).orElseThrow();
        Circle c = circles.findByName(DataSeeder.CIRCLE_C_NAME).orElseThrow();
        assertEquals(8, circleMembers.countByCircleId(a.getId()));
        assertEquals(9, a.getCapacity()); assertEquals(CircleStatus.OPEN, a.getStatus());
        assertEquals(3, circleMembers.countByCircleId(b.getId()));
        assertEquals(CircleStatus.OPEN, b.getStatus());
        assertEquals(9, circleMembers.countByCircleId(c.getId()));
        assertEquals(CircleStatus.GROUPED, c.getStatus());
        List<SubGroup> cGroups = subGroups.findByCircleId(c.getId());
        assertEquals(3, cGroups.size());
        assertEquals(List.of("Sub-Group Alpha", "Sub-Group Beta", "Sub-Group Gamma"), cGroups.stream().map(SubGroup::getName).sorted().toList());
        for (SubGroup group : cGroups) assertEquals(3, subGroupMembers.findBySubGroupId(group.getId()).size());
        assertTrue(tasks.findAll().stream().anyMatch(task -> task.getStatus() == TaskStatus.IN_PROGRESS));
        assertTrue(tasks.findAll().stream().anyMatch(task -> task.getStatus() == TaskStatus.PENDING_PEER_CONFIRMATION));
        assertTrue(tasks.findAll().stream().anyMatch(task -> task.getStatus() == TaskStatus.VERIFIED));

        long groupCount = subGroups.count(); long membershipCount = subGroupMembers.count();
        long taskCount = tasks.count(); long messageCount = messages.count(); long verificationCount = verifications.count();
        seeder.run();
        assertEquals(16, users.count());
        assertEquals(3, circles.count());
        assertEquals(8, circleMembers.countByCircleId(a.getId()));
        assertEquals(groupCount, subGroups.count());
        assertEquals(membershipCount, subGroupMembers.count());
        assertEquals(taskCount, tasks.count());
        assertEquals(messageCount, messages.count());
        assertEquals(verificationCount, verifications.count());
    }
}
