-- Create table for storing flashcards
-- This table stores the actual flashcard content with front and back sides
create table flashcards (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_id bigint references flashcard_generation_sessions(id) on delete set null,
    front varchar(200) not null,
    back varchar(500) not null,
    source flashcard_source not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- Ensure content length constraints
    constraint front_length_check check (char_length(front) <= 200),
    constraint back_length_check check (char_length(back) <= 500)
);

-- Create index for improved query performance
create index flashcards_user_id_idx on flashcards(user_id);

-- Create trigger to automatically update updated_at timestamp
create or replace function update_flashcard_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_flashcard_timestamp
    before update on flashcards
    for each row
    execute function update_flashcard_updated_at();

-- Enable Row Level Security
alter table flashcards enable row level security;

-- Create RLS policies
-- Policy for authenticated users to select their own flashcards
create policy "Users can view their own flashcards"
    on flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own flashcards
create policy "Users can create their own flashcards"
    on flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own flashcards
create policy "Users can update their own flashcards"
    on flashcards
    for update
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to delete their own flashcards
create policy "Users can delete their own flashcards"
    on flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id); 