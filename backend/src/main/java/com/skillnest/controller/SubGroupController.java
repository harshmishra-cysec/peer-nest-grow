package com.skillnest.controller;

import com.skillnest.dto.SubGroupResponse;
import com.skillnest.exception.UnauthorizedException;
import com.skillnest.service.grouping.GroupingService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/circles/{circleId}")
public class SubGroupController {
    private final GroupingService groupingService;

    public SubGroupController(GroupingService groupingService) { this.groupingService = groupingService; }

    @GetMapping("/subgroups")
    public List<SubGroupResponse> getSubgroups(@PathVariable Long circleId) {
        return groupingService.getForCircle(circleId);
    }

    @GetMapping("/my-subgroup")
    public SubGroupResponse getMySubgroup(@PathVariable Long circleId, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) throw new UnauthorizedException("Authentication required");
        Object principal = authentication.getPrincipal();
        Long userId = principal instanceof Long id ? id : Long.valueOf(principal.toString());
        return groupingService.getMySubgroup(circleId, userId);
    }
}
