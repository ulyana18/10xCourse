import { z } from "zod"

export const flashcardIdSchema = z.object({
  id: z.coerce.number().int().positive()
})

export type FlashcardIdParams = z.infer<typeof flashcardIdSchema> 