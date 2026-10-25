package com.skillnest.dto;

import com.skillnest.entity.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(Long id, Long subGroupId, String title, String description, Long assigneeUserId,
                           String assigneeName, LocalDate dueDate, TaskStatus status, String proofUrl,
                           String reviewNote, Instant createdAt) { }
