import { useState } from 'react';
import type { 
  FlashcardSuggestion, 
  GenerateFlashcardsCommand, 
  GenerateFlashcardsResponse, 
  ApiErrorResponse,
  ReviewFlashcardsCommand,
  ReviewFlashcardsResponse
} from '../../../types';

export function useFlashcardGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FlashcardSuggestion[]>([]);

  const generateFlashcards = async (text: string): Promise<GenerateFlashcardsResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_text: text,
          model: 'gpt4'
        } as GenerateFlashcardsCommand),
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to generate flashcards');
      }

      const data = await response.json() as GenerateFlashcardsResponse;
      setSuggestions(data.suggestions);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const submitReviews = async (generationId: number, reviews: Record<number, 'accept' | 'reject' | 'edit'>, editedCards: Record<number, { front: string; back: string }>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const reviewData: ReviewFlashcardsCommand = {
        generation_id: generationId,
        reviews: Object.entries(reviews).map(([id, action]) => {
          const numId = Number(id);
          const originalCard = suggestions.find(s => s.id === numId);
          
          if (action === 'edit' && editedCards[numId]) {
            return {
              suggestion_id: numId,
              action,
              ...editedCards[numId]
            };
          }

          return {
            suggestion_id: numId,
            action,
            front: originalCard?.front || '',
            back: originalCard?.back || ''
          };
        })
      };

      const response = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to submit reviews');
      }

      const data = await response.json() as ReviewFlashcardsResponse;
      setSuggestions([]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while submitting reviews');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoading,
    isSubmitting,
    error,
    suggestions,
    generateFlashcards,
    submitReviews,
  };
} 