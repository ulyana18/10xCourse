import type { SupabaseClient } from '@/db/supabase.client';
import type { GenerationStatisticsResponse } from '@/types';

export class StatisticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'StatisticsError';
  }
}

export async function getGenerationStatistics(
  supabase: SupabaseClient,
  userId: string
): Promise<GenerationStatisticsResponse> {
  try {
    const { data, error } = await supabase
      .from('flashcard_generation_sessions')
      .select(`
        generated_count,
        accepted_unedited_count,
        accepted_edited_count,
        rejected_count
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching generation statistics:', error);
      throw new StatisticsError(
        'Failed to fetch generation statistics',
        'FETCH_FAILED',
        { supabaseError: error }
      );
    }

    // Define types for session data
    type SessionCounts = {
      generated_count: number | null;
      accepted_unedited_count: number | null;
      accepted_edited_count: number | null;
      rejected_count: number | null;
    };

    try {
      // Aggregate the results
      const stats = (data as SessionCounts[]).reduce((acc: GenerationStatisticsResponse, session: SessionCounts) => ({
        total_generated: acc.total_generated + (session.generated_count || 0),
        accepted_unedited: acc.accepted_unedited + (session.accepted_unedited_count || 0),
        accepted_edited: acc.accepted_edited + (session.accepted_edited_count || 0),
        rejected: acc.rejected + (session.rejected_count || 0)
      }), {
        total_generated: 0,
        accepted_unedited: 0,
        accepted_edited: 0,
        rejected: 0
      });

      return stats;
    } catch (error) {
      throw new StatisticsError(
        'Failed to aggregate statistics data',
        'DATA_AGGREGATION_FAILED',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  } catch (error) {
    if (error instanceof StatisticsError) {
      throw error;
    }
    throw new StatisticsError(
      'Unexpected error while fetching statistics',
      'FETCH_FAILED',
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
} 