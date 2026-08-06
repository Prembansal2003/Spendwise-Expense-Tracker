package com.spendwise.tracker.service;

import com.spendwise.tracker.dto.AuthRequest;
import com.spendwise.tracker.dto.AuthResponse;
import com.spendwise.tracker.model.User;
import com.spendwise.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check password matching (supports encoded or direct demo matching)
        boolean isMatch = com.spendwise.tracker.util.PasswordEncoderUtil.matches(request.getPassword(), user.getPassword())
                || user.getPassword().equals(request.getPassword());

        if (!isMatch) {
            throw new RuntimeException("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email address already registered");
        }

        User user = new User();
        user.setName(request.getName() != null && !request.getName().isBlank() ? request.getName() : "SpendWise Member");
        user.setEmail(request.getEmail());
        user.setPassword(com.spendwise.tracker.util.PasswordEncoderUtil.encode(request.getPassword()));
        user.setRole("PRO_MEMBER");
        user.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80");

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    public AuthResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = "sw_token_" + UUID.randomUUID().toString();
        String createdStr = user.getCreatedAt() != null ?
                user.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM yyyy")) : "Aug 2026";

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(createdStr)
                .build();
    }
}
