import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { TextInput } from './TextInput';
import { GenerateButton } from './GenerateButton';
import { LoadingSkeleton } from './LoadingSkeleton';
import { FlashcardSuggestionList } from './FlashcardSuggestionList';
import { ErrorMessage } from './ErrorMessage';
import { FlashcardEditDialog } from './FlashcardEditDialog';
import { useFlashcardGeneration } from './hooks/useFlashcardGeneration';
import type { FlashcardSuggestion } from '../types';
import { toast } from 'sonner';

export function FlashcardsGenerateView() {
  const [inputText, setInputText] = useState('');
  const { isLoading, isSubmitting, error, suggestions, generateFlashcards, submitReviews } = useFlashcardGeneration();
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardSuggestion | null>(null);
  const [reviewedCards, setReviewedCards] = useState<Record<number, 'accept' | 'reject' | 'edit'>>({});
  const [editedCards, setEditedCards] = useState<Record<number, { front: string; back: string }>>({});
  const [generationId, setGenerationId] = useState<number | null>(null);

  const handleGenerateFlashcards = async () => {
    try {
      const response = await generateFlashcards(inputText);
      setGenerationId(response.generation_id);
      setReviewedCards({});
      setEditedCards({});
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleFlashcardAction = (suggestionId: number, action: 'accept' | 'reject' | 'edit', updatedData?: { front: string; back: string }) => {
    if (action === 'edit') {
      const flashcard = suggestions.find(s => s.id === suggestionId);
      if (flashcard) {
        setEditingFlashcard(flashcard);
      }
    } else {
      setReviewedCards(prev => ({
        ...prev,
        [suggestionId]: action
      }));
    }
  };

  const handleSaveEdit = (id: number, updatedData: { front: string; back: string }) => {
    setReviewedCards(prev => ({
      ...prev,
      [id]: 'edit'
    }));
    setEditedCards(prev => ({
      ...prev,
      [id]: updatedData
    }));
    setEditingFlashcard(null);
  };

  const handleSubmitReviews = async () => {
    if (!generationId) return;

    try {
      const result = await submitReviews(generationId, reviewedCards, editedCards);
      toast.success("Reviews submitted successfully", {
        description: `Accepted: ${result.accepted}, Rejected: ${result.rejected}, Edited: ${result.edited}`,
      });
      // Clear the form after successful submission
      setInputText('');
      setReviewedCards({});
      setEditedCards({});
      setGenerationId(null);
    } catch (err) {
      toast.error("Error submitting reviews", {
        description: err instanceof Error ? err.message : "An unexpected error occurred",
      });
    }
  };

  const allCardsReviewed = suggestions.length > 0 && 
    suggestions.every(s => s.id in reviewedCards);

  return (
    <div className="space-y-6">
      <TextInput 
        value={inputText}
        onChange={setInputText}
        error={error}
      />
      
      <GenerateButton
        onClick={handleGenerateFlashcards}
        disabled={inputText.length < 1000 || inputText.length > 10000}
        isLoading={isLoading}
      />

      {isLoading && <LoadingSkeleton />}

      {error && <ErrorMessage message={error} />}

      {suggestions.length > 0 && (
        <>
          <FlashcardSuggestionList
            suggestions={suggestions}
            onAction={handleFlashcardAction}
            reviewedCards={reviewedCards}
          />
          {allCardsReviewed && (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitReviews}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Reviews'}
              </Button>
            </div>
          )}
        </>
      )}

      {editingFlashcard && (
        <FlashcardEditDialog
          isOpen={true}
          onClose={() => setEditingFlashcard(null)}
          flashcard={editingFlashcard}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
} 