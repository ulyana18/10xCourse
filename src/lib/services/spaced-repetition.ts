export type SpacedRepetitionParams = {
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
};

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;
const INITIAL_INTERVAL = 1;

export function calculateNextReview(
  rating: number,
  previousEaseFactor: number = INITIAL_EASE_FACTOR,
  previousInterval: number = INITIAL_INTERVAL
): SpacedRepetitionParams {
  // SuperMemo 2 Algorithm Implementation
  let interval: number;
  let easeFactor = previousEaseFactor;

  // Calculate new interval based on rating
  if (rating < 3) {
    // If rating is less than 3, reset interval to 1
    interval = 1;
  } else if (previousInterval === 1) {
    interval = 6;
  } else {
    interval = Math.round(previousInterval * previousEaseFactor);
  }

  // Update ease factor based on rating
  // EF' = EF + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  const efModifier = 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02);
  easeFactor = Math.max(previousEaseFactor + efModifier, MIN_EASE_FACTOR);

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    interval,
    easeFactor,
    nextReviewDate,
  };
} 