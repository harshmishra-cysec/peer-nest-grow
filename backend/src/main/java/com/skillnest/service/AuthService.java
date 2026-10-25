package com.skillnest.service;

import com.skillnest.dto.AuthResponse;
import com.skillnest.dto.LoginRequest;
import com.skillnest.dto.RegisterRequest;
import com.skillnest.entity.Role;
import com.skillnest.entity.User;
import com.skillnest.exception.ConflictException;
import com.skillnest.exception.ResourceNotFoundException;
import com.skillnest.exception.UnauthorizedException;
import com.skillnest.repository.UserRepository;
import com.skillnest.security.JwtService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid credentials";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.LEARNER);
        user.setCurrentStreakDays(0);
        User saved = userRepository.save(user);
        return toAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException(INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException(INVALID_CREDENTIALS);
        }
        return toAuthResponse(user);
    }

    public AuthResponse me() {
        Long userId = currentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toAuthResponse(user);
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

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getRole());
        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
