package com.skillnest.dto;

import com.skillnest.entity.MilestoneStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateMilestoneStatusRequest(@NotNull MilestoneStatus status) { }
