package com.skillnest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record JoinCircleRequest(
        @NotNull(message = "Answers are required")
        @Size(min = 5, max = 5, message = "Quiz must have exactly 5 answers")
        List<Integer> answers
) {
}
