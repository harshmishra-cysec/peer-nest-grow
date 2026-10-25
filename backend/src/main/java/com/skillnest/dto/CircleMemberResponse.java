package com.skillnest.dto;

import com.skillnest.entity.SkillLevel;
import java.time.Instant;

public record CircleMemberResponse(
        Long userId,
        String name,
        Instant joinedAt,
        SkillLevel skillLevel,
        Integer assessmentScore
) {
}
