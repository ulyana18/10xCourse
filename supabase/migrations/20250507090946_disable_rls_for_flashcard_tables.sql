-- Migration: Disable RLS for flashcard-related tables
-- Description: This migration disables Row Level Security (RLS) for tables related to flashcard generation
-- and error logging as they no longer require row-level access control.
--
-- Tables affected:
--   - flashcards
--   - flashcard_generation_sessions
--   - flashcard_generation_error_logs
--
-- Note: This is a security-related change. Ensure that application-level security
-- measures are in place before deploying this migration.

-- Disable RLS for flashcards table
alter table flashcards disable row level security;

-- Disable RLS for flashcard generation sessions table
alter table flashcard_generation_sessions disable row level security;

-- Disable RLS for flashcard generation error logs table
alter table flashcard_generation_error_logs disable row level security; 