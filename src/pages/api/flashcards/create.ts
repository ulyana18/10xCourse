import type { APIRoute } from 'astro';
import { createFlashcardSchema } from '../../../lib/validators/flashcard-create';
import { createFlashcard, FlashcardCreationError } from '../../../lib/services/flashcard-create';
import type { ApiErrorResponse } from '../../../types';
import { DEFAULT_USER_ID } from '../../../db/supabase.client';

/**
 * POST /api/flashcards/create
 * 
 * Creates a new flashcard with the provided content.
 * 
 * @remarks
 * This endpoint allows manual creation of flashcards with front and back content.
 * Currently uses a default user ID for development purposes.
 * 
 * @example Request
 * ```http
 * POST /api/flashcards/create
 * Content-Type: application/json
 * 
 * {
 *   "front": "What is REST?",
 *   "back": "REST (Representational State Transfer) is an architectural style for distributed systems."
 * }
 * ```
 * 
 * @example Success Response
 * ```http
 * HTTP/1.1 201 Created
 * Content-Type: application/json
 * 
 * {
 *   "id": 123,
 *   "front": "What is REST?",
 *   "back": "REST (Representational State Transfer) is an architectural style for distributed systems.",
 *   "source": "manual",
 *   "created_at": "2024-03-14T12:00:00Z",
 *   "updated_at": "2024-03-14T12:00:00Z"
 * }
 * ```
 * 
 * @example Error Response
 * ```http
 * HTTP/1.1 400 Bad Request
 * Content-Type: application/json
 * 
 * {
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid input data",
 *     "details": {
 *       "front": ["Front side text is required"]
 *     }
 *   }
 * }
 * ```
 */
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validationResult = createFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.format()
          }
        } satisfies ApiErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const flashcard = await createFlashcard(locals.supabase, validationResult.data, DEFAULT_USER_ID);

    return new Response(
      JSON.stringify(flashcard),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating flashcard:', error);
    
    if (error instanceof FlashcardCreationError) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'CREATION_ERROR',
            message: error.message
          }
        } satisfies ApiErrorResponse),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      } satisfies ApiErrorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 