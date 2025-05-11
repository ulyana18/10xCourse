import { z } from "zod";
import type { GenerationErrorListParams } from "@/types";

export const generationErrorListParamsSchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  per_page: z.coerce.number().positive().optional().default(20),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  error_code: z.string().optional(),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) <= new Date(data.end_date);
    }
    return true;
  },
  {
    message: "Start date must be before or equal to end date",
    path: ["start_date"],
  }
);

export type GenerationErrorListParamsSchema = z.infer<typeof generationErrorListParamsSchema>; 