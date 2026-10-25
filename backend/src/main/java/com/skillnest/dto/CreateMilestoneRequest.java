package com.skillnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateMilestoneRequest(@NotBlank @Size(max = 160) String title, @Size(max = 1000) String description, LocalDate dueDate) { }
