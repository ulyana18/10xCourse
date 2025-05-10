import type { SupabaseClient } from "@/db/supabase.client"

export class FlashcardNotFoundError extends Error {
  constructor(id: number) {
    super(`Flashcard with id ${id} not found`)
    this.name = "FlashcardNotFoundError"
  }
}

export class UnauthorizedFlashcardAccessError extends Error {
  constructor(id: number) {
    super(`You don't have permission to delete flashcard with id ${id}`)
    this.name = "UnauthorizedFlashcardAccessError"
  }
}

export async function deleteFlashcard(
  supabase: SupabaseClient,
  userId: string,
  flashcardId: number
): Promise<void> {
  // First check if flashcard exists and belongs to user
  const { data: flashcard, error: findError } = await supabase
    .from("flashcards")
    .select("id")
    .eq("id", flashcardId)
    .eq("user_id", userId)
    .single()

  if (findError) {
    if (findError.code === "PGRST116") {
      throw new FlashcardNotFoundError(flashcardId)
    }
    throw findError
  }

  if (!flashcard) {
    throw new UnauthorizedFlashcardAccessError(flashcardId)
  }

  // Delete the flashcard
  const { error: deleteError } = await supabase
    .from("flashcards")
    .delete()
    .eq("id", flashcardId)
    .eq("user_id", userId)

  if (deleteError) {
    throw deleteError
  }
} 