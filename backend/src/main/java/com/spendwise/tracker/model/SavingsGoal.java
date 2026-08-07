package com.spendwise.tracker.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "savings_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "target_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "saved_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal savedAmount = BigDecimal.ZERO;

    @Column(length = 20)
    private String currency = "USD";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
