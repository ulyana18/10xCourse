import type { SupabaseClient } from "@/db/supabase.client";
import type { GenerationErrorListParams, GenerationErrorListResponse, GenerationErrorDTO } from "@/types";

export async function listGenerationErrors(
  supabase: SupabaseClient,
  params: GenerationErrorListParams,
  userId: string
): Promise<GenerationErrorListResponse> {
  const {
    page = 1,
    per_page = 20,
    start_date,
    end_date,
    error_code,
  } = params;

  let query = supabase
    .from("flashcard_generation_error_logs")
    .select("id, model, source_text_hash, source_text_length, error_code, error_message, created_at", {
      count: "exact",
    })
    .eq("user_id", userId);

  // Apply filters
  if (start_date) {
    query = query.gte("created_at", start_date);
  }
  if (end_date) {
    query = query.lte("created_at", end_date);
  }
  if (error_code) {
    query = query.eq("error_code", error_code);
  }

  // Apply pagination
  const from = (page - 1) * per_page;
  query = query
    .order("created_at", { ascending: false })
    .range(from, from + per_page - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch generation errors: ${error.message}`);
  }

  return {
    items: (data || []) as GenerationErrorDTO[],
    total: count || 0,
    page,
    per_page,
  };
} 