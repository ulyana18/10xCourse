import type { FlashcardDTO } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FlashcardsListProps {
  flashcards: FlashcardDTO[];
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (id: number) => void;
}

export function FlashcardsList({ flashcards, onEdit, onDelete }: FlashcardsListProps) {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No flashcards found
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((flashcard) => (
        <Card key={flashcard.id}>
          <CardHeader className="text-sm text-muted-foreground">
            Source: {flashcard.source}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Front</h3>
              <p className="text-sm">{flashcard.front}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Back</h3>
              <p className="text-sm">{flashcard.back}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(flashcard)}
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(flashcard.id)}
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 