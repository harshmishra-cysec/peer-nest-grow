package com.skillnest.dto;

import jakarta.validation.constraints.Size;

public record MarkTaskDoneRequest(@Size(max = 500) String proofUrl) { }
