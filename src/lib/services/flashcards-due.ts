import type { SupabaseClient } from '@/db/supabase.client';
import type { DueFlashcardsParams, DueFlashcardsResponse, FlashcardWithReviewDTO } from '@/types'

export class FlashcardsDueError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'FlashcardsDueError'
  }
}

export async function getDueFlashcards(
  supabase: SupabaseClient,
  userId: string,
  { page = 1, per_page = 20, before_date }: DueFlashcardsParams
): Promise<DueFlashcardsResponse> {
  console.log(`[FlashcardsDue] Fetching due flashcards for user ${userId}`)
  
  try {
    const offset = (page - 1) * per_page

    // Budowanie zapytania bazowego
    console.log(`[FlashcardsDue] Building query with pagination: page ${page}, per_page ${per_page}`)
    const query = supabase
      .from('flashcards')
      .select(`
        id,
        front,
        back,
        source,
        created_at,
        updated_at,
        latest_review:flashcard_reviews!flashcard_id(
          id,
          flashcard_id,
          rating,
          next_review_date,
          ease_factor,
          interval,
          review_count
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Dodanie filtra daty, jeśli podano
    if (before_date) {
      console.log(`[FlashcardsDue] Adding date filter: before ${before_date}`)
      query.lte('next_review_date', before_date)
    }

    // Dodanie paginacji
    query.range(offset, offset + per_page - 1)

    // Wykonanie zapytania
    console.log(`[FlashcardsDue] Executing query`)
    const { data, error, count } = await query

    if (error) {
      console.error(`[FlashcardsDue] Database error:`, error)
      throw new FlashcardsDueError(
        'Failed to fetch due flashcards',
        'DATABASE_ERROR',
        { error: error.message }
      )
    }

    // Mapowanie wyników do DTO
    console.log(`[FlashcardsDue] Mapping ${data?.length ?? 0} results to DTO`)
    const items = (data || []).map((item): FlashcardWithReviewDTO => ({
      id: item.id,
      front: item.front,
      back: item.back,
      source: item.source,
      created_at: item.created_at,
      updated_at: item.updated_at,
      latest_review: item.latest_review?.[0] // Bierzemy pierwszy element, bo to relacja jeden-do-wielu
    }))

    const response = {
      items,
      total: count ?? 0,
      page,
      per_page
    }

    console.log(`[FlashcardsDue] Successfully fetched due flashcards. Total: ${response.total}`)
    return response
  } catch (error) {
    if (error instanceof FlashcardsDueError) {
      throw error
    }
    console.error(`[FlashcardsDue] Unexpected error:`, error)
    throw new FlashcardsDueError(
      'An unexpected error occurred',
      'INTERNAL_ERROR',
      { message: error instanceof Error ? error.message : 'Unknown error' }
    )
  }
} 