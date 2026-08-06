# Multi-stage Dockerfile for SpendWise Java Backend (Root Context)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy backend pom.xml and src
COPY backend/pom.xml ./
COPY backend/src ./src

# Build production JAR
RUN mvn clean package -DskipTests

# Stage 2: Runtime container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy exact Spring Boot executable JAR
COPY --from=build /app/target/expense-tracker-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
