import type { SupabaseClient } from '@/db/supabase.client';
import type { FlashcardReviewDTO, GetFlashcardReviewsParams, PaginatedResponse } from '@/types';
import { reviewsQuerySchema } from '@/lib/validators/flashcards-reviews';
import { z } from 'zod';

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

const reviewsParamsValidator = z.object({
  flashcardId: z.number().int().positive(),
  userId: z.string().uuid(),
  page: z.number().int().positive().optional().default(1),
  per_page: z.number().int().positive().min(1).max(100).optional().default(20)
});

export async function getFlashcardReviews(
  supabase: SupabaseClient,
  params: GetFlashcardReviewsParams
): Promise<PaginatedResponse<FlashcardReviewDTO>> {
  try {
    // Validate input parameters
    const validationResult = reviewsParamsValidator.safeParse(params);
    if (!validationResult.success) {
      throw new FlashcardReviewError(
        'Invalid input parameters',
        'VALIDATION_ERROR',
        { details: validationResult.error }
      );
    }

    const { flashcardId, userId, page, per_page } = validationResult.data;
    
    // Calculate offset for pagination
    const offset = (page - 1) * per_page;

    // First verify flashcard ownership
    const { data: flashcard, error: flashcardError } = await supabase
      .from('flashcards')
      .select('id')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .single();

    if (flashcardError) {
      throw new FlashcardReviewError(
        'Failed to verify flashcard ownership',
        'FLASHCARD_ACCESS_ERROR',
        { details: flashcardError }
      );
    }

    if (!flashcard) {
      throw new FlashcardReviewError(
        'Flashcard not found or access denied',
        'FLASHCARD_NOT_FOUND'
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('flashcard_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('flashcard_id', flashcardId);

    if (countError) {
      throw new FlashcardReviewError(
        'Failed to get reviews count',
        'REVIEWS_COUNT_ERROR',
        { details: countError }
      );
    }

    // Get paginated reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('flashcard_reviews')
      .select('*')
      .eq('flashcard_id', flashcardId)
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    if (reviewsError) {
      throw new FlashcardReviewError(
        'Failed to get reviews',
        'REVIEWS_FETCH_ERROR',
        { details: reviewsError }
      );
    }

    return {
      items: reviews as FlashcardReviewDTO[],
      total: count || 0,
      page,
      per_page
    };
  } catch (error) {
    if (error instanceof FlashcardReviewError) {
      throw error;
    }
    
    throw new FlashcardReviewError(
      'Failed to get flashcard reviews',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
} 