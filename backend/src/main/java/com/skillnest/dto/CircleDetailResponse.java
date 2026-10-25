package com.skillnest.dto;

import com.skillnest.entity.CircleStatus;
import com.skillnest.entity.CommitmentLevel;
import com.skillnest.entity.GoalType;
import java.time.LocalDate;
import java.util.List;

public record CircleDetailResponse(
        Long id,
        String name,
        String description,
        String topic,
        GoalType goalType,
        CommitmentLevel commitment,
        LocalDate deadline,
        CircleStatus status,
        int memberCount,
        int capacity,
        List<CircleMemberResponse> members
) {
}
