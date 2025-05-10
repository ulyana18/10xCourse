import type { SupabaseClient } from '@/db/supabase.client';
import type { FlashcardDTO, UpdateFlashcardCommand } from '@/types';

export class FlashcardUpdateError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'FlashcardUpdateError';
  }
}

export async function updateFlashcard(
  supabase: SupabaseClient,
  flashcardId: number,
  userId: string,
  command: UpdateFlashcardCommand
): Promise<FlashcardDTO> {
  // Verify flashcard existence and ownership
  const { data: existingFlashcard, error: fetchError } = await supabase
    .from('flashcards')
    .select('id, user_id')
    .eq('id', flashcardId)
    .single();

  if (fetchError) {
    throw new FlashcardUpdateError(
      'Failed to fetch flashcard',
      'FETCH_ERROR',
      500
    );
  }

  if (!existingFlashcard) {
    throw new FlashcardUpdateError(
      'Flashcard not found',
      'NOT_FOUND',
      404
    );
  }

  if (existingFlashcard.user_id !== userId) {
    throw new FlashcardUpdateError(
      'You do not have permission to update this flashcard',
      'UNAUTHORIZED',
      401
    );
  }

  // Update flashcard
  const { data: updatedFlashcard, error: updateError } = await supabase
    .from('flashcards')
    .update({
      ...(command.front && { front: command.front }),
      ...(command.back && { back: command.back }),
      updated_at: new Date().toISOString()
    })
    .eq('id', flashcardId)
    .select('id, front, back, source, created_at, updated_at')
    .single();

  if (updateError) {
    throw new FlashcardUpdateError(
      'Failed to update flashcard',
      'UPDATE_ERROR',
      500
    );
  }

  return updatedFlashcard;
} 