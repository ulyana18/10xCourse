-- Create flashcard_reviews table
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id BIGINT NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
    next_review_date TIMESTAMPTZ NOT NULL,
    ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.5 CHECK (ease_factor >= 1.3 AND ease_factor <= 5.0),
    interval INTEGER NOT NULL DEFAULT 1 CHECK (interval >= 1),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, flashcard_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user_next_review 
    ON public.flashcard_reviews(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_flashcard 
    ON public.flashcard_reviews(flashcard_id);

-- Add RLS policies
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

-- Policy for select: users can only view their own reviews
CREATE POLICY "Users can view own reviews" 
    ON public.flashcard_reviews
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy for insert: users can only insert their own reviews
CREATE POLICY "Users can insert own reviews" 
    ON public.flashcard_reviews
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy for update: users can only update their own reviews
CREATE POLICY "Users can update own reviews" 
    ON public.flashcard_reviews
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policy for delete: users can only delete their own reviews
CREATE POLICY "Users can delete own reviews" 
    ON public.flashcard_reviews
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flashcard_reviews_updated_at
    BEFORE UPDATE ON public.flashcard_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 