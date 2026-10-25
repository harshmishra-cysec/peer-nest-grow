package com.skillnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateTaskRequest(@NotBlank @Size(max = 160) String title, @Size(max = 2000) String description,
                                @NotNull Long assigneeUserId, LocalDate dueDate) { }
