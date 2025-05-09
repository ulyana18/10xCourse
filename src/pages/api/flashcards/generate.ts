import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponse, ApiErrorResponse } from '@/types';
import { generateFlashcards, FlashcardGenerationError } from '@/lib/services/flashcards-generate';
import { DEFAULT_USER_ID } from '@/db/supabase.client';

// Prevent static generation of API route
export const prerender = false;

const GPT4_MODEL = 'gpt4';

// Input validation schema
const generateFlashcardsSchema = z.object({
  source_text: z.string()
    .min(1000, 'Text must be at least 1000 characters long')
    .max(10000, 'Text cannot exceed 10000 characters')
});

export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = generateFlashcardsSchema.safeParse(body);
    
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

    const command: GenerateFlashcardsCommand = {
      source_text: result.data.source_text,
      model: GPT4_MODEL
    };
    
    // Generate flashcards using the service with default user ID
    const response = await generateFlashcards(locals.supabase, command, DEFAULT_USER_ID);
    
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    
    if (error instanceof FlashcardGenerationError) {
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