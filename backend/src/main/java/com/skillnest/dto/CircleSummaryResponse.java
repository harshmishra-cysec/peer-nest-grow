package com.skillnest.dto;

import com.skillnest.entity.CircleStatus;
import com.skillnest.entity.CommitmentLevel;
import com.skillnest.entity.GoalType;
import java.time.LocalDate;

public record CircleSummaryResponse(
        Long id,
        String name,
        String topic,
        GoalType goalType,
        CommitmentLevel commitment,
        LocalDate deadline,
        CircleStatus status,
        int memberCount,
        int capacity
) {
}
