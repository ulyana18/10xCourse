import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { UpdateFlashcardCommand, FlashcardDTO, ApiErrorResponse } from '@/types';
import { updateFlashcard, FlashcardUpdateError } from '@/lib/services/flashcard-update';
import { DEFAULT_USER_ID } from '@/db/supabase.client';

export const prerender = false;

// Validation schemas
const pathParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

const updateFlashcardSchema = z.object({
  front: z.string().max(200).optional(),
  back: z.string().max(500).optional(),
}).refine(data => data.front !== undefined || data.back !== undefined, {
  message: "At least one field (front or back) must be provided"
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Get supabase client from context
    const supabase = locals.supabase;

    // Validate path params
    const pathResult = pathParamsSchema.safeParse(params);
    if (!pathResult.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: 'INVALID_PARAMS',
          message: 'Invalid flashcard ID',
          details: pathResult.error.format()
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const bodyResult = updateFlashcardSchema.safeParse(body);
    if (!bodyResult.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid request body',
          details: bodyResult.error.format()
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update flashcard using default user ID
    const updatedFlashcard = await updateFlashcard(
      supabase,
      pathResult.data.id,
      DEFAULT_USER_ID,
      bodyResult.data
    );

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    
    if (error instanceof FlashcardUpdateError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: error.code,
          message: error.message
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const errorResponse: ApiErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 