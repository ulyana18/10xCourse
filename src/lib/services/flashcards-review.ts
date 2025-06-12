import type { SupabaseClient } from '@/db/supabase.client';
import type { FlashcardReviewDTO } from '@/types';
import { calculateNextReview } from './spaced-repetition';

export class FlashcardReviewError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FlashcardReviewError';
  }
}

export async function submitFlashcardReview(
  supabase: SupabaseClient,
  userId: string,
  flashcardId: number,
  rating: number
): Promise<FlashcardReviewDTO> {
  try {
    // First, verify flashcard ownership
    const { data: flashcard, error: flashcardError } = await supabase
      .from('flashcards')
      .select('id')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .single();

    if (flashcardError || !flashcard) {
      throw new FlashcardReviewError(
        'Flashcard not found or access denied',
        'FLASHCARD_ACCESS_ERROR',
        { details: flashcardError }
      );
    }

    // Get the latest review for this flashcard if it exists
    const { data: latestReview } = await supabase
      .from('flashcard_reviews')
      .select('ease_factor, interval')
      .eq('flashcard_id', flashcardId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Calculate next review parameters
    const {
      easeFactor,
      interval,
      nextReviewDate,
    } = calculateNextReview(
      rating,
      latestReview?.ease_factor,
      latestReview?.interval
    );

    // Create new review record
    const { data: review, error: reviewError } = await supabase
      .from('flashcard_reviews')
      .insert({
        flashcard_id: flashcardId,
        user_id: userId,
        rating,
        ease_factor: easeFactor,
        interval,
        next_review_date: nextReviewDate.toISOString(),
      })
      .select()
      .single();

    if (reviewError || !review) {
      throw new FlashcardReviewError(
        'Failed to create review record',
        'REVIEW_CREATION_ERROR',
        { details: reviewError }
      );
    }

    return {
      id: review.id,
      flashcard_id: review.flashcard_id,
      rating: review.rating,
      next_review_date: review.next_review_date,
      ease_factor: review.ease_factor,
      interval: review.interval,
      review_count: review.review_count,
    };
  } catch (error) {
    if (error instanceof FlashcardReviewError) {
      throw error;
    }
    
    throw new FlashcardReviewError(
      'Failed to submit flashcard review',
      'REVIEW_ERROR',
      { originalError: error }
    );
  }
} 