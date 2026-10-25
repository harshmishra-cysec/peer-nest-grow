package com.skillnest.dto;

import com.skillnest.entity.SkillLevel;
import java.time.Instant;

public record SubGroupMemberResponse(Long userId, String name, SkillLevel skillLevel, int assessmentScore, Instant joinedAt) { }
