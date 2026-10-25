package com.skillnest.service.grouping;

import java.util.List;

public record FormedGroup(
        String name,
        Long leaderUserId,
        List<MemberAssessment> members
) {
}
