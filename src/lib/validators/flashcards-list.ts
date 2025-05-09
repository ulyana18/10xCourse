import { z } from 'zod';
import type { Database } from '@/db/database.types';

type FlashcardSource = Database['public']['Enums']['flashcard_source'];

export const flashcardListParamsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(1),
  per_page: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20),
  source: z.enum(['ai-full', 'ai-edited', 'manual'] as const)
    .optional(),
  sort: z.enum(['created_at', 'updated_at'] as const)
    .optional()
    .default('created_at'),
  order: z.enum(['asc', 'desc'] as const)
    .optional()
    .default('desc')
});

export type FlashcardListParamsSchema = z.infer<typeof flashcardListParamsSchema>; 