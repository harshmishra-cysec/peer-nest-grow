package com.skillnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateResourceRequest(@NotBlank @Size(max = 160) String title, @NotBlank @Size(max = 500) String url) { }
