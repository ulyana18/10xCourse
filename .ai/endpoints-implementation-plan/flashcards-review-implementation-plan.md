# API Endpoint Implementation Plan: Submit Flashcard Review

## 1. Przegląd punktu końcowego
Endpoint służy do przesyłania oceny przeglądu fiszki (0-5) i obliczania następnych parametrów powtórek zgodnie z algorytmem SuperMemo 2. Aktualizuje lub tworzy nowy rekord przeglądu w bazie danych z obliczonymi parametrami spaced repetition.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/flashcards/{id}/review`
- Parametry ścieżki:
  - `id`: number (ID fiszki)
- Request Body:
```typescript
{
  rating: number // 0-5
}
```

## 3. Wykorzystywane typy
```typescript
// Command model
type CreateFlashcardReviewCommand = {
  flashcard_id: number;
  rating: number;
}

// Response DTO
type FlashcardReviewDTO = {
  id: number;
  flashcard_id: number;
  rating: number;
  next_review_date: string;
  ease_factor: number;
  interval: number;
  review_count: number;
}

// Error response
type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  }
}
```

## 4. Szczegóły odpowiedzi
Sukces (200 OK):
```typescript
{
  id: number;
  flashcard_id: number;
  rating: number;
  next_review_date: string;
  ease_factor: number;
  interval: number;
  review_count: number;
}
```

Błędy:
- 400 Bad Request: Nieprawidłowa ocena
- 404 Not Found: Fiszka nie znaleziona
- 401 Unauthorized: Brak autoryzacji
- 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Walidacja żądania i parametrów
2. Pobranie fiszki z bazy danych
3. Weryfikacja własności fiszki
4. Obliczenie parametrów spaced repetition
5. Utworzenie/aktualizacja rekordu przeglądu
6. Zwrócenie odpowiedzi

## 6. Względy bezpieczeństwa
1. Uwierzytelnianie:
   - Wymagane uwierzytelnienie Supabase
   - Token JWT w nagłówku Authorization

2. Autoryzacja:
   - Weryfikacja własności fiszki przez user_id
   - Wykorzystanie Row Level Security (RLS) w Supabase

3. Walidacja danych:
   - Sanityzacja parametrów ścieżki
   - Walidacja oceny (0-5)
   - Walidacja schematu JSON

4. Rate Limiting:
   - Limit 100 żądań na minutę (zgodnie z API Plan)

## 7. Obsługa błędów
1. Walidacja wejścia:
   ```typescript
   if (rating < 0 || rating > 5 || !Number.isInteger(rating)) {
     throw new BadRequestError('Invalid rating value');
   }
   ```

2. Obsługa błędów biznesowych:
   - Fiszka nie istnieje -> 404
   - Brak dostępu do fiszki -> 401
   - Błąd bazy danych -> 500

3. Standardowa struktura błędów:
   ```typescript
   {
     error: {
       code: string;
       message: string;
       details?: Record<string, unknown>;
     }
   }
   ```

## 8. Rozważania dotyczące wydajności
1. Indeksy bazy danych:
   - Indeks na FlashcardReviews(user_id, next_review_date)
   - Indeks na FlashcardReviews.flashcard_id

2. Optymalizacje:
   - Pojedyncze zapytanie do bazy danych
   - Wykorzystanie przygotowanych zapytań
   - Cachowanie parametrów algorytmu

## 9. Etapy wdrożenia

1. Utworzenie serwisu:
   ```typescript
   // src/lib/services/flashcards-review.service.ts
   export class FlashcardsReviewService {
     constructor(private readonly supabase: SupabaseClient) {}
     
     async submitReview(userId: string, flashcardId: number, rating: number): Promise<FlashcardReviewDTO>;
   }
   ```

2. Implementacja algorytmu SuperMemo 2:
   ```typescript
   // src/lib/services/spaced-repetition.service.ts
   export class SpacedRepetitionService {
     calculateNextReview(rating: number, previousEaseFactor: number, previousInterval: number): SpacedRepetitionParams;
   }
   ```

3. Utworzenie endpointu:
   ```typescript
   // src/pages/api/flashcards/[id]/review.ts
   export const POST: APIRoute = async ({ params, request, locals }) => {
     // Implementation
   };
   ```

4. Implementacja walidacji:
   ```typescript
   // src/lib/validation/flashcard-review.schema.ts
   export const flashcardReviewSchema = z.object({
     rating: z.number().int().min(0).max(5)
   });
   ```

5. Dodanie testów:
   - Testy jednostkowe dla serwisów
   - Testy integracyjne dla endpointu
   - Testy wydajnościowe

6. Dokumentacja:
   - Komentarze JSDoc
   - README dla endpointu
   - Przykłady użycia

7. Wdrożenie:
   - Code review
   - Testy na środowisku staging
   - Deployment na produkcję 