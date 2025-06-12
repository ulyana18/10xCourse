# API Endpoint Implementation Plan: Get Flashcard Review History

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania historii przeglądów dla konkretnej fiszki. Zwraca paginowaną listę przeglądów zawierającą szczegóły takie jak ocena, następna data przeglądu, współczynnik łatwości i interwał. Endpoint wymaga uwierzytelnienia i autoryzacji, zapewniając dostęp tylko do fiszek należących do zalogowanego użytkownika.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/flashcards/{id}/reviews`
- Parametry:
  - Wymagane:
    - `id` (path parameter) - identyfikator fiszki
  - Opcjonalne:
    - `page` (query parameter) - numer strony (domyślnie: 1)
    - `per_page` (query parameter) - liczba elementów na stronę (domyślnie: 20)
- Headers:
  - `Authorization: Bearer <token>` - token JWT z Supabase Auth

## 3. Wykorzystywane typy
```typescript
// Typy z src/types.ts
type PaginationParams = {
  page?: number
  per_page?: number
}

type FlashcardReviewDTO = {
  id: number
  flashcard_id: number
  rating: number
  next_review_date: string
  ease_factor: number
  interval: number
  review_count: number
  created_at: string
}

type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  per_page: number
}

// Nowe typy do zdefiniowania
interface GetFlashcardReviewsParams extends PaginationParams {
  flashcardId: number
  userId: string
}
```

## 4. Szczegóły odpowiedzi
Sukces (200 OK):
```typescript
{
  items: FlashcardReviewDTO[]
  total: number
  page: number
  per_page: number
}
```

## 5. Przepływ danych
1. Walidacja parametrów wejściowych za pomocą Zod
2. Pobranie kontekstu użytkownika z Supabase Auth
3. Weryfikacja istnienia fiszki i uprawnień użytkownika
4. Pobranie historii przeglądów z bazy danych z paginacją
5. Transformacja danych do formatu DTO
6. Zwrócenie odpowiedzi

## 6. Względy bezpieczeństwa
1. Uwierzytelnianie:
   - Wymagany ważny token JWT w nagłówku Authorization
   - Weryfikacja tokenu przez Supabase Auth middleware

2. Autoryzacja:
   - Sprawdzenie czy fiszka należy do zalogowanego użytkownika
   - Wykorzystanie Row Level Security (RLS) w Supabase

3. Walidacja danych:
   - Sanityzacja parametrów ścieżki i zapytania
   - Walidacja typów i zakresów wartości
   - Zabezpieczenie przed SQL injection

## 7. Obsługa błędów
1. 400 Bad Request:
   - Nieprawidłowe parametry paginacji
   - Nieprawidłowy format ID fiszki

2. 401 Unauthorized:
   - Brak tokenu JWT
   - Nieważny token JWT

3. 404 Not Found:
   - Fiszka nie istnieje

4. 403 Forbidden:
   - Fiszka należy do innego użytkownika

5. 500 Internal Server Error:
   - Błędy bazy danych
   - Nieoczekiwane błędy serwera

## 8. Rozważania dotyczące wydajności
1. Indeksy bazy danych:
   - Wykorzystanie istniejącego indeksu na FlashcardReviews.flashcard_id
   - Wykorzystanie indeksu na FlashcardReviews(user_id, next_review_date)

2. Paginacja:
   - Limit rozmiaru strony do rozsądnej wartości
   - Wykorzystanie efektywnej paginacji SQL

3. Cachowanie:
   - Możliwość dodania cache'owania odpowiedzi na poziomie API
   - Wykorzystanie ETags dla warunkowych żądań

## 9. Etapy wdrożenia
1. Utworzenie schematu walidacji Zod:
   ```typescript
   const reviewsQuerySchema = z.object({
     page: z.number().optional().default(1),
     per_page: z.number().optional().default(20)
   });
   ```

2. Implementacja FlashcardReviewService:
   ```typescript
   class FlashcardReviewService {
     async getReviewHistory(params: GetFlashcardReviewsParams): Promise<PaginatedResponse<FlashcardReviewDTO>>;
   }
   ```

3. Utworzenie endpointu Astro:
   ```typescript
   // src/pages/api/flashcards/[id]/reviews.ts
   export const prerender = false;
   
   export async function GET({ params, request, locals }) {
     // Implementacja logiki endpointu
   }
   ```

4. Implementacja logiki autoryzacji:
   - Dodanie middleware do weryfikacji tokenu
   - Implementacja sprawdzania własności fiszki

5. Implementacja zapytań do bazy danych:
   - Zapytanie sprawdzające istnienie fiszki
   - Zapytanie pobierające historię przeglądów z paginacją

6. Dodanie obsługi błędów:
   - Implementacja middleware do obsługi błędów
   - Dodanie logiki try-catch

7. Testy:
   - Testy jednostkowe dla service
   - Testy integracyjne dla endpointu
   - Testy wydajnościowe dla paginacji

8. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja typów i interfejsów 