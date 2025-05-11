import type { APIRoute } from 'astro';
import type { ApiErrorResponse, GenerationStatisticsResponse } from '@/types';
import { getGenerationStatistics, StatisticsError } from '@/lib/services/statistics';
import { DEFAULT_USER_ID } from '@/db/supabase.client';

export const prerender = false;

export const GET: APIRoute = async ({ locals }): Promise<Response> => {
  try {
    const { supabase } = locals;
    const stats = await getGenerationStatistics(supabase, DEFAULT_USER_ID);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching generation statistics:', error);

    if (error instanceof StatisticsError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    } as ApiErrorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 