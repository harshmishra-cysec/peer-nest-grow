package com.skillnest.service;

import com.skillnest.constants.AppConstants;
import com.skillnest.dto.QuizResult;
import com.skillnest.entity.SkillLevel;
import com.skillnest.exception.BadRequestException;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class QuizScoringService {

    public QuizResult calculateAssessment(List<Integer> answers) {
        if (answers == null || answers.size() != AppConstants.QUIZ_QUESTION_COUNT) {
            throw new BadRequestException("Quiz must have exactly 5 answers");
        }

        int rawScore = 0;
        for (Integer answer : answers) {
            if (answer == null
                    || answer < AppConstants.QUIZ_ANSWER_MIN
                    || answer > AppConstants.QUIZ_ANSWER_MAX) {
                throw new BadRequestException("Each answer must be between 0 and 3");
            }
            rawScore += answer;
        }

        double percentage = (rawScore / (double) AppConstants.QUIZ_MAX_RAW_SCORE) * 100;
        return new QuizResult(rawScore, percentage, toSkillLevel(rawScore));
    }

    private SkillLevel toSkillLevel(int rawScore) {
        if (rawScore >= AppConstants.QUIZ_ADVANCED_MIN) {
            return SkillLevel.ADVANCED;
        }
        if (rawScore >= AppConstants.QUIZ_INTERMEDIATE_MIN) {
            return SkillLevel.INTERMEDIATE;
        }
        return SkillLevel.BEGINNER;
    }
}
