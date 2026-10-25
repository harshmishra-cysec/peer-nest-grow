package com.skillnest.service.grouping;

import com.skillnest.entity.SkillLevel;
import java.time.Instant;

public record MemberAssessment(
        Long userId,
        int assessmentScore,
        double percentage,
        SkillLevel skillLevel,
        Instant joinedAt
) {
}
