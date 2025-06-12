import type { APIRoute } from 'astro'
import { getDueFlashcards, FlashcardsDueError } from '@/lib/services/flashcards-due'
import { validateDueFlashcardsParams } from '@/lib/validators/flashcards-due'
import { ZodError } from 'zod'
import { DEFAULT_USER_ID } from '@/db/supabase.client'
import type { ApiErrorResponse } from '@/types'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Walidacja parametrów zapytania
    const searchParams = new URL(request.url).searchParams
    const params = validateDueFlashcardsParams(searchParams)

    // Pobranie kart do powtórki
    const response = await getDueFlashcards(locals.supabase, DEFAULT_USER_ID, params)

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: unknown) {
    console.error('Error fetching due flashcards:', error)

    // Obsługa błędów walidacji
    if (error instanceof ZodError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: error.flatten()
        }
      }
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // Obsługa błędów serwisu
    if (error instanceof FlashcardsDueError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      }
      return new Response(JSON.stringify(errorResponse), {
        status: error.code === 'DATABASE_ERROR' ? 422 : 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // Obsługa pozostałych błędów
    const errorResponse: ApiErrorResponse = {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 