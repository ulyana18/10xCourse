import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { FlashcardDTO, FlashcardListParams, FlashcardListResponse } from '@/types';

interface UseFlashcardsProps {
  initialPerPage?: number;
}

interface UseFlashcardsState {
  flashcards: FlashcardDTO[];
  total: number;
  currentPage: number;
  perPage: number;
  isLoading: boolean;
  filter?: FlashcardListParams['source'];
  sort: FlashcardListParams['sort'];
  order: FlashcardListParams['order'];
}

interface UseFlashcardsActions {
  fetchFlashcards: () => Promise<void>;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setFilter: (filter: FlashcardListParams['source'] | undefined) => void;
  deleteFlashcard: (id: number) => Promise<void>;
  updateFlashcard: (id: number, data: { front: string; back: string }) => Promise<void>;
}

export function useFlashcards({ initialPerPage = 10 }: UseFlashcardsProps = {}): UseFlashcardsState & UseFlashcardsActions {
  const [state, setState] = useState<UseFlashcardsState>({
    flashcards: [],
    total: 0,
    currentPage: 1,
    perPage: initialPerPage,
    isLoading: false,
    sort: 'created_at',
    order: 'desc'
  });

  const fetchFlashcards = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const params = {
        page: state.currentPage.toString(),
        per_page: state.perPage.toString(),
        sort: state.sort,
        order: state.order,
      } as Record<string, string>;

      if (state.filter) {
        params.source = state.filter;
      }

      const searchParams = new URLSearchParams(params);
      const response = await fetch(`/api/flashcards/list?${searchParams}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch flashcards');
      }

      const data: FlashcardListResponse = await response.json();
      setState(prev => ({
        ...prev,
        flashcards: data.items,
        total: data.total,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error(error instanceof Error ? error.message : 'Failed to fetch flashcards');
    }
  }, [state.currentPage, state.perPage, state.filter, state.sort, state.order]);

  const setCurrentPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    setState(prev => ({ ...prev, perPage, currentPage: 1 }));
  }, []);

  const setFilter = useCallback((filter: FlashcardListParams['source'] | undefined) => {
    setState(prev => ({ ...prev, filter, currentPage: 1 }));
  }, []);

  const deleteFlashcard = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete flashcard');
      }

      toast.success('Flashcard deleted successfully');
      // Refresh the list after deletion
      fetchFlashcards();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete flashcard');
    }
  }, [fetchFlashcards]);

  const updateFlashcard = useCallback(async (id: number, data: { front: string; back: string }) => {
    try {
      const response = await fetch(`/api/flashcards/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update flashcard');
      }

      toast.success('Flashcard updated successfully');
      // Refresh the list after update
      fetchFlashcards();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update flashcard');
    }
  }, [fetchFlashcards]);

  return {
    ...state,
    fetchFlashcards,
    setCurrentPage,
    setPerPage,
    setFilter,
    deleteFlashcard,
    updateFlashcard,
  };
} 