package com.skillnest.dto;

import java.time.Instant;
import java.util.List;

public record SubGroupResponse(Long id, Long circleId, String name, String balanceLabel, Long leaderUserId,
                               Instant createdAt, List<SubGroupMemberResponse> members) { }
