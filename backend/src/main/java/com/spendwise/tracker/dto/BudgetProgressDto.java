package com.spendwise.tracker.dto;

import com.spendwise.tracker.model.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetProgressDto {
    private Long id;
    private Category category;
    private String categoryDisplayName;
    private String categoryIcon;
    private BigDecimal monthlyLimit;
    private BigDecimal currentSpend;
    private BigDecimal remainingAmount;
    private Double percentageUsed;
    private String status; // NORMAL, WARNING (>80%), EXCEEDED (>100%)
    private String currency;
}
