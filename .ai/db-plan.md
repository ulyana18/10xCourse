# PostgreSQL Database Schema for 10x-cards Application

## 1. Tables and Columns

### 1.1 Users

This table is managed by Supabase Auth.

- **id**: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **email**: VARCHAR NOT NULL UNIQUE
- **encrypted_password**: VARCHAR NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **confirmed_at**: TIMESTAMPTZ

### 1.2 Flashcards
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE
- **generation_id**: BIGINT REFERENCES FlashcardGenerationSessions(id) ON DELETE SET NULL
- **front**: VARCHAR(200) NOT NULL
  - CHECK (char_length(front) <= 200)
- **back**: VARCHAR(500) NOT NULL
  - CHECK (char_length(back) <= 500)
- **source**: flashcard_source NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.3 FlashcardGenerationSessions
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE
- **model**: VARCHAR NOT NULL
- **generated_count**: INTEGER NOT NULL
- **accepted_unedited_count**: INTEGER NOT NULL
- **accepted_edited_count**: INTEGER NOT NULL
- **source_text_hash**: TEXT NOT NULL
- **source_text_length**: INTEGER NOT NULL
  - CHECK (source_text_length >= 1000 AND source_text_length <= 10000)
- **generation_time**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **rejected_count**: INTEGER NOT NULL

### 1.4 FlashcardGenerationErrorLogs
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE
- **model**: VARCHAR NOT NULL
- **source_text_hash**: TEXT NOT NULL
- **source_text_length**: INTEGER NOT NULL
  - CHECK (source_text_length >= 1000 AND source_text_length <= 10000)
- **error_code**: VARCHAR NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.5 FlashcardReviews
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE
- **flashcard_id**: BIGINT NOT NULL REFERENCES Flashcards(id) ON DELETE CASCADE
- **rating**: INTEGER NOT NULL
  - CHECK (rating >= 0 AND rating <= 5)
- **next_review_date**: TIMESTAMPTZ NOT NULL
- **ease_factor**: DECIMAL(4,2) NOT NULL DEFAULT 2.5
  - CHECK (ease_factor >= 1.3 AND ease_factor <= 5.0)
- **interval**: INTEGER NOT NULL DEFAULT 1
  - CHECK (interval >= 1)
- **review_count**: INTEGER NOT NULL DEFAULT 0
  - CHECK (review_count >= 0)
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- UNIQUE(user_id, flashcard_id)

## 2. Custom ENUM Types

### 2.1 flashcard_source
- Values: 'ai-full', 'ai-edited', 'manual'

## 3. Relationships

- One-to-Many: A user (Users) can have multiple flashcards (Flashcards).
- One-to-Many: A user (Users) can have multiple flashcard generation sessions (FlashcardGenerationSessions).
- One-to-Many: A user (Users) can have multiple flashcard generation error logs (FlashcardGenerationErrorLogs).
- One-to-Many: A user (Users) can have multiple flashcard reviews (FlashcardReviews).
- One-to-One: A flashcard (Flashcards) has one latest review (FlashcardReviews) per user.
- The column `generation_id` in Flashcards references FlashcardGenerationSessions(id) to link flashcards with their generation session.

## 4. Indexes

- Unique index on Users.email for fast lookup.
- Index on Flashcards.user_id to improve query performance.
- Index on FlashcardGenerationSessions.user_id and FlashcardGenerationSessions.source_text_hash.
- Index on FlashcardGenerationErrorLogs.user_id and FlashcardGenerationErrorLogs.source_text_hash.
- Index on FlashcardReviews(user_id, next_review_date) for efficient due card queries.
- Index on FlashcardReviews.flashcard_id for relationship lookups.

## 5. Row-Level Security (RLS)

- RLS policies should be enabled on all tables to restrict access so that authenticated users (via Supabase Auth) can only access records with their own user_id.

## 6. Additional Notes

- All TIMESTAMPTZ columns are stored in GMT and automatically set to the current time upon record creation (and update for Flashcards.updated_at).
- The schema follows 3NF to ensure data normalization while supporting efficient queries for the MVP.
- ON DELETE actions (CASCADE or SET NULL) are applied to maintain referential integrity. 