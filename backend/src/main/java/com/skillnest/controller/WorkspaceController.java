package com.skillnest.controller;

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
import com.skillnest.service.WorkspaceService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WorkspaceController {
    private final WorkspaceService workspace;
    public WorkspaceController(WorkspaceService workspace) { this.workspace = workspace; }

    @PostMapping("/api/subgroups/{id}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@PathVariable Long id, @Valid @RequestBody CreateTaskRequest request) { return workspace.createTask(id, request); }
    @GetMapping("/api/subgroups/{id}/tasks")
    public List<TaskResponse> tasks(@PathVariable Long id) { return workspace.getTasks(id); }
    @PostMapping("/api/tasks/{id}/mark-done")
    public TaskResponse markDone(@PathVariable Long id, @Valid @RequestBody MarkTaskDoneRequest request) { return workspace.markDone(id, request); }
    @PostMapping("/api/tasks/{id}/confirm")
    public TaskResponse confirm(@PathVariable Long id) { return workspace.confirmTask(id); }
    @PostMapping("/api/tasks/{id}/request-changes")
    public TaskResponse requestChanges(@PathVariable Long id, @Valid @RequestBody RequestTaskChangesRequest request) { return workspace.requestTaskChanges(id, request); }

    @GetMapping("/api/subgroups/{id}/messages")
    public List<MessageResponse> messages(@PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant since) { return workspace.getMessages(id, since); }
    @PostMapping("/api/subgroups/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse createMessage(@PathVariable Long id, @Valid @RequestBody CreateMessageRequest request) { return workspace.createMessage(id, request); }

    @GetMapping("/api/subgroups/{id}/milestones")
    public List<MilestoneResponse> milestones(@PathVariable Long id) { return workspace.getMilestones(id); }
    @PostMapping("/api/subgroups/{id}/milestones")
    @ResponseStatus(HttpStatus.CREATED)
    public MilestoneResponse createMilestone(@PathVariable Long id, @Valid @RequestBody CreateMilestoneRequest request) { return workspace.createMilestone(id, request); }
    @PatchMapping("/api/milestones/{id}/status")
    public MilestoneResponse updateMilestoneStatus(@PathVariable Long id, @Valid @RequestBody UpdateMilestoneStatusRequest request) { return workspace.updateMilestoneStatus(id, request); }

    @GetMapping("/api/subgroups/{id}/resources")
    public List<ResourceResponse> resources(@PathVariable Long id) { return workspace.getResources(id); }
    @PostMapping("/api/subgroups/{id}/resources")
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceResponse createResource(@PathVariable Long id, @Valid @RequestBody CreateResourceRequest request) { return workspace.createResource(id, request); }
}
