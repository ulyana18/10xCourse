# REST API Plan

## 1. Resources

### 1.1 Users
- Maps to Supabase Auth Users table
- Handles user registration and authentication
- Stores user profile information

### 1.2 Flashcards
- Maps to Flashcards table
- Stores individual flashcard data
- Links to generation sessions and users

### 1.3 Generation Sessions
- Maps to FlashcardGenerationSessions table
- Tracks AI generation metadata and statistics
- Links generated flashcards to their source session

### 1.4 Generation Error Logs
- Maps to FlashcardGenerationErrorLogs table
- Tracks errors during flashcard generation
- Stores error details and metadata for debugging and monitoring

### 1.5 Flashcard Reviews
- Maps to FlashcardReviews table
- Stores spaced repetition data for each flashcard
- Tracks review history and scheduling information

## 2. Endpoints

### 2.2 Flashcard Generation

#### Generate Flashcards
- Method: POST
- Path: `/api/flashcards/generate`
- Description: Generate flashcard suggestions from text
- Request Body:
```json
{
  "source_text": "string",
  "model": "string"
}
```
- Validation:
  - source_text: 1,000-10,000 characters
- Response: 201 Created
```json
{
  "generation_id": "number",
  "suggestions": [
    {
      "id": "number",
      "front": "string",
      "back": "string"
    }
  ]
}
```
- Errors:
  - 400: Invalid text length
  - 422: Generation failed
  - 429: Rate limit exceeded

#### Review Generated Flashcards
- Method: POST
- Path: `/api/flashcards/review`
- Description: Accept/reject/edit generated flashcards
- Request Body:
```json
{
  "generation_id": "number",
  "reviews": [
    {
      "suggestion_id": "number",
      "action": "accept|reject|edit",
      "front": "string",
      "back": "string"
    }
  ]
}
```
- Response: 200 OK
```json
{
  "accepted": "number",
  "rejected": "number",
  "edited": "number"
}
```
- Errors:
  - 404: Generation not found
  - 400: Invalid review data

### 2.3 Flashcard Management

#### Create Flashcard
- Method: POST
- Path: `/api/flashcards`
- Description: Manually create a flashcard
- Request Body:
```json
{
  "front": "string",
  "back": "string"
}
```
- Validation:
  - front: max 200 characters
  - back: max 500 characters
- Response: 201 Created
```json
{
  "id": "number",
  "front": "string",
  "back": "string",
  "created_at": "timestamp"
}
```
- Errors:
  - 400: Invalid flashcard data

#### List Flashcards
- Method: GET
- Path: `/api/flashcards`
- Description: Get user's flashcards with pagination
- Query Parameters:
  - page: number (default: 1)
  - per_page: number (default: 20)
  - source: string (ai-full|ai-edited|manual)
  - sort: string (created_at|updated_at)
  - order: string (asc|desc)
- Response: 200 OK
```json
{
  "items": [
    {
      "id": "number",
      "front": "string",
      "back": "string",
      "source": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "total": "number",
  "page": "number",
  "per_page": "number"
}
```

#### Update Flashcard
- Method: PUT
- Path: `/api/flashcards/{id}`
- Description: Update existing flashcard
- Request Body:
```json
{
  "front": "string",
  "back": "string"
}
```
- Validation:
  - front: max 200 characters
  - back: max 500 characters
- Response: 200 OK
```json
{
  "id": "number",
  "front": "string",
  "back": "string",
  "updated_at": "timestamp"
}
```
- Errors:
  - 404: Flashcard not found
  - 400: Invalid flashcard data

#### Delete Flashcard
- Method: DELETE
- Path: `/api/flashcards/{id}`
- Description: Delete a flashcard
- Response: 204 No Content
- Errors:
  - 404: Flashcard not found

### 2.4 Flashcard Reviews

#### Get Due Flashcards
- Method: GET
- Path: `/api/flashcards/due`
- Description: Get flashcards due for review with pagination
- Query Parameters:
  - page: number (default: 1)
  - per_page: number (default: 20)
  - before_date: string (ISO date, optional)
- Response: 200 OK
```json
{
  "items": [
    {
      "id": "number",
      "front": "string",
      "back": "string",
      "source": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "latest_review": {
        "id": "number",
        "flashcard_id": "number",
        "rating": "number",
        "next_review_date": "timestamp",
        "ease_factor": "number",
        "interval": "number",
        "review_count": "number"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "per_page": "number"
}
```
- Errors:
  - 400: Invalid query parameters

#### Submit Review
- Method: POST
- Path: `/api/flashcards/{id}/review`
- Description: Submit a review for a flashcard
- Request Body:
```json
{
  "rating": "number" // 0-5
}
```
- Validation:
  - rating: 0-5 range
- Response: 200 OK
```json
{
  "id": "number",
  "flashcard_id": "number",
  "rating": "number",
  "next_review_date": "timestamp",
  "ease_factor": "number",
  "interval": "number",
  "review_count": "number"
}
```
- Errors:
  - 404: Flashcard not found
  - 400: Invalid rating

#### Get Review History
- Method: GET
- Path: `/api/flashcards/{id}/reviews`
- Description: Get review history for a flashcard
- Query Parameters:
  - page: number (default: 1)
  - per_page: number (default: 20)
- Response: 200 OK
```json
{
  "items": [
    {
      "id": "number",
      "flashcard_id": "number",
      "rating": "number",
      "next_review_date": "timestamp",
      "ease_factor": "number",
      "interval": "number",
      "review_count": "number",
      "created_at": "timestamp"
    }
  ],
  "total": "number",
  "page": "number",
  "per_page": "number"
}
```
- Errors:
  - 404: Flashcard not found

### 2.5 Statistics

#### Generation Statistics
- Method: GET
- Path: `/api/statistics/generation`
- Description: Get flashcard generation statistics
- Response: 200 OK
```json
{
  "total_generated": "number",
  "accepted_unedited": "number",
  "accepted_edited": "number",
  "rejected": "number"
}
```

#### List Generation Errors
- Method: GET
- Path: `/api/statistics/generation/errors`
- Description: Get flashcard generation error logs with pagination
- Query Parameters:
  - page: number (default: 1)
  - per_page: number (default: 20)
  - start_date: string (ISO date)
  - end_date: string (ISO date)
  - error_code: string
- Response: 200 OK
```json
{
  "items": [
    {
      "id": "number",
      "model": "string",
      "source_text_hash": "string",
      "source_text_length": "number",
      "error_code": "string",
      "error_message": "string",
      "created_at": "timestamp"
    }
  ],
  "total": "number",
  "page": "number",
  "per_page": "number"
}
```

## 3. Authentication and Authorization

### 3.1 Authentication
- Uses Supabase Auth for user authentication
- JWT-based authentication
- Tokens provided in Authorization header
- Format: `Authorization: Bearer <token>`

### 3.2 Authorization
- Row Level Security (RLS) implemented at database level
- Each endpoint verifies user ownership of resources
- Users can only access their own data
- GDPR compliance:
  - Users can request data export
  - Users can request account deletion

## 4. Validation and Business Logic

### 4.1 Input Validation
- Text generation:
  - Min length: 1,000 characters
  - Max length: 10,000 characters
- Flashcards:
  - Front: max 200 characters
  - Back: max 500 characters
- Study session:
  - Rating: 0-5 range
- Reviews:
  - Rating: 0-5 range
  - Ease factor: 1.3-5.0 range
  - Interval: minimum 1

### 4.2 Rate Limiting
- Generation endpoints: 10 requests per hour
- Review endpoints: 100 requests per minute
- Other endpoints: 100 requests per minute

### 4.3 Error Handling
- Standardized error response format:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### 4.4 Business Logic Implementation
- SuperMemo 2 spaced repetition algorithm for review scheduling
- Generation statistics tracked automatically
- Automatic validation of user ownership
- GDPR compliance built into authentication endpoints 