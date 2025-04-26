-- Create table for logging flashcard generation errors
-- This table stores error information when AI-assisted flashcard generation fails
create table flashcard_generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash text not null,
    source_text_length integer not null,
    error_code varchar not null,
    error_message text not null,
    created_at timestamptz not null default now(),
    -- Ensure source text length is within acceptable bounds
    constraint error_log_source_text_length_check check (source_text_length >= 1000 and source_text_length <= 10000)
);

-- Create indexes for improved query performance
create index flashcard_generation_error_logs_user_id_idx on flashcard_generation_error_logs(user_id);
create index flashcard_generation_error_logs_source_text_hash_idx on flashcard_generation_error_logs(source_text_hash);

-- Enable Row Level Security
alter table flashcard_generation_error_logs enable row level security;

-- Create RLS policies
-- Policy for authenticated users to select their own error logs
create policy "Users can view their own error logs"
    on flashcard_generation_error_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert error logs for their sessions
create policy "Users can create error logs for their sessions"
    on flashcard_generation_error_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own error logs
create policy "Users can delete their own error logs"
    on flashcard_generation_error_logs
    for delete
    to authenticated
    using (auth.uid() = user_id); 