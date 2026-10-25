package com.skillnest.controller;

import com.skillnest.dto.CircleDetailResponse;
import com.skillnest.dto.CircleSummaryResponse;
import com.skillnest.dto.CreateCircleRequest;
import com.skillnest.dto.JoinCircleRequest;
import com.skillnest.entity.CommitmentLevel;
import com.skillnest.entity.GoalType;
import com.skillnest.service.CircleService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/circles")
public class CircleController {

    private final CircleService circleService;

    public CircleController(CircleService circleService) {
        this.circleService = circleService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CircleDetailResponse create(@Valid @RequestBody CreateCircleRequest request) {
        return circleService.create(request);
    }

    @GetMapping
    public List<CircleSummaryResponse> list() {
        return circleService.listAll();
    }

    @GetMapping("/recommended")
    public List<CircleSummaryResponse> recommended(
            @RequestParam String topic,
            @RequestParam GoalType goalType,
            @RequestParam CommitmentLevel commitment
    ) {
        return circleService.recommended(topic, goalType, commitment);
    }

    @GetMapping("/mine")
    public List<CircleSummaryResponse> mine() {
        return circleService.mine();
    }

    @GetMapping("/{id}")
    public CircleDetailResponse getById(@PathVariable Long id) {
        return circleService.getById(id);
    }

    @PostMapping("/{id}/join")
    public CircleDetailResponse join(
            @PathVariable Long id,
            @Valid @RequestBody JoinCircleRequest request
    ) {
        return circleService.join(id, request);
    }
}
