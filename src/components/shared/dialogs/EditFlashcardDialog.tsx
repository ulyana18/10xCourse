import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { FlashcardDTO, FlashcardSuggestion } from "@/types"

interface EditFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  flashcard: FlashcardDTO | FlashcardSuggestion | null;
  onSave: (id: number, data: { front: string; back: string }) => void;
}

export function EditFlashcardDialog({ isOpen, onClose, flashcard, onSave }: EditFlashcardDialogProps) {
  const [front, setFront] = useState(flashcard?.front || '');
  const [back, setBack] = useState(flashcard?.back || '');

  useEffect(() => {
    if (flashcard) {
        setFront(flashcard.front);
        setBack(flashcard.back);
    }
  }, [flashcard]);

  console.log(flashcard);
  const handleSave = () => {
    if (flashcard && front.trim() && back.trim()) {
      onSave(flashcard.id, { front: front.trim(), back: back.trim() });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="front">Front</Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the front side content"
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="back">Back</Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the back side content"
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave}
            disabled={!front.trim() || !back.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 