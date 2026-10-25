package com.skillnest.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.skillnest.dto.QuizResult;
import com.skillnest.entity.SkillLevel;
import com.skillnest.exception.BadRequestException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class QuizScoringServiceTest {

    private QuizScoringService quizScoringService;

    @BeforeEach
    void setUp() {
        quizScoringService = new QuizScoringService();
    }

    @Test
    void scoreZeroIsBeginner() {
        QuizResult result = quizScoringService.calculateAssessment(List.of(0, 0, 0, 0, 0));
        assertEquals(0, result.rawScore());
        assertEquals(0.0, result.percentage(), 0.0001);
        assertEquals(SkillLevel.BEGINNER, result.skillLevel());
    }

    @Test
    void scoreFiveIsBeginner() {
        QuizResult result = quizScoringService.calculateAssessment(List.of(1, 1, 1, 1, 1));
        assertEquals(5, result.rawScore());
        assertEquals((5 / 15.0) * 100, result.percentage(), 0.0001);
        assertEquals(SkillLevel.BEGINNER, result.skillLevel());
    }

    @Test
    void scoreSixIsIntermediate() {
        QuizResult result = quizScoringService.calculateAssessment(List.of(3, 3, 0, 0, 0));
        assertEquals(6, result.rawScore());
        assertEquals(40.0, result.percentage(), 0.0001);
        assertEquals(SkillLevel.INTERMEDIATE, result.skillLevel());
    }

    @Test
    void scoreTenIsIntermediate() {
        QuizResult result = quizScoringService.calculateAssessment(List.of(2, 2, 2, 2, 2));
        assertEquals(10, result.rawScore());
        assertEquals((10 / 15.0) * 100, result.percentage(), 0.0001);
        assertEquals(SkillLevel.INTERMEDIATE, result.skillLevel());
    }

    @Test
    void scoreElevenIsAdvanced() {
        QuizResult result = quizScoringService.calculateAssessment(List.of(3, 3, 3, 2, 0));
        assertEquals(11, result.rawScore());
        assertEquals((11 / 15.0) * 100, result.percentage(), 0.0001);
        assertEquals(SkillLevel.ADVANCED, result.skillLevel());
    }

    @Test
    void scoreFifteenIsAdvanced() {
        QuizResult result = quizScoringService.calculateAssessment(List.of(3, 3, 3, 3, 3));
        assertEquals(15, result.rawScore());
        assertEquals(100.0, result.percentage(), 0.0001);
        assertEquals(SkillLevel.ADVANCED, result.skillLevel());
    }

    @Test
    void rejectsWrongNumberOfAnswers() {
        assertThrows(
                BadRequestException.class,
                () -> quizScoringService.calculateAssessment(List.of(1, 2, 3, 0))
        );
    }

    @Test
    void rejectsAnswerBelowZero() {
        assertThrows(
                BadRequestException.class,
                () -> quizScoringService.calculateAssessment(List.of(0, 0, 0, 0, -1))
        );
    }

    @Test
    void rejectsAnswerAboveThree() {
        assertThrows(
                BadRequestException.class,
                () -> quizScoringService.calculateAssessment(List.of(0, 0, 0, 0, 4))
        );
    }
}
