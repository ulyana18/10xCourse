import type { APIRoute } from 'astro';
import type { ApiErrorResponse } from '@/types';
import { flashcardListParamsSchema } from '@/lib/validators/flashcards-list';
import { listFlashcards, FlashcardsListError } from '@/lib/services/flashcards-list';
import { DEFAULT_USER_ID } from '@/db/supabase.client';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }): Promise<Response> => {
  try {
    // Parse and validate query parameters
    const searchParams = {
      ...(url.searchParams.get('page') && { page: url.searchParams.get('page') }),
      ...(url.searchParams.get('per_page') && { per_page: url.searchParams.get('per_page') }),
      ...(url.searchParams.get('source') && { source: url.searchParams.get('source') }),
      ...(url.searchParams.get('sort') && { sort: url.searchParams.get('sort') }),
      ...(url.searchParams.get('order') && { order: url.searchParams.get('order') })
    };

    const result = flashcardListParamsSchema.safeParse(searchParams);

    if (!result.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: result.error.flatten()
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call service to list flashcards
    const response = await listFlashcards(locals.supabase, result.data, DEFAULT_USER_ID);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error listing flashcards:', error);

    if (error instanceof FlashcardsListError) {
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