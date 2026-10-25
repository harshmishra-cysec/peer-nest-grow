package com.skillnest.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.skillnest.entity.SubGroup;
import com.skillnest.entity.Task;
import com.skillnest.entity.TaskStatus;
import com.skillnest.entity.TaskVerification;
import com.skillnest.entity.User;
import com.skillnest.exception.GlobalExceptionHandler;
import com.skillnest.repository.MessageRepository;
import com.skillnest.repository.MilestoneRepository;
import com.skillnest.repository.ResourceRepository;
import com.skillnest.repository.SubGroupMemberRepository;
import com.skillnest.repository.SubGroupRepository;
import com.skillnest.repository.TaskRepository;
import com.skillnest.repository.TaskVerificationRepository;
import com.skillnest.repository.UserRepository;
import com.skillnest.service.WorkspaceService;
import com.skillnest.service.EngagementService;
import com.skillnest.service.BadgeService;
import com.skillnest.security.JwtService;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

@WebMvcTest(controllers = WorkspaceController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({WorkspaceService.class, GlobalExceptionHandler.class})
class WorkspaceAuthorizationIntegrationTest {
    @Autowired private MockMvc mvc;
    @MockitoBean private SubGroupRepository subGroups;
    @MockitoBean private SubGroupMemberRepository memberships;
    @MockitoBean private TaskRepository tasks;
    @MockitoBean private TaskVerificationRepository verifications;
    @MockitoBean private MessageRepository messages;
    @MockitoBean private MilestoneRepository milestones;
    @MockitoBean private ResourceRepository resources;
    @MockitoBean private UserRepository users;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private EngagementService engagementService;
    @MockitoBean private BadgeService badgeService;

    @AfterEach void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @Test void assigneeCannotConfirmOwnTask() throws Exception {
        Task task = task(); when(tasks.findById(70L)).thenReturn(Optional.of(task));
        when(memberships.existsBySubGroupIdAndUserId(12L, 5L)).thenReturn(true);

        mvc.perform(asUser(post("/api/tasks/70/confirm"), 5L))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Assignee cannot verify their own task"));
    }

    @Test void nonAssigneeMemberCanConfirmTask() throws Exception {
        Task task = task(); User peer = new User(); peer.setId(6L); peer.setName("Peer");
        when(tasks.findById(70L)).thenReturn(Optional.of(task));
        when(memberships.existsBySubGroupIdAndUserId(12L, 6L)).thenReturn(true);
        when(users.findById(6L)).thenReturn(Optional.of(peer));
        when(verifications.save(any(TaskVerification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mvc.perform(asUser(post("/api/tasks/70/confirm"), 6L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VERIFIED"));
        verify(verifications).save(any(TaskVerification.class));
    }

    @Test void nonMemberCannotAccessSubgroupTasks() throws Exception {
        SubGroup group = new SubGroup(); group.setId(12L);
        when(subGroups.findById(12L)).thenReturn(Optional.of(group));
        when(memberships.existsBySubGroupIdAndUserId(12L, 99L)).thenReturn(false);

        mvc.perform(asUser(get("/api/subgroups/12/tasks"), 99L))
                .andExpect(status().isForbidden());
    }

    private Task task() {
        User assignee = new User(); assignee.setId(5L); assignee.setName("Assignee");
        SubGroup group = new SubGroup(); group.setId(12L);
        Task task = new Task(); task.setId(70L); task.setSubGroup(group); task.setAssignee(assignee);
        task.setTitle("Read chapter"); task.setStatus(TaskStatus.PENDING_PEER_CONFIRMATION);
        return task;
    }

    private MockHttpServletRequestBuilder asUser(MockHttpServletRequestBuilder request, Long userId) {
        return request.with(servletRequest -> {
            SecurityContextHolder.getContext().setAuthentication(
                    UsernamePasswordAuthenticationToken.authenticated(userId, null, java.util.List.of()));
            return servletRequest;
        });
    }
}
