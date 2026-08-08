package com.spendwise.tracker.controller;

import com.spendwise.tracker.dto.AuthRequest;
import com.spendwise.tracker.dto.AuthResponse;
import com.spendwise.tracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<AuthResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getProfile(id));
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<AuthResponse> updateProfile(@PathVariable Long id, @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.updateProfile(id, request));
    }

    @DeleteMapping("/demo/{id}")
    public ResponseEntity<?> clearDemoData(@PathVariable Long id) {
        authService.clearDemoData(id);
        return ResponseEntity.ok().build();
    }
}
