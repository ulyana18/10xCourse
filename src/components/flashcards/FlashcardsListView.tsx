import { useEffect, useState } from 'react';
import type { FlashcardDTO } from '@/types';
import { FilterBar } from './FilterBar';
import { FlashcardsList } from './FlashcardsList';
import { CustomPagination } from '@/components/ui/custom-pagination';
import { EditFlashcardDialog } from '@/components/shared/dialogs/EditFlashcardDialog';
import { DeleteConfirmation } from './DeleteConfirmation';
import { useFlashcards } from './hooks/useFlashcards';
import { Toaster } from 'sonner';
import { LoadingSkeleton } from '@/components/shared/feedback/LoadingSkeleton';
import { ErrorBoundary } from '@/components/shared/feedback/ErrorBoundary';

export function FlashcardsListView() {
  const {
    flashcards,
    total,
    currentPage,
    perPage,
    isLoading,
    filter,
    fetchFlashcards,
    setCurrentPage,
    setPerPage,
    setFilter,
    deleteFlashcard,
    updateFlashcard,
  } = useFlashcards();

  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchFlashcards();
  }, [currentPage, perPage, filter, fetchFlashcards]);

  const handleDelete = async (id: number) => {
    setFlashcardToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (flashcardToDelete) {
      await deleteFlashcard(flashcardToDelete);
      setIsDeleteDialogOpen(false);
      setFlashcardToDelete(null);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <FilterBar 
          selectedSource={filter}
          onSourceChange={setFilter}
        />
        
        {isLoading ? (
          <LoadingSkeleton count={perPage} />
        ) : (
          <FlashcardsList 
            flashcards={flashcards}
            onEdit={(flashcard: FlashcardDTO) => {
              setSelectedFlashcard(flashcard);
              setIsEditModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        )}

        <div className="flex justify-center">
          <CustomPagination 
            currentPage={currentPage}
            perPage={perPage}
            total={total}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </div>

        <EditFlashcardDialog 
          flashcard={selectedFlashcard}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFlashcard(null);
          }}
          onSave={updateFlashcard}
        />

        <DeleteConfirmation 
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setFlashcardToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />

        <Toaster />
      </div>
    </ErrorBoundary>
  );
} 