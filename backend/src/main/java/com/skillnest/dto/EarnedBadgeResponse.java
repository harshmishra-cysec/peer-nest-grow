package com.skillnest.dto;

import java.time.Instant;

public record EarnedBadgeResponse(Long id, String name, String description, Instant earnedAt) { }
