package com.skillnest.controller;

import com.skillnest.dto.EarnedBadgeResponse;
import com.skillnest.exception.UnauthorizedException;
import com.skillnest.service.BadgeService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
public class UserController {
    private final BadgeService badges;

    public UserController(BadgeService badges) { this.badges = badges; }

    @GetMapping("/badges")
    public List<EarnedBadgeResponse> badges(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new UnauthorizedException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        Long userId = principal instanceof Long id ? id : Long.valueOf(principal.toString());
        return badges.getEarnedBadges(userId);
    }
}
