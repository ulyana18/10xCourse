import { z } from 'zod';

export const reviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().min(1).max(100).optional().default(20)
});

export const reviewsParamsSchema = z.object({
  id: z.coerce.number().int().positive()
}); 