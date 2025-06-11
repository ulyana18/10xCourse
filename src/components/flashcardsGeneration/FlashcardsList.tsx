import type { FlashcardDTO, FlashcardSuggestion } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Check, X } from 'lucide-react';

interface FlashcardsListProps {
  flashcards: (FlashcardDTO | FlashcardSuggestion)[];
  onEdit: (flashcard: FlashcardDTO | FlashcardSuggestion) => void;
  onAction?: (id: number, action: 'accept' | 'reject' | 'edit') => void;
  reviewedCards?: Record<number, 'accept' | 'reject' | 'edit'>;
}

export function FlashcardsList({ flashcards, onEdit, onAction, reviewedCards = {} }: FlashcardsListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((flashcard) => (
        <Card key={flashcard.id} className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm text-muted-foreground">Flashcard {flashcard.id}</div>
            <div className="flex gap-2">
              {onAction && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAction(flashcard.id, 'accept')}
                    className="h-8 w-8"
                    disabled={flashcard.id in reviewedCards}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAction(flashcard.id, 'reject')}
                    className="h-8 w-8"
                    disabled={flashcard.id in reviewedCards}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(flashcard)}
                className="h-8 w-8"
                disabled={reviewedCards[flashcard.id] === 'reject'}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Front</div>
                <div className="mt-1">{flashcard.front}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Back</div>
                <div className="mt-1">{flashcard.back}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 