package com.spendwise.tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "budgets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "category", "month", "year"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId = 1L;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @NotNull(message = "Monthly limit is required")
    @DecimalMin(value = "0.00", message = "Monthly limit cannot be negative")
    @Column(name = "monthly_limit", nullable = false, precision = 19, scale = 6)
    private BigDecimal monthlyLimit;

    @Column(name = "current_spend", precision = 19, scale = 6)
    private BigDecimal currentSpend = BigDecimal.ZERO;

    @Column(length = 3)
    private String currency = "USD";

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;
}
