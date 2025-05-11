# API Endpoint Implementation Plan: List Generation Errors

## 1. Przegląd punktu końcowego
Endpoint `/api/statistics/generation/errors` umożliwia pobranie paginowanej listy błędów generacji fiszek. Użytkownicy mogą filtrować błędy według zakresu dat i kodu błędu. Endpoint zwraca tylko błędy należące do zalogowanego użytkownika, zgodnie z zasadami bezpieczeństwa Supabase.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/statistics/generation/errors`
- Parametry Query:
  - Opcjonalne:
    - `page`: number (domyślnie: 1)
    - `per_page`: number (domyślnie: 20)
    - `start_date`: string (format ISO)
    - `end_date`: string (format ISO)
    - `error_code`: string
- Request Body: brak

## 3. Wykorzystywane typy
- **DTOs i Command Modele:**
  - `GenerationErrorListParams`: parametry filtrowania i paginacji
  - `GenerationErrorDTO`: reprezentacja pojedynczego błędu
  - `GenerationErrorListResponse`: paginowana odpowiedź z błędami
  - `PaginatedResponse<T>`: generyczny typ dla paginowanych odpowiedzi
  - `ApiErrorResponse`: standardowy format odpowiedzi błędu

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
```json
{
  "items": [
    {
      "id": "number",
      "model": "string",
      "source_text_hash": "string",
      "source_text_length": "number",
      "error_code": "string",
      "error_message": "string",
      "created_at": "timestamp"
    }
  ],
  "total": "number",
  "page": "number",
  "per_page": "number"
}
```
- Typowe kody błędów:
  - 400: Nieprawidłowe parametry (format daty, zakres dat)
  - 401: Brak autoryzacji
  - 500: Błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie GET z parametrami query.
2. Walidacja parametrów przy użyciu Zod:
   - Sprawdzenie formatu dat ISO
   - Sprawdzenie poprawności zakresu dat
   - Walidacja parametrów paginacji
3. Przekazanie zwalidowanych parametrów do warstwy serwisowej (funkcja `listGenerationErrors` w `src/lib/services/statistics-errors.ts`).
4. Serwis:
   - Buduje zapytanie SQL z uwzględnieniem filtrów
   - Wykonuje zapytanie do tabeli `FlashcardGenerationErrorLogs`
   - Transformuje wyniki do formatu DTO
   - Oblicza metadane paginacji
5. Zwrócenie odpowiedzi w formacie `GenerationErrorListResponse`.

## 6. Względy bezpieczeństwa
- Autoryzacja:
  - Weryfikacja tokenu dostępu Supabase
  - Wykorzystanie Row Level Security (RLS) do filtrowania po user_id
- Walidacja wejścia:
  - Sanityzacja parametrów query przed użyciem w zapytaniach SQL
  - Walidacja formatu dat ISO
  - Walidacja zakresów liczbowych dla paginacji
- Rate limiting:
  - Implementacja limitu żądań na poziomie endpointu

## 7. Obsługa błędów
- 400: Zwracane gdy:
  - Nieprawidłowy format daty ISO
  - start_date > end_date
  - Nieprawidłowe parametry paginacji (ujemne wartości)
- 401: Brak tokenu autoryzacji lub nieważny token
- 500: Błędy bazy danych lub nieoczekiwane wyjątki
- Logowanie błędów:
  - Wszystkie błędy 500 powinny być logowane do systemu
  - Błędy walidacji nie wymagają logowania

## 8. Rozważania dotyczące wydajności
- Indeksy bazy danych:
  - Indeks na kolumnie created_at dla efektywnego filtrowania po datach
  - Indeks na kolumnie error_code dla szybkiego filtrowania
- Optymalizacja zapytań:
  - Użycie COUNT(*) OVER() dla uzyskania total_count w jednym zapytaniu
  - Limit pobieranych rekordów zgodny z per_page
- Cache:
  - Możliwość cachowania wyników dla popularnych zakresów dat
  - Cache invalidation przy nowych błędach

## 9. Etapy wdrożenia
1. Utworzenie endpointu w `src/pages/api/statistics/generation/errors.ts`:
   ```typescript
   export const prerender = false;
   
   export async function GET({ url, locals }) {
     // Implementacja endpointu
   }
   ```

2. Implementacja schematu walidacji w `src/lib/validators/statistics-errors.ts`:
   ```typescript
   export const generationErrorListParamsSchema = z.object({
     page: z.number().optional().default(1),
     per_page: z.number().optional().default(20),
     start_date: z.string().datetime().optional(),
     end_date: z.string().datetime().optional(),
     error_code: z.string().optional()
   });
   ```

3. Utworzenie serwisu w `src/lib/services/statistics-errors.ts`:
   ```typescript
   export class StatisticsService {
     async listGenerationErrors(params: GenerationErrorListParams): Promise<GenerationErrorListResponse> {
       // Implementacja logiki serwisu
     }
   }
   ```

4. Implementacja zapytań Supabase w serwisie:
   - Budowa dynamicznego query buildera
   - Obsługa filtrów i paginacji
   - Mapowanie wyników do DTO

5. Dodanie testów:
   - Testy jednostkowe dla walidacji
   - Testy integracyjne dla endpointu
   - Testy wydajnościowe dla dużych zbiorów danych

6. Konfiguracja bezpieczeństwa:
   - Implementacja RLS policies w Supabase
   - Konfiguracja rate limitingu

7. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja typów i schematów

8. Code review i optymalizacja:
   - Przegląd wydajności zapytań
   - Weryfikacja obsługi błędów
   - Sprawdzenie zgodności z konwencjami projektu 