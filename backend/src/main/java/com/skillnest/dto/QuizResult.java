package com.skillnest.dto;

import com.skillnest.entity.SkillLevel;

public record QuizResult(int rawScore, double percentage, SkillLevel skillLevel) {
}
