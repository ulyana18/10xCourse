import { z } from "zod";

export const flashcardIdSchema = z
  .string()
  .regex(/^\d+$/)
  .transform((val) => parseInt(val, 10))
  .describe("Flashcard ID must be a valid integer");

export const flashcardReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(0)
    .max(5)
    .describe("Rating must be an integer between 0 and 5"),
});

export type FlashcardReviewInput = z.infer<typeof flashcardReviewSchema>; 