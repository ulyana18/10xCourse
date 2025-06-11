import { useState } from 'react';
import type { FlashcardSuggestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EditFlashcardDialog } from '@/components/shared/dialogs/EditFlashcardDialog';
import { LoadingSkeleton } from '@/components/shared/feedback/LoadingSkeleton';
import { ErrorBoundary } from '@/components/shared/feedback/ErrorBoundary';
import { useFlashcardGeneration } from './hooks/useFlashcardGeneration';
import { FlashcardsList } from './FlashcardsList';
import { toast, Toaster } from 'sonner';

export function FlashcardsGenerateView() {
  const {
    isLoading,
    isSubmitting,
    error,
    suggestions,
    generateFlashcards,
    submitReviews,
  } = useFlashcardGeneration();

  const [text, setText] = useState('');
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardSuggestion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Record<number, 'accept' | 'reject' | 'edit'>>({});
  const [editedCards, setEditedCards] = useState<Record<number, { front: string; back: string }>>({});
  const [generationId, setGenerationId] = useState<number | null>(null);

  const handleGenerateFlashcards = async () => {
    try {
      const response = await generateFlashcards(text);
      setGenerationId(response.generation_id);
      setReviewedCards({});
      setEditedCards({});
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleAction = (id: number, action: 'accept' | 'reject' | 'edit') => {
    if (action === 'edit') {
      const flashcard = suggestions.find(s => s.id === id);
      if (flashcard) {
        setSelectedFlashcard(flashcard);
        setIsEditModalOpen(true);
      }
    }
    setReviewedCards(prev => ({
      ...prev,
      [id]: action
    }));
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
    setIsEditModalOpen(false);
    setSelectedFlashcard(null);
  };

  const handleSubmitReviews = async () => {
    if (!generationId) return;

    try {
      const result = await submitReviews(generationId, reviewedCards, editedCards);
      toast.success("Reviews submitted successfully", {
        description: `Accepted: ${result.accepted}, Rejected: ${result.rejected}, Edited: ${result.edited}`,
      });
      // Clear the form after successful submission
      setText('');
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
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="text">Text to generate flashcards from</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text here..."
            className="min-h-[200px]"
          />
          <Button 
            onClick={handleGenerateFlashcards}
            disabled={!text.trim() || isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Flashcards'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500">{error}</div>
        )}

        {isLoading ? (
          <LoadingSkeleton count={5} />
        ) : (
          suggestions.length > 0 && (
            <>
              <FlashcardsList 
                flashcards={suggestions}
                onEdit={(flashcard: FlashcardSuggestion) => {
                  setSelectedFlashcard(flashcard);
                  setIsEditModalOpen(true);
                }}
                onAction={handleAction}
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
          )
        )}

        <EditFlashcardDialog 
          flashcard={selectedFlashcard}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFlashcard(null);
          }}
          onSave={handleSaveEdit}
        />

        <Toaster />
      </div>
    </ErrorBoundary>
  );
} 