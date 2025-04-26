-- Create table for tracking flashcard generation sessions
-- This table stores metadata about each AI-assisted flashcard generation session
create table flashcard_generation_sessions (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer not null,
    accepted_edited_count integer not null,
    source_text_hash text not null,
    source_text_length integer not null,
    generation_time timestamptz not null default now(),
    created_at timestamptz not null default now(),
    -- Ensure source text length is within acceptable bounds
    constraint source_text_length_check check (source_text_length >= 1000 and source_text_length <= 10000)
);

-- Create indexes for improved query performance
create index flashcard_generation_sessions_user_id_idx on flashcard_generation_sessions(user_id);
create index flashcard_generation_sessions_source_text_hash_idx on flashcard_generation_sessions(source_text_hash);

-- Enable Row Level Security
alter table flashcard_generation_sessions enable row level security;

-- Create RLS policies
-- Policy for authenticated users to select their own generation sessions
create policy "Users can view their own generation sessions"
    on flashcard_generation_sessions
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own generation sessions
create policy "Users can create their own generation sessions"
    on flashcard_generation_sessions
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own generation sessions
create policy "Users can update their own generation sessions"
    on flashcard_generation_sessions
    for update
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to delete their own generation sessions
create policy "Users can delete their own generation sessions"
    on flashcard_generation_sessions
    for delete
    to authenticated
    using (auth.uid() = user_id); 