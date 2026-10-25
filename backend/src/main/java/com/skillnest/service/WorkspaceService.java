package com.skillnest.service;

import com.skillnest.dto.CreateMessageRequest;
import com.skillnest.dto.CreateMilestoneRequest;
import com.skillnest.dto.CreateResourceRequest;
import com.skillnest.dto.CreateTaskRequest;
import com.skillnest.dto.MarkTaskDoneRequest;
import com.skillnest.dto.MessageResponse;
import com.skillnest.dto.MilestoneResponse;
import com.skillnest.dto.ResourceResponse;
import com.skillnest.dto.RequestTaskChangesRequest;
import com.skillnest.dto.TaskResponse;
import com.skillnest.dto.UpdateMilestoneStatusRequest;
import com.skillnest.entity.Message;
import com.skillnest.entity.Milestone;
import com.skillnest.entity.Resource;
import com.skillnest.entity.SubGroup;
import com.skillnest.entity.SubGroupMember;
import com.skillnest.entity.Task;
import com.skillnest.entity.TaskStatus;
import com.skillnest.entity.TaskVerification;
import com.skillnest.entity.User;
import com.skillnest.exception.BadRequestException;
import com.skillnest.exception.ForbiddenException;
import com.skillnest.exception.ResourceNotFoundException;
import com.skillnest.exception.UnauthorizedException;
import com.skillnest.repository.MessageRepository;
import com.skillnest.repository.MilestoneRepository;
import com.skillnest.repository.ResourceRepository;
import com.skillnest.repository.SubGroupMemberRepository;
import com.skillnest.repository.SubGroupRepository;
import com.skillnest.repository.TaskRepository;
import com.skillnest.repository.TaskVerificationRepository;
import com.skillnest.repository.UserRepository;
import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkspaceService {
    private static final int MESSAGE_LIMIT = 50;
    private final SubGroupRepository subGroups;
    private final SubGroupMemberRepository memberships;
    private final TaskRepository tasks;
    private final TaskVerificationRepository verifications;
    private final MessageRepository messages;
    private final MilestoneRepository milestones;
    private final ResourceRepository resources;
    private final UserRepository users;
    private final EngagementService engagement;
    private final BadgeService badges;

    public WorkspaceService(SubGroupRepository subGroups, SubGroupMemberRepository memberships,
                            TaskRepository tasks, TaskVerificationRepository verifications,
                            MessageRepository messages, MilestoneRepository milestones,
                            ResourceRepository resources, UserRepository users,
                            EngagementService engagement, BadgeService badges) {
        this.subGroups = subGroups; this.memberships = memberships; this.tasks = tasks;
        this.verifications = verifications; this.messages = messages; this.milestones = milestones;
        this.resources = resources; this.users = users; this.engagement = engagement; this.badges = badges;
    }

    @Transactional
    public TaskResponse createTask(Long subgroupId, CreateTaskRequest request) {
        SubGroup group = requireMemberGroup(subgroupId);
        Long callerId = currentUserId();
        if (!callerId.equals(request.assigneeUserId()) && !callerId.equals(group.getLeader().getId()))
            throw new ForbiddenException("Only the subgroup leader can assign tasks to other members");
        if (!memberships.existsBySubGroupIdAndUserId(subgroupId, request.assigneeUserId()))
            throw new BadRequestException("Assignee must be a member of this sub-group");
        User assignee = users.findById(request.assigneeUserId()).orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
        Task task = new Task(); task.setSubGroup(group); task.setTitle(request.title().trim());
        task.setDescription(request.description()); task.setAssignee(assignee); task.setDueDate(request.dueDate());
        task.setStatus(TaskStatus.IN_PROGRESS);
        return toResponse(tasks.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(Long subgroupId) {
        requireMemberGroup(subgroupId);
        return tasks.findBySubGroupId(subgroupId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public TaskResponse markDone(Long taskId, MarkTaskDoneRequest request) {
        Task task = requireTask(taskId); requireMembership(task.getSubGroup().getId(), currentUserId());
        if (!currentUserId().equals(task.getAssignee().getId())) throw new ForbiddenException("Only the assignee can mark this task done");
        if (task.getStatus() != TaskStatus.IN_PROGRESS && task.getStatus() != TaskStatus.CHANGES_REQUESTED)
            throw new BadRequestException("Task cannot be submitted in its current status");
        String proofUrl = request == null ? null : request.proofUrl();
        if (proofUrl != null && !proofUrl.isBlank()) validateUrl(proofUrl);
        task.setProofUrl(proofUrl == null || proofUrl.isBlank() ? null : proofUrl.trim());
        task.setReviewNote(null); task.setStatus(TaskStatus.PENDING_PEER_CONFIRMATION);
        engagement.touchActivity(task.getAssignee());
        return toResponse(task);
    }

    @Transactional
    public TaskResponse confirmTask(Long taskId) {
        Task task = requireTask(taskId); Long callerId = currentUserId();
        requireMembership(task.getSubGroup().getId(), callerId);
        if (callerId.equals(task.getAssignee().getId())) throw new ForbiddenException("Assignee cannot verify their own task");
        requirePending(task);
        User verifier = users.findById(callerId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TaskVerification verification = new TaskVerification(); verification.setTask(task); verification.setVerifiedBy(verifier);
        verifications.save(verification); task.setStatus(TaskStatus.VERIFIED); task.setReviewNote(null);
        engagement.touchActivity(verifier);
        badges.onTaskVerified(task);
        return toResponse(task);
    }

    @Transactional
    public TaskResponse requestTaskChanges(Long taskId, RequestTaskChangesRequest request) {
        Task task = requireTask(taskId); Long callerId = currentUserId();
        requireMembership(task.getSubGroup().getId(), callerId);
        if (callerId.equals(task.getAssignee().getId())) throw new ForbiddenException("Assignee cannot review their own task");
        requirePending(task); task.setReviewNote(request.reviewNote().trim()); task.setStatus(TaskStatus.CHANGES_REQUESTED);
        return toResponse(task);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long subgroupId, Instant since) {
        requireMemberGroup(subgroupId);
        PageRequest page = PageRequest.of(0, MESSAGE_LIMIT);
        if (since != null) return messages.findBySubGroupIdAndSentAtAfterOrderBySentAtAsc(subgroupId, since)
                .stream().map(this::toResponse).toList();
        List<Message> newestFirst = messages.findBySubGroupIdOrderBySentAtDesc(subgroupId, page);
        List<Message> chronological = new ArrayList<>(newestFirst); java.util.Collections.reverse(chronological);
        return chronological.stream().map(this::toResponse).toList();
    }

    @Transactional
    public MessageResponse createMessage(Long subgroupId, CreateMessageRequest request) {
        SubGroup group = requireMemberGroup(subgroupId); User sender = currentUser();
        Message message = new Message(); message.setSubGroup(group); message.setSender(sender); message.setBody(request.body().trim());
        engagement.touchActivity(sender);
        return toResponse(messages.save(message));
    }

    @Transactional(readOnly = true)
    public List<MilestoneResponse> getMilestones(Long subgroupId) {
        requireMemberGroup(subgroupId); return milestones.findBySubGroupId(subgroupId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public MilestoneResponse createMilestone(Long subgroupId, CreateMilestoneRequest request) {
        SubGroup group = requireMemberGroup(subgroupId); Milestone milestone = new Milestone();
        milestone.setSubGroup(group); milestone.setTitle(request.title().trim()); milestone.setDescription(request.description());
        milestone.setDueDate(request.dueDate()); return toResponse(milestones.save(milestone));
    }

    @Transactional
    public MilestoneResponse updateMilestoneStatus(Long milestoneId, UpdateMilestoneStatusRequest request) {
        Milestone milestone = milestones.findById(milestoneId).orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));
        requireMembership(milestone.getSubGroup().getId(), currentUserId()); milestone.setStatus(request.status());
        return toResponse(milestone);
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getResources(Long subgroupId) {
        requireMemberGroup(subgroupId); return resources.findBySubGroupId(subgroupId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ResourceResponse createResource(Long subgroupId, CreateResourceRequest request) {
        SubGroup group = requireMemberGroup(subgroupId); validateUrl(request.url());
        Resource resource = new Resource(); resource.setSubGroup(group); resource.setTitle(request.title().trim());
        resource.setUrl(request.url().trim()); resource.setAddedBy(currentUser()); return toResponse(resources.save(resource));
    }

    private SubGroup requireMemberGroup(Long subgroupId) {
        SubGroup group = subGroups.findById(subgroupId).orElseThrow(() -> new ResourceNotFoundException("Sub-group not found"));
        requireMembership(subgroupId, currentUserId()); return group;
    }

    private void requireMembership(Long subgroupId, Long userId) {
        if (!memberships.existsBySubGroupIdAndUserId(subgroupId, userId))
            throw new ForbiddenException("Only active members of this sub-group can access its workspace");
    }

    private Task requireTask(Long id) { return tasks.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found")); }
    private void requirePending(Task task) { if (task.getStatus() != TaskStatus.PENDING_PEER_CONFIRMATION) throw new BadRequestException("Task is not awaiting peer review"); }
    private User currentUser() { return users.findById(currentUserId()).orElseThrow(() -> new ResourceNotFoundException("User not found")); }
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) throw new UnauthorizedException("Authentication required");
        Object principal = auth.getPrincipal(); return principal instanceof Long id ? id : Long.valueOf(principal.toString());
    }
    private TaskResponse toResponse(Task t) { return new TaskResponse(t.getId(), t.getSubGroup().getId(), t.getTitle(), t.getDescription(), t.getAssignee().getId(), t.getAssignee().getName(), t.getDueDate(), t.getStatus(), t.getProofUrl(), t.getReviewNote(), t.getCreatedAt()); }
    private MessageResponse toResponse(Message m) { return new MessageResponse(m.getId(), m.getSubGroup().getId(), m.getSender().getId(), m.getSender().getName(), m.getBody(), m.getSentAt()); }
    private MilestoneResponse toResponse(Milestone m) { return new MilestoneResponse(m.getId(), m.getSubGroup().getId(), m.getTitle(), m.getDescription(), m.getDueDate(), m.getStatus()); }
    private ResourceResponse toResponse(Resource r) { return new ResourceResponse(r.getId(), r.getSubGroup().getId(), r.getTitle(), r.getUrl(), r.getAddedBy().getId(), r.getAddedBy().getName(), r.getAddedAt()); }
    private void validateUrl(String value) {
        try { URI uri = URI.create(value.trim()); String scheme = uri.getScheme();
            if (uri.getHost() == null || !("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))) throw new IllegalArgumentException();
        } catch (IllegalArgumentException ex) { throw new BadRequestException("Resource URL must be a valid HTTP or HTTPS URL"); }
    }
}
