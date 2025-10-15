# syntax=docker/dockerfile:1

# Build stage: compile and package the Spring Boot app
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests clean package

# Runtime stage: run the packaged jar on JRE 17
FROM eclipse-temurin:17-jre
WORKDIR /app

# Environment variables (override via compose or docker run)
ENV SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-default}
ENV SERVER_PORT=${SERVER_PORT:-8080}
ENV CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-http://localhost:5173}
ENV JAVA_OPTS=${JAVA_OPTS:-}

# Copy built jar
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Run Spring Boot with optional JAVA_OPTS
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]