package com.spendwise.tracker.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class AuthRequest {
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    private String password;

    private String avatarUrl;
}
