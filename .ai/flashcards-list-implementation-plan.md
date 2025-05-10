# API Endpoint Implementation Plan: List Flashcards

## 1. Przegląd punktu końcowego
Endpoint `/api/flashcards` umożliwia pobranie listy fiszek użytkownika z obsługą paginacji, filtrowania według źródła oraz sortowania. Endpoint zwraca fiszki należące do zalogowanego użytkownika, respektując zasady Row Level Security (RLS) Supabase.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/flashcards/list`
- Parametry Query:
  - Opcjonalne:
    - `page`: number (domyślnie: 1)
      - Walidacja: liczba całkowita > 0
    - `per_page`: number (domyślnie: 20)
      - Walidacja: 1 <= per_page <= 100
    - `source`: string (ai-full|ai-edited|manual)
      - Walidacja: zgodność z enum flashcard_source
    - `sort`: string (created_at|updated_at)
      - Walidacja: dokładne dopasowanie do dozwolonych wartości
    - `order`: string (asc|desc)
      - Walidacja: dokładne dopasowanie do dozwolonych wartości

## 3. Wykorzystywane typy
- **Query Params i Response:**
  - `FlashcardListParams`: parametry zapytania (page, per_page, source, sort, order)
  - `FlashcardDTO`: reprezentacja pojedynczej fiszki w odpowiedzi
  - `FlashcardListResponse`: odpowiedź zawierająca tablicę `FlashcardDTO` oraz metadane paginacji
  - `PaginatedResponse<T>`: generyczny typ dla odpowiedzi z paginacją
- **Schematy walidacji Zod:**
  - `flashcardListParamsSchema`: schemat walidacji parametrów zapytania

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
```typescript
{
  items: FlashcardDTO[]  // Lista fiszek
  total: number         // Całkowita liczba fiszek
  page: number         // Aktualna strona
  per_page: number    // Liczba elementów na stronę
}
```
- Kody błędów:
  - 400: Nieprawidłowe parametry zapytania
  - 401: Brak autoryzacji
  - 500: Błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie GET z parametrami query.
2. Walidacja parametrów przy użyciu Zod:
   - Konwersja i walidacja typów
   - Ustawienie wartości domyślnych
   - Sprawdzenie zakresu wartości
3. Pobranie kontekstu Supabase z `context.locals`
4. Przekazanie parametrów do warstwy serwisowej (`src/lib/services/flashcards-list.ts`):
   ```typescript
   async function listFlashcards(
     supabase: SupabaseClient,
     params: FlashcardListParams
   ): Promise<FlashcardListResponse>
   ```
5. Service wykonuje:
   - Budowę zapytania SQL z uwzględnieniem filtrów i sortowania
   - Pobranie danych z paginacją
   - Mapowanie wyników do DTO
6. Zwrócenie sformatowanej odpowiedzi

## 6. Względy bezpieczeństwa
- Autoryzacja:
  - Weryfikacja tokenu Supabase w middleware
  - Wykorzystanie RLS do filtrowania danych per użytkownik
- Walidacja danych:
  - Ścisła walidacja parametrów query przez Zod
  - Sanityzacja parametrów sortowania i filtrowania
- Rate Limiting:
  - Implementacja limitu zapytań per użytkownik
  - Wykorzystanie nagłówków rate limit

## 7. Obsługa błędów
- 400: Zwracane gdy:
  - Nieprawidłowy format parametrów
  - Wartości poza dozwolonym zakresem
  - Niedozwolone wartości dla source/sort/order
- 401: Brak lub nieprawidłowy token autoryzacji
- 500: Błędy bazy danych lub nieoczekiwane wyjątki
- Format odpowiedzi błędu:
```typescript
{
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
```

## 8. Rozważania dotyczące wydajności
- Indeksy bazy danych:
  - Indeks na kolumnie user_id
  - Indeksy na kolumnach używanych do sortowania (created_at, updated_at)
- Optymalizacja zapytań:
  - Limit pobieranych kolumn do niezbędnego minimum
  - Wykorzystanie COUNT(*) OVER() dla total bez dodatkowego zapytania
- Caching:
  - Implementacja cache-control dla odpowiedzi
  - Możliwość dodania Redis cache dla często używanych zapytań

## 9. Etapy wdrożenia
1. Utworzenie endpointu w `src/pages/api/flashcards/list.ts`:
   - Implementacja handlera GET
   - Konfiguracja export const prerender = false
2. Implementacja schematów walidacji Zod w `src/lib/validators/flashcards-list.ts`:
   ```typescript
   export const flashcardListParamsSchema = z.object({
     page: z.number().int().positive().default(1),
     per_page: z.number().int().min(1).max(100).default(20),
     source: z.enum(['ai-full', 'ai-edited', 'manual']).optional(),
     sort: z.enum(['created_at', 'updated_at']).default('created_at'),
     order: z.enum(['asc', 'desc']).default('desc')
   })
   ```
3. Rozszerzenie `src/lib/services/flashcards-list.ts`:
   - Implementacja metody listFlashcards
   - Dodanie testów jednostkowych
4. Konfiguracja indeksów w bazie danych:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
   CREATE INDEX IF NOT EXISTS idx_flashcards_created_at ON flashcards(created_at);
   CREATE INDEX IF NOT EXISTS idx_flashcards_updated_at ON flashcards(updated_at);
   ```
5. Implementacja testów integracyjnych w `src/tests/api/flashcards.test.ts`
6. Konfiguracja rate limitingu w middleware
7. Dokumentacja API w OpenAPI/Swagger
8. Code review i testy wydajnościowe
9. Wdrożenie na środowisko testowe 