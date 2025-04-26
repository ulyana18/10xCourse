-- Drop all previously defined RLS policies
-- This migration removes the initial policies from flashcards, flashcard_generation_sessions,
-- and flashcard_generation_error_logs tables

-- Drop policies from flashcards table
drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can create their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;

-- Drop policies from flashcard_generation_sessions table
drop policy if exists "Users can view their own generation sessions" on flashcard_generation_sessions;
drop policy if exists "Users can create their own generation sessions" on flashcard_generation_sessions;
drop policy if exists "Users can update their own generation sessions" on flashcard_generation_sessions;
drop policy if exists "Users can delete their own generation sessions" on flashcard_generation_sessions;

-- Drop policies from flashcard_generation_error_logs table
drop policy if exists "Users can view their own error logs" on flashcard_generation_error_logs;
drop policy if exists "Users can create error logs for their sessions" on flashcard_generation_error_logs;
drop policy if exists "Users can delete their own error logs" on flashcard_generation_error_logs; 