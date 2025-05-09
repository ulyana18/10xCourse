import type { SupabaseClient } from '@/db/supabase.client';
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponse, FlashcardSuggestion } from '@/types';
import type { Database } from '@/db/database.types';

export class FlashcardGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FlashcardGenerationError';
  }
}

async function logGenerationError(
  supabase: SupabaseClient,
  error: Error,
  command: GenerateFlashcardsCommand,
  userId: string
): Promise<void> {
  try {
    await supabase
      .from('flashcard_generation_error_logs')
      .insert({
        user_id: userId,
        model: command.model,
        source_text_hash: Buffer.from(command.source_text).toString('base64'),
        source_text_length: command.source_text.length,
        error_code: error instanceof FlashcardGenerationError ? error.code : 'UNKNOWN_ERROR',
        error_message: error.message
      });
  } catch (logError) {
    console.error('Failed to log generation error:', logError);
  }
}

export async function generateFlashcards(
  supabase: SupabaseClient,
  command: GenerateFlashcardsCommand,
  userId: string
): Promise<GenerateFlashcardsResponse> {
  try {
    // 1. Create generation session
    const { data: session, error: sessionError } = await supabase
      .from('flashcard_generation_sessions')
      .insert({
        user_id: userId,
        model: command.model,
        source_text_length: command.source_text.length,
        generated_count: 0,
        accepted_edited_count: 0,
        accepted_unedited_count: 0,
        source_text_hash: Buffer.from(command.source_text).toString('base64')
      })
      .select()
      .single();

    if (sessionError || !session) {
      throw new FlashcardGenerationError(
        'Failed to create generation session',
        'SESSION_CREATION_ERROR',
        { details: sessionError }
      );
    }

    // Mock suggestions for testing
    const mockSuggestions: FlashcardSuggestion[] = [
      {
        id: 1,
        front: 'What is the capital of France?',
        back: 'Paris'
      },
      {
        id: 2,
        front: 'What is the largest planet in our solar system?',
        back: 'Jupiter'
      },
      {
        id: 3,
        front: 'Who wrote "Romeo and Juliet"?',
        back: 'William Shakespeare'
      }
    ];
    
    // Update session with generated count
    const { error: updateError } = await supabase
      .from('flashcard_generation_sessions')
      .update({ 
        generated_count: mockSuggestions.length,
        generation_time: new Date().toISOString()
      })
      .eq('id', session.id);

    if (updateError) {
      await logGenerationError(supabase, new Error('Failed to update session'), command, userId);
      throw new FlashcardGenerationError(
        'Failed to update generation session',
        'SESSION_UPDATE_ERROR',
        { details: updateError }
      );
    }
    
    return {
      generation_id: session.id,
      suggestions: mockSuggestions
    };
  } catch (error) {
    await logGenerationError(supabase, error as Error, command, userId);
    
    if (error instanceof FlashcardGenerationError) {
      throw error;
    }
    
    throw new FlashcardGenerationError(
      'Failed to generate flashcards',
      'GENERATION_ERROR',
      { originalError: error }
    );
  }
} 