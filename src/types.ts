import type { Database } from "./db/database.types"

// Base types from database
type FlashcardEntity = Database["public"]["Tables"]["flashcards"]["Row"]
type GenerationSessionEntity = Database["public"]["Tables"]["flashcard_generation_sessions"]["Row"]
type GenerationErrorEntity = Database["public"]["Tables"]["flashcard_generation_error_logs"]["Row"]

// Shared types
export type PaginationParams = {
  page?: number
  per_page?: number
}

// Flashcard Generation Types
export type GenerateFlashcardsCommand = {
  source_text: string
  model: string
}

export type FlashcardSuggestion = {
  id: number
  front: string
  back: string
}

export type GenerateFlashcardsResponse = {
  generation_id: number
  suggestions: FlashcardSuggestion[]
}

export type FlashcardReviewAction = "accept" | "reject" | "edit"

export type FlashcardReview = {
  suggestion_id: number
  action: FlashcardReviewAction
  front?: string
  back?: string
}

export type ReviewFlashcardsCommand = {
  generation_id: number
  reviews: FlashcardReview[]
}

export type ReviewFlashcardsResponse = {
  accepted: number
  rejected: number
  edited: number
}

// Flashcard Management Types
export type CreateFlashcardCommand = {
  front: string
  back: string
}

export type FlashcardDTO = Pick<FlashcardEntity, "id" | "front" | "back" | "source" | "created_at" | "updated_at">

export type FlashcardListParams = PaginationParams & {
  source?: Database["public"]["Enums"]["flashcard_source"]
  sort?: "created_at" | "updated_at"
  order?: "asc" | "desc"
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  per_page: number
}

export type FlashcardListResponse = PaginatedResponse<FlashcardDTO>

export type UpdateFlashcardCommand = Partial<CreateFlashcardCommand>

// Statistics Types
export type GenerationStatisticsResponse = {
  total_generated: number
  accepted_unedited: number
  accepted_edited: number
  rejected: number
}

export type GenerationErrorListParams = PaginationParams & {
  start_date?: string
  end_date?: string
  error_code?: string
}

export type GenerationErrorDTO = Pick<
  GenerationErrorEntity,
  "id" | "model" | "source_text_hash" | "source_text_length" | "error_code" | "error_message" | "created_at"
>

export type GenerationErrorListResponse = PaginatedResponse<GenerationErrorDTO>

// API Error Response Type
export type ApiErrorResponse = {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
} 