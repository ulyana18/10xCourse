import type { APIRoute } from 'astro';
import type { ZodError } from 'zod';
import { flashcardIdSchema, flashcardReviewSchema } from '@/lib/validators/flashcards-review';
import { submitFlashcardReview } from '@/lib/services/flashcards-review';
import { FlashcardReviewError } from '@/lib/services/flashcards-review';
import { DEFAULT_USER_ID } from '@/db/supabase.client';

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // Validate flashcard ID from URL params
    const flashcardId = await flashcardIdSchema.parseAsync(params.id);

    // Parse and validate request body
    const body = await request.json();
    const { rating } = await flashcardReviewSchema.parseAsync(body);

    // Submit review using default user ID
    const review = await submitFlashcardReview(
      locals.supabase,
      DEFAULT_USER_ID,
      flashcardId,
      rating
    );

    return new Response(JSON.stringify(review), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    if (error instanceof FlashcardReviewError) {
      return new Response(
        JSON.stringify({
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        }),
        {
          status: error.code === 'FLASHCARD_ACCESS_ERROR' ? 404 : 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as ZodError;
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: zodError.errors,
          },
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in review endpoint:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}; 