# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego
Endpoint `/api/flashcards/delete/{id}` umożliwia użytkownikowi usunięcie pojedynczej fiszki. Operacja wymaga uwierzytelnienia, a użytkownik może usunąć tylko własne fiszki. Po pomyślnym usunięciu zwracany jest kod 204 No Content.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- Struktura URL: `/api/flashcards/{id}`
- Parametry:
  - Wymagane:
    - `id`: identyfikator fiszki (parametr ścieżki)
- Request Body: brak

## 3. Wykorzystywane typy
- **Typy bazowe:**
  - `FlashcardEntity` z `Database["public"]["Tables"]["flashcards"]["Row"]`
- **Typy błędów:**
  - `ApiErrorResponse` dla standardowej obsługi błędów
- **Typy Zod:**
  - Schema walidacji parametru id

## 4. Szczegóły odpowiedzi
- Sukces (204 No Content):
  - Brak treści odpowiedzi
- Błędy:
  - 401: Brak uwierzytelnienia
  - 403: Brak uprawnień do usunięcia fiszki
  - 404: Fiszka nie znaleziona
  - 500: Błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie DELETE z parametrem id.
2. Walidacja parametru id przy użyciu Zod.
3. Pobranie kontekstu użytkownika z Supabase.
4. Przekazanie do warstwy serwisowej (np. `deleteFlashcard` w `src/lib/services/flashcard-delete.ts`):
   - Weryfikacja istnienia fiszki
   - Weryfikacja właściciela fiszki
   - Wykonanie operacji usunięcia w bazie danych
5. Zwrócenie odpowiedniej odpowiedzi HTTP

## 6. Względy bezpieczeństwa
- Autoryzacja:
  - Weryfikacja tokenu JWT z Supabase
  - Sprawdzenie czy użytkownik jest właścicielem fiszki
- Walidacja:
  - Sanityzacja parametru id przed użyciem w zapytaniach
  - Użycie parametryzowanych zapytań do bazy danych
- RLS:
  - Wykorzystanie polityk RLS Supabase do dodatkowej warstwy bezpieczeństwa

## 7. Obsługa błędów
- Walidacja wejścia:
  - Nieprawidłowy format id: 400 Bad Request
- Autoryzacja:
  - Brak tokenu: 401 Unauthorized
  - Brak uprawnień: 403 Forbidden
- Logika biznesowa:
  - Fiszka nie istnieje: 404 Not Found
- Błędy systemowe:
  - Błąd bazy danych: 500 Internal Server Error
  - Nieoczekiwane wyjątki: 500 Internal Server Error

## 8. Rozważania dotyczące wydajności
- Wykorzystanie indeksu na kolumnie id w tabeli flashcards
- Minimalizacja liczby zapytań do bazy danych:
  - Połączenie sprawdzenia istnienia i własności fiszki w jednym zapytaniu
- Wykorzystanie soft delete jeśli wymagane w przyszłości

## 9. Etapy wdrożenia
1. Utworzenie endpointu w `src/pages/api/flashcards/delete/[id].ts`:
   ```typescript
   export const prerender = false
   
   export async function DELETE({ params, locals }) {
     // implementacja
   }
   ```

2. Implementacja schematu walidacji w `src/lib/validators/flashcard-delete.ts`:
   ```typescript
   export const flashcardIdSchema = z.object({
     id: z.number().positive().int()
   })
   ```

3. Dodanie metody w serwisie `src/lib/services/flashcard-delete.ts`:
   ```typescript
   export async function deleteFlashcard(
     supabase: SupabaseClient,
     userId: string,
     flashcardId: number
   ): Promise<void>
   ```

4. Implementacja polityki RLS w Supabase:
   ```sql
   CREATE POLICY "Users can delete own flashcards"
   ON public.flashcards
   FOR DELETE
   USING (auth.uid() = user_id);
   ```

5. Implementacja obsługi błędów i walidacji:
   - Utworzenie klas błędów
   - Implementacja middleware do obsługi błędów

6. Testy:
   - Testy jednostkowe dla walidacji i logiki biznesowej
   - Testy integracyjne dla całego endpointu
   - Testy bezpieczeństwa

7. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja wewnętrzna kodu

8. Code review i optymalizacja:
   - Przegląd implementacji pod kątem bezpieczeństwa
   - Optymalizacja zapytań do bazy danych
   - Weryfikacja zgodności z konwencjami projektu 