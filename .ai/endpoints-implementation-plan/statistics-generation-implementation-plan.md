# API Endpoint Implementation Plan: Generation Statistics

## 1. Przegląd punktu końcowego
Endpoint `/api/statistics/generation` dostarcza zagregowane statystyki dotyczące generacji fiszek dla zalogowanego użytkownika. Dane są pobierane z tabeli `FlashcardGenerationSessions` i zawierają informacje o całkowitej liczbie wygenerowanych fiszek oraz ich statusie (zaakceptowane bez edycji, zaakceptowane z edycją, odrzucone).

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/statistics/generation`
- Parametry: Brak
- Wymagany nagłówek autoryzacji (obsługiwany przez Supabase)

## 3. Wykorzystywane typy
- **DTOs i Response Models:**
  - `GenerationStatisticsResponse`: typ odpowiedzi zawierający pola:
    - `total_generated`: number
    - `accepted_unedited`: number
    - `accepted_edited`: number
    - `rejected`: number
- **Typy pomocnicze:**
  - `ApiErrorResponse`: standardowy format odpowiedzi błędu

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
```json
{
  "total_generated": number,
  "accepted_unedited": number,
  "accepted_edited": number,
  "rejected": number
}
```
- Typowe kody błędów:
  - 401: Brak autoryzacji
  - 500: Błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie GET.
2. Weryfikacja autoryzacji użytkownika poprzez Supabase middleware.
3. Przekazanie żądania do warstwy serwisowej (`src/lib/services/statistics.ts`):
   - Pobranie supabase client z context.locals.
   - Wykonanie zapytania agregującego do tabeli `FlashcardGenerationSessions`:
     ```sql
     SELECT 
       SUM(generated_count) as total_generated,
       SUM(accepted_unedited_count) as accepted_unedited,
       SUM(accepted_edited_count) as accepted_edited,
       SUM(rejected_count) as rejected
     FROM flashcard_generation_sessions
     WHERE user_id = :current_user_id
     ```
   - Mapowanie wyników do typu `GenerationStatisticsResponse`.
4. Zwrócenie odpowiedzi z danymi statystycznymi lub odpowiednim błędem.

## 6. Względy bezpieczeństwa
- Autoryzacja:
  - Wykorzystanie Supabase Auth do weryfikacji tożsamości użytkownika.
  - Użycie RLS (Row Level Security) w bazie danych:
    ```sql
    CREATE POLICY "Users can only view their own statistics"
    ON public.flashcard_generation_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
    ```
- Walidacja:
  - Weryfikacja poprawności typów zwracanych z bazy danych.
  - Sanityzacja danych przed zwróceniem do klienta.

## 7. Obsługa błędów
- 401: Zwracane gdy brak tokenu autoryzacji lub token jest nieprawidłowy.
- 500: Błąd serwera, nieoczekiwane sytuacje:
  - Błędy połączenia z bazą danych.
  - Błędy podczas agregacji danych.
- Logowanie:
  - Wszystkie błędy krytyczne powinny być logowane do systemu logowania.
  - Użycie standardowego formatu błędu API (`ApiErrorResponse`).

## 8. Rozważania dotyczące wydajności
- Optymalizacja zapytań do bazy danych:
  - Dodanie indeksów na kolumnie user_id w tabeli FlashcardGenerationSessions.
  - Wykorzystanie materialized views dla często odpytywanych statystyk (jeśli potrzebne).
- Cache'owanie:
  - Implementacja cache'owania na poziomie aplikacji dla częstych żądań.
  - Ustawienie odpowiednich nagłówków cache control.

## 9. Etapy wdrożenia
1. Utworzenie endpointu API w pliku `src/pages/api/statistics/generation.ts`:
   ```typescript
   export const prerender = false;
   
   export async function GET({ locals }) {
     // Implementation
   }
   ```

2. Implementacja serwisu statystyk w `src/lib/services/statistics.ts`:
   ```typescript
   export class StatisticsService {
     constructor(private supabase: SupabaseClient) {}
     
     async getGenerationStatistics(userId: string): Promise<GenerationStatisticsResponse> {
       // Implementation
     }
   }
   ```

3. Dodanie polityki RLS do tabeli `FlashcardGenerationSessions`.

4. Implementacja obsługi błędów i logowania.

5. Dodanie testów:
   - Testy jednostkowe dla `StatisticsService`.
   - Testy integracyjne dla endpointu.
   - Testy wydajnościowe dla zapytań agregujących.

6. Optymalizacja wydajności:
   - Dodanie indeksów w bazie danych.
   - Implementacja cache'owania.

7. Code review i dokumentacja:
   - Przegląd implementacji pod kątem zgodności z zasadami.
   - Aktualizacja dokumentacji API.
   - Dodanie komentarzy do kodu.

8. Wdrożenie:
   - Migracja bazy danych (indeksy, polityki RLS).
   - Deployment endpointu.
   - Monitoring początkowy pod kątem wydajności i błędów. 