import type { SupabaseClient } from '@/db/supabase.client';
import type { ReviewFlashcardsCommand, ReviewFlashcardsResponse, FlashcardReview } from '@/types';

const BATCH_SIZE = 50; // Process 50 reviews at a time

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

type FlashcardInsert = {
  user_id: string;
  front: string;
  back: string;
  source: 'ai-full' | 'ai-edited';
  generation_id: number;
};

export async function reviewFlashcards(
  supabase: SupabaseClient,
  command: ReviewFlashcardsCommand,
  userId: string
): Promise<ReviewFlashcardsResponse> {
  console.log(`[FlashcardReview] Starting review process for generation ${command.generation_id} with ${command.reviews.length} reviews`);
  
  try {
    // Verify generation session exists and belongs to user
    console.log(`[FlashcardReview] Verifying generation session ${command.generation_id} for user ${userId}`);
    const { data: session, error: sessionError } = await supabase
      .from('flashcard_generation_sessions')
      .select('id')
      .eq('id', command.generation_id)
      .eq('user_id', userId)
      .single();

    if (sessionError) {
      console.error(`[FlashcardReview] Database error while verifying session:`, sessionError);
      throw new FlashcardReviewError(
        'Failed to verify generation session',
        'DATABASE_ERROR',
        { error: sessionError.message }
      );
    }

    if (!session) {
      console.warn(`[FlashcardReview] Session ${command.generation_id} not found for user ${userId}`);
      throw new FlashcardReviewError(
        'Generation session not found',
        'SESSION_NOT_FOUND'
      );
    }

    // Initialize counters
    const stats = {
      accepted: 0,
      rejected: 0,
      edited: 0
    };

    // Process reviews in batches
    const batches = [];
    for (let i = 0; i < command.reviews.length; i += BATCH_SIZE) {
      batches.push(command.reviews.slice(i, i + BATCH_SIZE));
    }

    console.log(`[FlashcardReview] Processing ${batches.length} batches of reviews`);
    for (const batch of batches) {
      const flashcardsToInsert: FlashcardInsert[] = [];

      for (const review of batch) {
        console.log(`[FlashcardReview] Processing review for suggestion ${review.suggestion_id}, action: ${review.action}`);
        
        switch (review.action) {
          case 'accept':
            flashcardsToInsert.push({
              user_id: userId,
              front: review.front as string,  // Safe cast since validation ensures it exists
              back: review.back as string,    // Safe cast since validation ensures it exists
              source: 'ai-full',
              generation_id: command.generation_id
            });
            stats.accepted++;
            break;

          case 'edit':
            flashcardsToInsert.push({
              user_id: userId,
              front: review.front as string,  // Safe cast since validation ensures it exists
              back: review.back as string,    // Safe cast since validation ensures it exists
              source: 'ai-edited',
              generation_id: command.generation_id
            });
            stats.edited++;
            break;

          case 'reject':
            console.log(`[FlashcardReview] Marked suggestion ${review.suggestion_id} as rejected`);
            stats.rejected++;
            break;
        }
      }

      // Insert batch of flashcards
      if (flashcardsToInsert.length > 0) {
        console.log(`[FlashcardReview] Inserting batch of ${flashcardsToInsert.length} flashcards`);
        const { error: insertError } = await supabase
          .from('flashcards')
          .insert(flashcardsToInsert);

        if (insertError) {
          console.error(`[FlashcardReview] Error saving flashcards batch:`, insertError);
          throw new FlashcardReviewError(
            'Failed to save flashcards batch',
            'INSERT_ERROR',
            { error: insertError.message }
          );
        }
      }
    }

    // Update session statistics
    console.log(`[FlashcardReview] Updating session statistics for generation ${command.generation_id}`, stats);
    const { error: updateError } = await supabase
      .from('flashcard_generation_sessions')
      .update({
        accepted_unedited_count: stats.accepted,
        accepted_edited_count: stats.edited,
        rejected_count: stats.rejected
      })
      .eq('id', command.generation_id);

    if (updateError) {
      console.error(`[FlashcardReview] Error updating session statistics:`, updateError);
      throw new FlashcardReviewError(
        'Failed to update session statistics',
        'UPDATE_ERROR',
        { error: updateError.message }
      );
    }

    console.log(`[FlashcardReview] Successfully completed review process for generation ${command.generation_id}`);
    return stats;
  } catch (error) {
    if (error instanceof FlashcardReviewError) {
      throw error;
    }
    console.error(`[FlashcardReview] Unexpected error during review process:`, error);
    throw new FlashcardReviewError(
      'An unexpected error occurred',
      'INTERNAL_ERROR',
      { message: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
} 