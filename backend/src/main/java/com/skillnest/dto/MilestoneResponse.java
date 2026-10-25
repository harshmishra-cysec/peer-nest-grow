package com.skillnest.dto;

import com.skillnest.entity.MilestoneStatus;
import java.time.LocalDate;

public record MilestoneResponse(Long id, Long subGroupId, String title, String description, LocalDate dueDate, MilestoneStatus status) { }
