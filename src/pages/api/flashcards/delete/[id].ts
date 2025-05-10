import type { APIRoute } from "astro"
import { flashcardIdSchema } from "../../../../lib/validators/flashcard-delete"
import { deleteFlashcard, FlashcardNotFoundError, UnauthorizedFlashcardAccessError } from "../../../../lib/services/flashcard-delete"
import { DEFAULT_USER_ID } from '@/db/supabase.client'

export const prerender = false

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Validate and parse id parameter
    const result = flashcardIdSchema.safeParse({ id: params.id })
    if (!result.success) {
      return new Response(JSON.stringify({
        error: {
          code: "INVALID_PARAMS",
          message: "Invalid flashcard ID",
          details: result.error.format()
        }
      }), { status: 400 })
    }

    // Delete the flashcard using default user ID
    await deleteFlashcard(locals.supabase, DEFAULT_USER_ID, result.data.id)

    // Return success with no content
    return new Response(null, { status: 204 })

  } catch (error) {
    if (error instanceof FlashcardNotFoundError) {
      return new Response(JSON.stringify({
        error: {
          code: "NOT_FOUND",
          message: error.message
        }
      }), { status: 404 })
    }

    if (error instanceof UnauthorizedFlashcardAccessError) {
      return new Response(JSON.stringify({
        error: {
          code: "FORBIDDEN",
          message: error.message
        }
      }), { status: 403 })
    }

    console.error("Error deleting flashcard:", error)
    return new Response(JSON.stringify({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred"
      }
    }), { status: 500 })
  }
} 