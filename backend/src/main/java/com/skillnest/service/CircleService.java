package com.skillnest.service;

import com.skillnest.constants.AppConstants;
import com.skillnest.dto.CircleDetailResponse;
import com.skillnest.dto.CircleMemberResponse;
import com.skillnest.dto.CircleSummaryResponse;
import com.skillnest.dto.CreateCircleRequest;
import com.skillnest.dto.JoinCircleRequest;
import com.skillnest.dto.QuizResult;
import com.skillnest.entity.Circle;
import com.skillnest.entity.CircleMember;
import com.skillnest.entity.CircleStatus;
import com.skillnest.entity.CommitmentLevel;
import com.skillnest.entity.GoalType;
import com.skillnest.entity.User;
import com.skillnest.exception.BadRequestException;
import com.skillnest.exception.ConflictException;
import com.skillnest.exception.ResourceNotFoundException;
import com.skillnest.exception.UnauthorizedException;
import com.skillnest.repository.CircleMemberRepository;
import com.skillnest.repository.CircleRepository;
import com.skillnest.repository.UserRepository;
import com.skillnest.repository.TaskRepository;
import com.skillnest.service.grouping.GroupingService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CircleService {

    private final CircleRepository circleRepository;
    private final CircleMemberRepository circleMemberRepository;
    private final UserRepository userRepository;
    private final QuizScoringService quizScoringService;
    private final GroupingService groupingService;
    private final TaskRepository taskRepository;

    public CircleService(
            CircleRepository circleRepository,
            CircleMemberRepository circleMemberRepository,
            UserRepository userRepository,
            QuizScoringService quizScoringService,
            GroupingService groupingService,
            TaskRepository taskRepository
    ) {
        this.circleRepository = circleRepository;
        this.circleMemberRepository = circleMemberRepository;
        this.userRepository = userRepository;
        this.quizScoringService = quizScoringService;
        this.groupingService = groupingService;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public CircleDetailResponse create(CreateCircleRequest request) {
        LocalDate today = LocalDate.now();
        if (request.deadline() == null || !request.deadline().isAfter(today)) {
            throw new BadRequestException("Deadline must be in the future");
        }

        int capacity = resolveCapacity(request.capacity());
        QuizResult quiz = quizScoringService.calculateAssessment(request.answers());
        User creator = currentUser();

        Circle circle = new Circle();
        circle.setName(request.name().trim());
        circle.setDescription(request.description());
        circle.setTopic(request.topic().trim());
        circle.setGoalType(request.goalType());
        circle.setCommitment(request.commitment());
        circle.setDeadline(request.deadline());
        circle.setStatus(CircleStatus.OPEN);
        circle.setCapacity(capacity);
        Circle saved = circleRepository.save(circle);

        addMember(saved, creator, quiz);
        return toDetail(saved);
    }

    @Transactional(readOnly = true)
    public List<CircleSummaryResponse> listAll() {
        List<Circle> circles = circleRepository.findAll();
        List<CircleSummaryResponse> summaries = new ArrayList<>();
        for (Circle circle : circles) {
            summaries.add(toSummary(circle));
        }
        return summaries;
    }

    @Transactional(readOnly = true)
    public CircleDetailResponse getById(Long id) {
        return toDetail(requireCircle(id));
    }

    @Transactional(readOnly = true)
    public List<CircleSummaryResponse> recommended(String topic, GoalType goalType, CommitmentLevel commitment) {
        List<Circle> circles = circleRepository.findRecommended(
                topic,
                goalType,
                commitment,
                LocalDate.now(),
                PageRequest.of(0, AppConstants.MAX_RECOMMENDATIONS)
        );
        List<CircleSummaryResponse> summaries = new ArrayList<>();
        for (Circle circle : circles) {
            summaries.add(toSummary(circle));
        }
        return summaries;
    }

    @Transactional
    public CircleDetailResponse join(Long circleId, JoinCircleRequest request) {
        Circle circle = circleRepository.findByIdForUpdate(circleId)
                .orElseThrow(() -> new ResourceNotFoundException("Circle not found"));

        if (circle.getStatus() != CircleStatus.OPEN) {
            throw new BadRequestException("Circle is not open for joining");
        }
        if (circle.getDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("Circle is expired");
        }

        User user = currentUser();
        if (circleMemberRepository.existsByCircleIdAndUserId(circle.getId(), user.getId())) {
            throw new ConflictException("Already a member of this circle");
        }

        if (circleMemberRepository.countByUserId(user.getId()) >= 3
                && taskRepository.countByAssigneeIdAndStatus(user.getId(), com.skillnest.entity.TaskStatus.VERIFIED) == 0) {
            throw new BadRequestException("Participation required: Complete and verify at least 1 task before joining additional circles.");
        }

        long memberCount = circleMemberRepository.countByCircleId(circle.getId());
        if (memberCount >= circle.getCapacity()) {
            throw new BadRequestException("Circle is full");
        }

        QuizResult quiz = quizScoringService.calculateAssessment(request.answers());
        addMember(circle, user, quiz);

        long updatedCount = circleMemberRepository.countByCircleId(circle.getId());
        if (updatedCount == circle.getCapacity()) {
            // The Circle row lock serializes final-slot joiners. The joining transaction
            // also contains the status change and every subgroup insert, so failures roll
            // back the join and cannot leave a partially formed circle.
            groupingService.formCircle(circle);
            circle.setStatus(CircleStatus.GROUPED);
        }

        return toDetail(circle);
    }

    @Transactional(readOnly = true)
    public List<CircleSummaryResponse> mine() {
        Long userId = currentUserId();
        List<CircleMember> memberships = circleMemberRepository.findByUserId(userId);
        List<CircleSummaryResponse> summaries = new ArrayList<>();
        for (CircleMember membership : memberships) {
            summaries.add(toSummary(membership.getCircle()));
        }
        return summaries;
    }

    private void addMember(Circle circle, User user, QuizResult quiz) {
        CircleMember member = new CircleMember();
        member.setCircle(circle);
        member.setUser(user);
        member.setAssessmentScore(quiz.rawScore());
        member.setSkillLevel(quiz.skillLevel());
        circleMemberRepository.save(member);
    }

    private int resolveCapacity(Integer capacity) {
        int value = capacity == null ? AppConstants.DEFAULT_CIRCLE_CAPACITY : capacity;
        if (value < AppConstants.MIN_CIRCLE_CAPACITY
                || value > AppConstants.MAX_CIRCLE_CAPACITY
                || value % AppConstants.SUB_GROUP_SIZE != 0) {
            throw new BadRequestException("Capacity must be a multiple of 3 between 9 and 30");
        }
        return value;
    }

    private Circle requireCircle(Long id) {
        return circleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Circle not found"));
    }

    private CircleSummaryResponse toSummary(Circle circle) {
        int memberCount = (int) circleMemberRepository.countByCircleId(circle.getId());
        return new CircleSummaryResponse(
                circle.getId(),
                circle.getName(),
                circle.getTopic(),
                circle.getGoalType(),
                circle.getCommitment(),
                circle.getDeadline(),
                circle.getStatus(),
                memberCount,
                circle.getCapacity()
        );
    }

    private CircleDetailResponse toDetail(Circle circle) {
        List<CircleMember> members = circleMemberRepository.findByCircleId(circle.getId());
        boolean revealSkill = circle.getStatus() == CircleStatus.GROUPED;
        List<CircleMemberResponse> memberResponses = new ArrayList<>();
        for (CircleMember member : members) {
            memberResponses.add(new CircleMemberResponse(
                    member.getUser().getId(),
                    member.getUser().getName(),
                    member.getJoinedAt(),
                    revealSkill ? member.getSkillLevel() : null,
                    revealSkill ? member.getAssessmentScore() : null
            ));
        }
        return new CircleDetailResponse(
                circle.getId(),
                circle.getName(),
                circle.getDescription(),
                circle.getTopic(),
                circle.getGoalType(),
                circle.getCommitment(),
                circle.getDeadline(),
                circle.getStatus(),
                memberResponses.size(),
                circle.getCapacity(),
                memberResponses
        );
    }

    private User currentUser() {
        return userRepository.findById(currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new UnauthorizedException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long id) {
            return id;
        }
        return Long.valueOf(principal.toString());
    }
}
