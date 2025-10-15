***

# Delivery Notes — get‑feedback‑list‑and‑add‑timestamps

Branch: `get-feedback-list-and-add-timestamps`

This branch extends the Feedback App by adding **timestamps** to all feedback entries and introducing a **GET** endpoint for listing feedback in reverse chronological order.  
Both backend and frontend code have been updated and covered with automated tests.

***

## Backend (Java + Spring Boot)

### Overview

The backend now supports listing feedback records along with their creation timestamps using the existing H2 in‑memory database.  
Enhancements include endpoint additions, response DTO updates, and expanded test coverage.

### Key Changes

- The `Feedback` entity already contained a `createdAt` field annotated with `@CreationTimestamp`.  
- Extended `FeedbackResponse` DTO to return `createdAt` in responses.  
- Implemented a new service method to fetch feedback sorted by `createdAt` descending.  
- Added a new REST endpoint `GET /api/feedback` for listing feedback.  
- Updated controller and service tests to verify ordering, timestamp presence, and validation behavior.

### API Endpoints

#### POST /api/feedback
Create a new feedback entry.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your platform looks great!"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "message": "Your platform looks great!",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

Email is validated but not returned for privacy.

***

#### GET /api/feedback
Retrieve all feedback entries sorted by newest first (paginated).

**Response:**
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

Pagination is handled on the backend and returned as part of the response body.

***

### How to Run the Backend

From the `backend` folder:

Run tests:
```bash
mvn test
```

Start the application:
```bash
mvn spring-boot:run
```

Backend will be available at [http://localhost:8080](http://localhost:8080)

***

### Backend Tests

**Coverage includes:**
- **Service layer:**
  - `create()` excludes email from responses but includes `createdAt`
  - `list()` returns items sorted correctly by timestamp  
- **Controller layer:**
  - `POST /api/feedback` → returns 200 OK + valid timestamp  
  - `POST /api/feedback` → returns 400 Bad Request with structured validation errors  
  - `GET /api/feedback` → returns items sorted by `createdAt` and verified by test assertions  

All tests pass using H2’s in‑memory database.

***

## Frontend (React + TypeScript)

### Overview

The React frontend has been extended to support listing submitted feedback, displaying timestamps, and enabling pagination.  
New API helpers and UI components were added with proper error handling and associated test coverage.

### Key Changes

- Extended `FeedbackResponse` type with `createdAt: string`.
- Added `getFeedbacksPage(page, size)` for paginated retrieval via `GET /api/feedback`.
- Added convenience helper `getFeedbacks()` to return the first page.
- Created `FeedbackList` component with:
  - “Load more” pagination  
  - Dedicated refresh button  
  - Timestamps displayed per entry
- Integrated `FeedbackList` below the form in `App.tsx`.
- Improved error handling using a shared `handleError()` utility.

***

### How to Run the Frontend

From the `frontend` folder:

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm run dev
```

By default, the app runs at [http://localhost:5173](http://localhost:5173)

If your backend runs on a different URL, set the env var:
```
VITE_API_URL=http://localhost:8080
```

***

### Frontend Tests

- **apiClient.test.ts**
  - Validates `submitFeedback()` for 200 OK, 400 error, and 500 fallback.  
  - Validates `getFeedbacks()` returns correct list data and handles server errors.  
- **FeedbackForm.test.tsx**
  - Displays success toast after successful submission.  
  - Shows error toast with validation details on 400.  
- **FeedbackList.test.tsx**
  - Ensures feedback list renders correctly with timestamps.  
  - Tests error state rendering on failed load.  
  - Verifies “no feedback yet” empty state behavior.

All tests pass successfully with Vitest and React Testing Library.

***

## Notes

- Requests and responses are logged at appropriate log levels through the logging filter; sensitive fields like email are omitted.  
- H2 in‑memory database persists only for the app’s session and resets on restart.  
- CORS is configured for `http://localhost:5173` to enable frontend‑backend communication during development.  
- The frontend API client normalizes both array and paginated responses, making it compatible with current and potential future changes in the backend payload format.

***

## Summary

- Added `createdAt` timestamps to feedback entities and responses  
- Implemented `GET /api/feedback` endpoint with pagination and sorting  
- Extended backend and frontend tests to cover new functionality  
- Fully automated test suite passing  
- Improved user experience by displaying submitted feedback with timestamps  

***
