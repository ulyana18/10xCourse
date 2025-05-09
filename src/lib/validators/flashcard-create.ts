import { z } from 'zod';

/**
 * Validation schema for creating a new flashcard manually.
 * Enforces length limits and required fields for flashcard content.
 * 
 * @remarks
 * - Front side is limited to 200 characters to ensure concise questions/prompts
 * - Back side is limited to 500 characters to allow for detailed explanations
 * - Both sides are required and cannot be empty strings
 */
export const createFlashcardSchema = z.object({
  front: z.string()
    .min(1, 'Front side text is required')
    .max(200, 'Front side text cannot exceed 200 characters'),
  back: z.string()
    .min(1, 'Back side text is required')
    .max(500, 'Back side text cannot exceed 500 characters')
});

export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>; 