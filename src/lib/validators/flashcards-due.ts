import { z } from 'zod'
import type { DueFlashcardsParams } from '@/types'

export const dueFlashcardsParamsSchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  per_page: z.coerce.number().positive().max(100).optional().default(20),
  before_date: z.string().datetime().optional()
})

export type DueFlashcardsParamsSchema = z.infer<typeof dueFlashcardsParamsSchema>

// Helper do walidacji parametrów zapytania
export const validateDueFlashcardsParams = (searchParams: URLSearchParams): DueFlashcardsParams => {
  const params = Object.fromEntries(searchParams.entries())
  return dueFlashcardsParamsSchema.parse(params)
} 