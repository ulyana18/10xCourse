import type { APIRoute } from 'astro';
import type { ReviewFlashcardsCommand, ApiErrorResponse } from '@/types';
import { reviewFlashcardsSchema } from '@/lib/validators/flashcard-review';
import { reviewFlashcards, FlashcardReviewError } from '@/lib/services/flashcard-review';
import { DEFAULT_USER_ID } from '@/db/supabase.client';

// Prevent static generation of API route
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  try {
    // Check for empty body
    const contentLength = request.headers.get('content-length');
    if (!contentLength || parseInt(contentLength) === 0) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: 'EMPTY_BODY',
          message: 'Request body is empty'
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: 'INVALID_JSON',
          message: 'Request body is not valid JSON'
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = reviewFlashcardsSchema.safeParse(body);
    
    if (!result.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.flatten()
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const command: ReviewFlashcardsCommand = result.data;
    
    // Process reviews using the service
    const response = await reviewFlashcards(locals.supabase, command, DEFAULT_USER_ID);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing flashcard reviews:', error);
    
    if (error instanceof FlashcardReviewError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 422,
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