***

# Feedback App

A small full‑stack app for submitting feedback and viewing submitted entries.  
Built with **Spring Boot 3** (backend) and **React + TypeScript (Vite)** (frontend).  
Includes validation, error handling, structured logging, and automated tests.

***

## Overview

### Features
- Submit feedback with name, email, and message  
- Validate input with clear, user‑friendly error messages  
- Log requests/responses without exposing sensitive data  
- Use H2 in‑memory DB for fast local dev  
- Unit tests for both backend and frontend  
- List feedback with timestamps and pagination via `GET /api/feedback`

### Tech Stack

**Backend:**
- Java 17, Spring Boot 3  
- Spring Web, JPA/Hibernate, Jakarta Validation  
- H2 in‑memory database  
- Maven 3.9+  
- JUnit 5, Mockito

**Frontend:**
- React + TypeScript (Vite)  
- React Hooks, form validation  
- Axios for HTTP  
- React Testing Library + Vitest  
- Toasts for success/error

***

## Project Structure

```
feedback-app/
├── backend/
│   ├── src/main/java/com/example/feedback/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── service/
│   │   └── BackendApplication.java
│   ├── src/test/java/com/example/feedback/
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── __tests__/
    │   ├── components/
    │   ├── apiClient.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── vite.config.ts
    ├── package.json
    └── tsconfig.json
```

***

## Backend Implementation

Location: `backend/`

### Key Components
- Entity: `Feedback` — `id`, `name`, `email`, `message`, `createdAt` (via `@CreationTimestamp`)  
- DTOs: `FeedbackRequest`, `FeedbackResponse`, `ErrorResponse`  
- Service: `FeedbackService`, `FeedbackServiceImpl`  
- Controller: `FeedbackController` (Spring MVC)  
- Repository: `FeedbackRepository` (`JpaRepository`)  
- Exceptions: `GlobalExceptionHandler` (validation/runtime)  
- Logging: `RequestResponseLoggingFilter` (INFO/ERROR, no sensitive data)  
- CORS: `CorsConfig` (dev origin)

### API Summary

POST `/api/feedback`
- Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your platform looks great!"
}
```
- Response:
```json
{
  "id": 1,
  "name": "John Doe",
  "message": "Your platform looks great!"
}
```
- Notes: Email is validated but not returned or logged.

Sample 400:
```json
{
  "status": 400,
  "message": "Validation error",
  "details": [
    "name must not be blank",
    "email must be a well-formed email address"
  ]
}
```

GET `/api/feedback?page={page}&size={size}`
- Response (paginated; newest first by `createdAt`):
```json
{
  "items": [
    { "id": 2, "name": "Alice", "message": "Hi", "createdAt": "2024-02-01T00:00:00Z" },
    { "id": 1, "name": "Bob", "message": "Hello", "createdAt": "2024-01-01T00:00:00Z" }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "hasNext": false
}
```
The frontend client also normalizes a bare array into this shape for resilience.

***

### Database and Config
- DB: H2 (in‑memory), JDBC `jdbc:h2:mem:feedbackdb`  
- Console: `http://localhost:8080/h2-console` (user `sa`, no password)  
- Hibernate DDL auto: `update`  
- Logging/CORS via `application.yml`

***

### Run Backend
```bash
mvn -f backend/pom.xml spring-boot:run
```
Runs at `http://localhost:8080`.

Alternative (JAR):
```bash
mvn -f backend/pom.xml -DskipTests clean package
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

***

### Backend Tests
```bash
mvn -f backend/pom.xml test
```
- `FeedbackControllerTest` — endpoints + validation  
- `FeedbackServiceImplTest` — business logic + persistence

***

## Frontend Implementation

Location: `frontend/`

The UI provides a simple form for submissions and a list view with timestamps and pagination.

### Main Parts
- `App.tsx` — form + toasts + feedback list  
- `apiClient.ts` — Axios calls, error normalization  
- `FeedbackForm` — hooks‑based validation + submit handling  
- `FeedbackList` — paginated list, “Load more”, refresh, timestamps  
- Tests under `src/__tests__/`

### Environment Variables
Default backend: `http://localhost:8080`  
Override via `.env`:
```
VITE_API_URL=http://localhost:8080
```

***

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.

Build/preview:
```bash
npm run build
npm run preview
```

***

### Frontend Tests
```bash
npm test
```
- Vitest + React Testing Library  
- Jest‑DOM matchers loaded via `setupTests.ts`

***

## End‑to‑End Local Run
1. Start backend:
```bash
mvn -f backend/pom.xml spring-boot:run
```
2. Start frontend:
```bash
cd frontend
npm run dev
```
3. Open `http://localhost:5173`, submit the form  
   - Expect 200 OK + success toast  
   - Backend logs show the request/response at INFO

***

## Logging Behavior
- INFO: method, path, status, duration  
- ERROR: unexpected exceptions  
- Email and other sensitive fields not logged at INFO

***

## CORS Configuration
- Allowed origin (dev): `http://localhost:5173`  
- Override:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173
```
If requests fail, check CORS values and preflight logs.

***

## Optional: Docker Backend

Files:
- `backend/Dockerfile`  
- `docker-compose.yml`  
- `.dockerignore`

Run:
```bash
docker compose up -d --build backend
```
- Backend: `http://localhost:8080`  
- H2 Console: `http://localhost:8080/h2-console`  
- Logs: `docker logs -f feedback-backend`  
- Stop: `docker compose down`

***

## Bonus Branch: List Feedbacks
Branch: `get-feedback-list-and-add-timestamps`
- Adds `createdAt` to responses  
- Implements `GET /api/feedback` with pagination  
- Updates backend/frontend tests

***

## Summary
- Backend: Java 17, Spring Boot 3, H2, REST API, DTO validation, structured logging, JUnit tests  
- Frontend: React + TypeScript, Axios, validation, toasts, Vitest  
- Focus: clean validation, testable architecture, clear logging, easy local setup