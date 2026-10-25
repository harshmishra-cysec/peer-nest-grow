package com.skillnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RequestTaskChangesRequest(@NotBlank @Size(max = 1000) String reviewNote) { }
