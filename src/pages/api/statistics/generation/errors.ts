import type { APIRoute } from "astro";
import { generationErrorListParamsSchema } from "@/lib/validators/statistics-errors";
import type { ApiErrorResponse, GenerationErrorListResponse } from "@/types";
import { listGenerationErrors } from "@/lib/services/statistics-errors";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }): Promise<Response> => {
  try {
    // Parse and validate query parameters
    const params = Object.fromEntries(url.searchParams.entries());
    const result = generationErrorListParamsSchema.safeParse(params);

    if (!result.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request parameters",
          details: result.error.flatten()
        }
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch data using the service function with DEFAULT_USER_ID
    const response = await listGenerationErrors(locals.supabase, result.data, DEFAULT_USER_ID);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error fetching generation errors:", error);

    const response: ApiErrorResponse = {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      }
    };
    return new Response(JSON.stringify(response), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}; 