# API Endpoint Implementation Plan: Review Generated Flashcards

## 1. Przegląd punktu końcowego
Endpoint `/api/flashcards/review` służy do przetwarzania recenzji wygenerowanych fiszek. Użytkownik przesyła identyfikator sesji generowania oraz tablicę recenzji, gdzie każda recenzja zawiera akcję (akceptacja/odrzucenie/edycja) oraz opcjonalne zmodyfikowane treści fiszki. System aktualizuje statystyki sesji generowania i zapisuje zaakceptowane fiszki w bazie danych.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/flashcards/review`
- Parametry:
  - Wymagane:
    - `generation_id`: identyfikator sesji generowania
    - `reviews`: tablica obiektów recenzji, każdy zawierający:
      - `suggestion_id`: identyfikator sugerowanej fiszki
      - `action`: typ akcji ("accept" | "reject" | "edit")
      - `front`: (opcjonalne, wymagane dla edit) treść przedniej strony fiszki
      - `back`: (opcjonalne, wymagane dla edit) treść tylnej strony fiszki
- Request Body:
```json
{
  "generation_id": "number",
  "reviews": [
    {
      "suggestion_id": "number",
      "action": "accept|reject|edit",
      "front": "string",
      "back": "string"
    }
  ]
}
```

## 3. Wykorzystywane typy
- **DTOs i Command Modele:**
  - `ReviewFlashcardsCommand`: zawiera `generation_id` i tablicę `reviews`
  - `FlashcardReview`: reprezentuje pojedynczą recenzję
  - `ReviewFlashcardsResponse`: zawiera liczniki `accepted`, `rejected`, `edited`
- **Dodatkowe typy:**
  - `ApiErrorResponse`: standardowy format odpowiedzi błędu
  - `ReviewStats`: wewnętrzny typ dla śledzenia statystyk
  - `ReviewResult`: rozszerzenie ReviewStats o pole success i error

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
```json
{
  "accepted": "number",
  "rejected": "number",
  "edited": "number"
}
```
- Typowe kody błędów:
  - 400: Nieprawidłowe dane wejściowe
  - 401: Brak autoryzacji
  - 404: Nie znaleziono sesji generowania
  - 500: Błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie POST z danymi (`generation_id` i `reviews`).
2. Walidacja danych wejściowych przy użyciu Zod:
   - Weryfikacja poprawności `generation_id`
   - Weryfikacja struktury tablicy `reviews`
   - Dla akcji "edit" - weryfikacja długości pól `front` (max 200 znaków) i `back` (max 500 znaków)
3. Konwersja danych do typu `ReviewFlashcardsCommand`.
4. Przekazanie danych do warstwy serwisowej (`FlashcardReviewService`), która:
   - Weryfikuje istnienie i własność sesji generowania
   - Przetwarza każdą recenzję zgodnie z akcją
   - Aktualizuje statystyki w tabeli `FlashcardGenerationSessions`
   - Tworzy nowe fiszki w tabeli `Flashcards` dla zaakceptowanych sugestii
5. Zwrócenie odpowiedzi zawierającej `ReviewFlashcardsResponse` lub odpowiedni błąd.

## 6. Względy bezpieczeństwa
- Autoryzacja: Weryfikacja tożsamości użytkownika poprzez token Supabase Auth.
- Walidacja wejścia: Użycie Zod do walidacji danych wejściowych.
- Row Level Security (RLS): Zapewnienie dostępu tylko do własnych danych użytkownika.
- Sanityzacja danych: Czyszczenie danych wejściowych przed zapisem do bazy.

## 7. Obsługa błędów
- 400: Zwracane przy nieprawidłowych danych wejściowych (brak wymaganych pól, nieprawidłowe formaty).
- 401: Brak lub nieprawidłowy token autoryzacji.
- 404: Sesja generowania nie istnieje.
- 500: Błędy serwera, nieoczekiwane sytuacje.
- Rejestrowanie błędów: Krytyczne błędy logowane do `FlashcardGenerationErrorLogs`.

## 8. Rozważania dotyczące wydajności
- Transakcje bazodanowe dla zachowania spójności danych.
- Wsadowe przetwarzanie recenzji dla zminimalizowania liczby zapytań do bazy.
- Indeksy na kluczowych polach (`generation_id`, `user_id`).
- Możliwość buforowania danych sesji generowania.

## 9. Etapy wdrożenia
1. Utworzenie endpointu API w pliku `src/pages/api/flashcards/review.ts` z obsługą metody POST.
2. Implementacja schematu walidacji w `src/validation/flashcard-review.schema.ts`:
   ```typescript
   export const reviewSchema = z.object({
     generation_id: z.number(),
     reviews: z.array(z.object({
       suggestion_id: z.number(),
       action: z.enum(['accept', 'reject', 'edit']),
       front: z.string().max(200).optional(),
       back: z.string().max(500).optional()
     }))
   });
   ```
3. Implementacja serwisu w `src/lib/services/flashcard-review.ts`:
   ```typescript
   export class FlashcardReviewService {
     constructor(private readonly supabase: SupabaseClient) {}
     
     async reviewFlashcards(
       userId: string,
       command: ReviewFlashcardsCommand
     ): Promise<ReviewResult>;
   }
   ```
4. Integracja z bazą danych Supabase:
   - Aktualizacja statystyk w `FlashcardGenerationSessions`
   - Tworzenie zaakceptowanych fiszek w `Flashcards`
5. Implementacja mechanizmu weryfikacji autoryzacji użytkownika.
6. Testowanie endpointu:
   - Testy jednostkowe serwisu
   - Testy integracyjne
   - Testy wydajnościowe
7. Optymalizacja wydajności oraz przegląd kodu.
8. Dokumentacja wdrożenia oraz instrukcje dla zespołu. 