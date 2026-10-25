package com.skillnest.dto;

import java.time.Instant;

public record MessageResponse(Long id, Long subGroupId, Long senderUserId, String senderName, String body, Instant sentAt) { }
