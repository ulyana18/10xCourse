# API Endpoint Implementation Plan: Get Due Flashcards

## 1. Przegląd punktu końcowego
Endpoint zwraca karty do powtórki (flashcards) dla zalogowanego użytkownika, które są zaplanowane do przeglądu przed określoną datą. Wyniki są paginowane i zawierają zarówno dane karty, jak i informacje o ostatnim przeglądzie.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/flashcards/due`
- Parametry Query:
  - Opcjonalne:
    - `page` (number, default: 1): Numer strony
    - `per_page` (number, default: 20): Liczba elementów na stronę
    - `before_date` (string): Data w formacie ISO, przed którą karty są zaplanowane do przeglądu

## 3. Wykorzystywane typy
```typescript
// Parametry zapytania
type DueFlashcardsParams = {
  page?: number
  per_page?: number
  before_date?: string
}

// Model odpowiedzi
type DueFlashcardsResponse = {
  items: FlashcardWithReviewDTO[]
  total: number
  page: number
  per_page: number
}

// DTO dla karty z przeglądem
type FlashcardWithReviewDTO = {
  id: number
  front: string
  back: string
  source: 'ai-full' | 'ai-edited' | 'manual'
  created_at: string
  updated_at: string
  latest_review?: {
    id: number
    flashcard_id: number
    rating: number
    next_review_date: string
    ease_factor: number
    interval: number
    review_count: number
  }
}
```

## 4. Przepływ danych
1. Walidacja parametrów zapytania za pomocą Zod
2. Pobranie kontekstu użytkownika z Supabase Auth
3. Wykonanie zapytania do bazy danych:
   - JOIN między tabelami flashcards i flashcard_reviews
   - Filtrowanie po next_review_date i user_id
   - Zastosowanie paginacji
4. Mapowanie wyników do DTO
5. Zwrócenie odpowiedzi z metadanymi paginacji

## 5. Względy bezpieczeństwa
1. Uwierzytelnianie:
   - Wymagane uwierzytelnienie przez Supabase Auth
   - Weryfikacja tokena JWT w middleware
2. Autoryzacja:
   - RLS na poziomie bazy danych zapewnia dostęp tylko do własnych kart
   - Dodatkowa weryfikacja user_id w zapytaniu
3. Walidacja danych:
   - Sanityzacja parametrów zapytania
   - Walidacja formatu daty
   - Ograniczenie maksymalnej wielkości strony

## 6. Obsługa błędów
- 400 Bad Request:
  - Nieprawidłowy format daty
  - Nieprawidłowe parametry paginacji (ujemne wartości)
  - Zbyt duża wartość per_page
- 401 Unauthorized:
  - Brak tokena JWT
  - Nieważny token JWT
- 500 Internal Server Error:
  - Błędy zapytań do bazy danych
  - Nieoczekiwane błędy serwera

## 7. Rozważania dotyczące wydajności
1. Indeksy bazy danych:
   - Wykorzystanie indeksu na (user_id, next_review_date) w tabeli flashcard_reviews
   - Wykorzystanie indeksu na flashcard_id w tabeli flashcard_reviews
2. Optymalizacja zapytań:
   - Limit pobieranych rekordów przez LIMIT/OFFSET
   - Efektywne JOINy z wykorzystaniem indeksów
3. Cachowanie:
   - Możliwość cachowania wyników na poziomie aplikacji dla krótkich okresów
   - Implementacja ETags dla optymalizacji transferu

## 8. Etapy wdrożenia

1. Utworzenie schematu walidacji Zod:
```typescript
const dueFlashcardsParamsSchema = z.object({
  page: z.number().positive().optional().default(1),
  per_page: z.number().positive().max(100).optional().default(20),
  before_date: z.string().datetime().optional()
})
```

2. Implementacja serwisu:
```typescript
// src/lib/services/flashcards-due.ts
export class FlashcardService {
  async getDueFlashcards(
    client: SupabaseClient,
    userId: string,
    params: DueFlashcardsParams
  ): Promise<DueFlashcardsResponse> {
    const { page, per_page, before_date } = params
    const offset = (page - 1) * per_page
    
    // Implementacja zapytania
    const query = client
      .from('flashcards')
      .select(`
        *,
        latest_review:flashcard_reviews(
          id,
          flashcard_id,
          rating,
          next_review_date,
          ease_factor,
          interval,
          review_count
        )
      `)
      .eq('user_id', userId)
      .order('next_review_date', { ascending: true })
      .range(offset, offset + per_page - 1)

    if (before_date) {
      query.lte('next_review_date', before_date)
    }

    // ... reszta implementacji
  }
}
```

3. Implementacja endpointu:
```typescript
// src/pages/api/flashcards/due.ts
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const { supabase, user } = locals
    if (!user) return new Response('Unauthorized', { status: 401 })

    const params = dueFlashcardsParamsSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    )

    const service = new FlashcardService()
    const response = await service.getDueFlashcards(
      supabase,
      user.id,
      params
    )

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // ... obsługa błędów
  }
}
```

4. Dodanie testów:
   - Testy jednostkowe dla walidacji
   - Testy integracyjne dla serwisu
   - Testy end-to-end dla endpointu

5. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja typów i interfejsów

6. Wdrożenie:
   - Code review
   - Testy na środowisku staging
   - Deployment na produkcję 