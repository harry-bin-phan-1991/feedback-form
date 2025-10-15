***

# Feedback App

A simple full‑stack feedback application that allows users to submit feedback and view submitted entries.  
The app is built with **Spring Boot 3** on the backend and **React + TypeScript (Vite)** on the frontend.  
It includes validation, error handling, structured logging, and automated tests.

***

## Overview

### Features
- Submit feedback with name, email, and message  
- Validate input and return user‑friendly errors  
- Log requests and responses without exposing sensitive data  
- In‑memory database (H2) for easy testing  
- Includes frontend and backend unit tests  
- Optional bonus branch adds feedback listing with timestamps

### Tech Stack

**Backend:**
- Java 17 + Spring Boot 3
- Spring Web, JPA/Hibernate, Validation (Jakarta)
- H2 in‑memory database
- Maven 3.9+
- JUnit 5 and Mockito for testing

**Frontend:**
- React + TypeScript (Vite)
- React Hooks, form validation
- Axios for API calls
- React Testing Library + Vitest for testing
- Toast notifications for success/error messages

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

**Location:** `backend/`

### Key Components

- **Entity:** `Feedback` – represents a feedback record with `id`, `name`, `email`, `message`, `createdAt` (optional bonus).
- **DTOs:** `FeedbackRequest`, `FeedbackResponse`, `ErrorResponse` handle request/response payloads cleanly.
- **Service:** `FeedbackService` and `FeedbackServiceImpl` manage business logic and persistence.
- **Controller:** `FeedbackController` exposes REST endpoints using Spring MVC.
- **Repository:** `FeedbackRepository` extends `JpaRepository` for data access.
- **Exception Handling:** `GlobalExceptionHandler` captures validation and runtime errors.
- **Logging:** `RequestResponseLoggingFilter` logs all requests/responses at INFO or ERROR levels.
- **CORS Config:** `CorsConfig` enables development origins.

### API Summary

**POST /api/feedback**

- **Request:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Your platform looks great!"
  }
  ```

- **Response:**
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "message": "Your platform looks great!"
  }
  ```

Email is validated but never returned in responses or logs.

**Sample error (HTTP 400):**
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

***

### Database and Config

- Database: `H2` (in‑memory) – JDBC URL `jdbc:h2:mem:feedbackdb`  
- Console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)  
  - User: `sa`, no password  
- Hibernate DDL auto: `update`
- Logging and allowed origins configured in `application.yml`.

***

### Run Backend

```bash
mvn -f backend/pom.xml spring-boot:run
```

Backend runs at [http://localhost:8080](http://localhost:8080)

**Alternative (build JAR):**
```bash
mvn -f backend/pom.xml -DskipTests clean package
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

***

### Backend Tests

Run all backend tests:
```bash
mvn -f backend/pom.xml test
```

Tests include:
- `FeedbackControllerTest` – verifies endpoints and validation
- `FeedbackServiceImplTest` – checks business logic and persistence

***

## Frontend Implementation

**Location:** `frontend/`

The frontend provides a simple, responsive page for submitting feedback and displaying user messages.

### Main Parts

- `App.tsx` – main component rendering the form and toasts  
- `apiClient.ts` – handles backend calls using Axios  
- `FeedbackForm` – form handling with React Hooks and validation  
- Tests located in `src/__tests__/` for component and API coverage  

### Environment Variables

By default, the frontend connects to `http://localhost:8080`.  
You can override it with a `.env` file:
```
VITE_API_URL=http://localhost:8080
```

***

### Run Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

App starts at [http://localhost:5173](http://localhost:5173)

To build for production:
```bash
npm run build
npm run preview
```

***

### Frontend Tests

```bash
npm test
```

Runs using **Vitest + React Testing Library** with Jest‑DOM matchers loaded via `setupTests.ts`.

***

## End‑to‑End Local Run

1. Start backend (port 8080):  
   ```bash
   mvn -f backend/pom.xml spring-boot:run
   ```
2. Start frontend (port 5173):  
   ```bash
   cd frontend
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173)
4. Submit a feedback form.  
   - You should see a success toast and a 200 OK response.  
   - Request and response will appear in backend logs.

***

## Logging Behavior

- Every request and response logged at INFO with method, path, status, and duration.  
- Validation logs appear at INFO, errors at ERROR.  
- Sensitive data like email is never logged at INFO level.

***

## CORS Configuration

Allowed origin for local development: `http://localhost:5173`

You can override it via environment variable:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

If frontend can’t reach backend, check:
- CORS config values
- Console for preflight request logs

***

## Optional: Docker Backend

The backend can also run in Docker for convenience.

**Files:**
- `backend/Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

**Run with Docker:**
```bash
docker compose up -d --build backend
```

- Backend available at `http://localhost:8080`
- H2 Console: `http://localhost:8080/h2-console`
- Logs: `docker logs -f feedback-backend`
- Stop: `docker compose down`

***

## Bonus Branch: List Feedbacks

Branch: `feature/timestamps-and-get`

Adds:
- `createdAt` field in response  
- New endpoint `GET /api/feedback` (return all feedback with pagination)
- Updated tests

***

## Summary

**Backend:** Java 17 + Spring Boot 3, H2, REST API, DTO validation, structured logging, JUnit tests  
**Frontend:** React + TypeScript, Axios, form validation, toasts, Vitest tests  
**Focus Areas:** clean validation, testable architecture, clear logging, easy local setup  

***