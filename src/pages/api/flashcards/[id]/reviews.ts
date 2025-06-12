import type { APIRoute } from 'astro';
import { getFlashcardReviews, FlashcardReviewError } from '@/lib/services/flashcards-reviews';
import { reviewsParamsSchema, reviewsQuerySchema } from '@/lib/validators/flashcards-reviews';
import type { ApiErrorResponse } from '@/types';
import { DEFAULT_USER_ID } from '@/db/supabase.client';

export const prerender = false;

export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    // Validate path parameters
    const pathResult = reviewsParamsSchema.safeParse(params);
    if (!pathResult.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid flashcard ID',
          details: pathResult.error.flatten()
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ?? undefined;
    const perPage = url.searchParams.get('per_page') ?? undefined;
    
    const queryResult = reviewsQuerySchema.safeParse({
      page,
      per_page: perPage
    });

    if (!queryResult.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid pagination parameters',
          details: queryResult.error.flatten()
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get reviews using the service with default user ID
    const reviews = await getFlashcardReviews(locals.supabase, {
      flashcardId: pathResult.data.id,
      userId: DEFAULT_USER_ID,
      ...queryResult.data
    });

    return new Response(JSON.stringify(reviews), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error getting flashcard reviews:', error);
    
    if (error instanceof FlashcardReviewError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: error.code === 'FLASHCARD_NOT_FOUND' ? 404 : 422,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const errorResponse: ApiErrorResponse = {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 