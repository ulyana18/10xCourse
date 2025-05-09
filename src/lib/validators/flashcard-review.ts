import { z } from 'zod';
import type { FlashcardReviewAction, ReviewFlashcardsCommand } from '@/types';

// Validation schema for a single flashcard review
export const flashcardReviewSchema = z.object({
  suggestion_id: z.number().int().positive(),
  action: z.enum(['accept', 'reject', 'edit'] as const satisfies readonly FlashcardReviewAction[]),
  front: z.string().max(200),
  back: z.string().max(500)
});

// Validation schema for the entire review command
export const reviewFlashcardsSchema = z.object({
  generation_id: z.number().int().positive(),
  reviews: z.array(flashcardReviewSchema)
    .min(1, { message: "At least one review is required" })
    .max(100, { message: "Maximum 100 reviews allowed per request" })
});

export type ValidationError = {
  path: string[];
  message: string;
};

export function validateReviewCommand(command: unknown): { success: true; data: ReviewFlashcardsCommand } | { success: false; errors: ValidationError[] } {
  const result = reviewFlashcardsSchema.safeParse(command);
  
  if (!result.success) {
    // Transform Zod errors into a more user-friendly format
    const errors = result.error.issues.map(issue => ({
      path: issue.path.map(String),  // Convert all path elements to strings
      message: issue.message
    }));
    return { success: false, errors };
  }

  return { success: true, data: result.data };
} 