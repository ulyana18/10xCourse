import type { SupabaseClient } from '@/db/supabase.client';
import type { CreateFlashcardCommand, FlashcardDTO } from '../../types';
import type { Database } from '../../db/database.types';

/**
 * Custom error class for flashcard creation failures.
 * Used to differentiate flashcard-specific errors from other runtime errors.
 */
export class FlashcardCreationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'FlashcardCreationError';
  }
}

/**
 * Creates a new flashcard in the database with manual source type.
 * 
 * @param supabase - Supabase client instance for database operations
 * @param command - Command object containing the flashcard content (front and back)
 * @param userId - ID of the user creating the flashcard
 * 
 * @returns Promise resolving to the created flashcard with metadata
 * 
 * @throws {FlashcardCreationError}
 * - When database operation fails
 * - When no data is returned after successful insert
 * 
 * @example
 * ```ts
 * const flashcard = await createFlashcard(supabase, {
 *   front: "What is TypeScript?",
 *   back: "A typed superset of JavaScript that compiles to plain JavaScript."
 * }, userId);
 * ```
 */
export async function createFlashcard(
  supabase: SupabaseClient,
  command: CreateFlashcardCommand,
  userId: string
): Promise<FlashcardDTO> {
  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      user_id: userId,
      front: command.front,
      back: command.back,
      source: 'manual'
    })
    .select()
    .single();

  if (error) {
    throw new FlashcardCreationError('Failed to create flashcard', error);
  }

  if (!data) {
    throw new FlashcardCreationError('No data returned after flashcard creation');
  }

  return {
    id: data.id,
    front: data.front,
    back: data.back,
    source: data.source,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
} 