package com.spendwise.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SavingsGoalRequest {
    private Long userId = 101L;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Target amount is required")
    private BigDecimal targetAmount;

    private BigDecimal savedAmount = BigDecimal.ZERO;
    private String currency = "USD";
}
