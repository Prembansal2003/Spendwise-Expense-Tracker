package com.spendwise.tracker.repository;

import com.spendwise.tracker.model.Budget;
import com.spendwise.tracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(Long userId, Category category, Integer month, Integer year);
    List<Budget> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);
    Optional<Budget> findByCategoryAndMonthAndYear(Category category, Integer month, Integer year);
    List<Budget> findByMonthAndYear(Integer month, Integer year);
    void deleteByUserId(Long userId);
}
