package com.spendwise.tracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.spendwise.tracker.model.Category;
import com.spendwise.tracker.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {

    private Long userId = 1L;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Category is required")
    private Category category;

    @NotNull(message = "Date is required")
    @JsonProperty("transactionDate")
    private LocalDate transactionDate;

    @JsonProperty("date")
    public void setDate(LocalDate date) {
        if (date != null) {
            this.transactionDate = date;
        }
    }

    private String paymentMethod;
    private String notes;
}
