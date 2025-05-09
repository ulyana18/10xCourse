import type { SupabaseClient } from '@/db/supabase.client';
import type { FlashcardListParams, FlashcardListResponse, FlashcardDTO } from '@/types';
import type { Database } from '@/db/database.types';

type FlashcardWithTotal = Database['public']['Tables']['flashcards']['Row'] & {
  total: number;
};

export class FlashcardsListError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FlashcardsListError';
  }
}

export async function listFlashcards(
  supabase: SupabaseClient,
  params: FlashcardListParams,
  userId: string
): Promise<FlashcardListResponse> {
  try {
    const { page = 1, per_page = 20, source, sort = 'created_at', order = 'desc' } = params;
    const offset = (page - 1) * per_page;

    // First get total count
    const countQuery = supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (source) {
      countQuery.eq('source', source);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new FlashcardsListError(
        'Failed to fetch total count',
        'COUNT_ERROR',
        { details: countError }
      );
    }

    // Then fetch paginated data
    let dataQuery = supabase
      .from('flashcards')
      .select('id, front, back, source, created_at, updated_at')
      .eq('user_id', userId);

    if (source) {
      dataQuery = dataQuery.eq('source', source);
    }

    // Apply sorting
    dataQuery = dataQuery.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    dataQuery = dataQuery.range(offset, offset + per_page - 1);

    const { data, error: dataError } = await dataQuery;

    if (dataError) {
      throw new FlashcardsListError(
        'Failed to fetch flashcards',
        'FETCH_ERROR',
        { details: dataError }
      );
    }

    return {
      items: (data || []) as FlashcardDTO[],
      total: count || 0,
      page,
      per_page
    };
  } catch (error) {
    if (error instanceof FlashcardsListError) {
      throw error;
    }

    throw new FlashcardsListError(
      'Failed to list flashcards',
      'LIST_ERROR',
      { originalError: error }
    );
  }
} 