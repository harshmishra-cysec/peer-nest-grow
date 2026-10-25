package com.skillnest.dto;

import java.time.Instant;

public record ResourceResponse(Long id, Long subGroupId, String title, String url, Long addedByUserId, String addedByName, Instant addedAt) { }
