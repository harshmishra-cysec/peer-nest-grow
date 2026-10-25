package com.skillnest.dto;

import com.skillnest.entity.CommitmentLevel;
import com.skillnest.entity.GoalType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record CreateCircleRequest(
        @NotBlank(message = "Name is required")
        String name,

        String description,

        @NotBlank(message = "Topic is required")
        String topic,

        @NotNull(message = "Goal type is required")
        GoalType goalType,

        @NotNull(message = "Commitment is required")
        CommitmentLevel commitment,

        @NotNull(message = "Deadline is required")
        LocalDate deadline,

        Integer capacity,

        @NotNull(message = "Answers are required")
        @Size(min = 5, max = 5, message = "Quiz must have exactly 5 answers")
        List<Integer> answers
) {
}
