package com.skillnest.constants;

/**
 * Single place for domain numbers so they are never scattered as magic values.
 */
public final class AppConstants {

    public static final int DEFAULT_CIRCLE_CAPACITY = 9;
    public static final int CIRCLE_CAPACITY = DEFAULT_CIRCLE_CAPACITY;
    public static final int MIN_CIRCLE_CAPACITY = 9;
    public static final int MAX_CIRCLE_CAPACITY = 30;
    public static final int SUB_GROUP_SIZE = 3;
    public static final int QUIZ_QUESTION_COUNT = 5;
    public static final int QUIZ_ANSWER_MIN = 0;
    public static final int QUIZ_ANSWER_MAX = 3;
    /** Raw score >= 11 is 70% of 15, the Advanced band. */
    public static final int QUIZ_ADVANCED_MIN = 11;
    public static final int QUIZ_INTERMEDIATE_MIN = 6;
    public static final int QUIZ_MAX_RAW_SCORE = 15;
    public static final int QUIZ_MAX_SCORE = QUIZ_MAX_RAW_SCORE;
    public static final int RECOMMEND_TOPIC_POINTS = 10;
    public static final int RECOMMEND_GOAL_POINTS = 2;
    public static final int RECOMMEND_COMMITMENT_POINTS = 1;
    public static final int BALANCE_TOLERANCE = 2;
    /** Penalty per same-skill pair inside a group. Matches groupingService.ts. */
    public static final int DIVERSITY_WEIGHT = 10;
    public static final int GROUPING_SWAP_GUARD = 500;
    public static final int MAX_RECOMMENDATIONS = 5;
    public static final int JWT_EXPIRATION_HOURS = 24;
    public static final int JWT_SECRET_MIN_LENGTH = 32;

    private AppConstants() {
    }
}
