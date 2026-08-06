package com.spendwise.tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpendWiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpendWiseApplication.class, args);
        System.out.println("\n==================================================");
        System.out.println("🚀 SpendWise Java Spring Boot Backend Server Started!");
        System.out.println("🌐 REST API Endpoint: http://localhost:8080/api/v1/transactions");
        System.out.println("🗄️ H2 Database Console: http://localhost:8080/h2-console");
        System.out.println("==================================================\n");
    }
}
