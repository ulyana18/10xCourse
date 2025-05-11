-- Migration: Add rejected_count column to flashcard_generation_sessions
-- Description: Adds a column to track the number of rejected flashcards in each generation session
-- Tables affected: flashcard_generation_sessions
-- Author: AI Assistant
-- Date: 2025-05-11

-- Add rejected_count column with default value 0 to maintain data consistency for existing records
alter table flashcard_generation_sessions
    add column rejected_count integer not null default 0;

-- Add a check constraint to ensure rejected_count is non-negative
alter table flashcard_generation_sessions
    add constraint flashcard_generation_sessions_rejected_count_check
    check (rejected_count >= 0);

comment on column flashcard_generation_sessions.rejected_count is 'Number of flashcard suggestions that were rejected during the review process'; 