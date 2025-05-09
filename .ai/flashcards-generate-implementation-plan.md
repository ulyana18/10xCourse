# API Endpoint Implementation Plan: Generate Flashcards

## 1. Przegląd punktu końcowego
Endpoint `/api/flashcards/generate` umożliwia generowanie propozycji fiszek na podstawie dostarczonego tekstu źródłowego. Użytkownik przesyła tekst (o długości między 1,000 a 10,000 znaków), identyfikator modelu jest ustawiony na sztywno (gpt4), a system zwraca wygenerowane propozycje fiszek wraz z identyfikatorem sesji generacji.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/flashcards/generate`
- Parametry:
  - Wymagane:
    - `source_text`: tekst źródłowy, długość między 1,000 a 10,000 znaków
    - `model`: identyfikator modelu używanego do generacji
- Request Body:
```json
{
  "source_text": "string",
  "model": "string"
}
```

## 3. Wykorzystywane typy
- **DTOs i Command Modele:**
  - `GenerateFlashcardsCommand`: zawiera pola `source_text` i `model`
  - `GenerateFlashcardsResponse`: zawiera `generation_id` oraz tablicę `suggestions` (każdy element typu `FlashcardSuggestion` z polami `id`, `front`, `back`)
- **Dodatkowe typy:**
  - `ApiErrorResponse`: standardowy format odpowiedzi błędu

## 4. Szczegóły odpowiedzi
- Sukces (201 Created):
```json
{
  "generation_id": number,
  "suggestions": [
    {
      "id": number,
      "front": "string",
      "back": "string"
    }
  ]
}
```
- Typowe kody błędów:
  - 400: Niepoprawna długość `source_text`
  - 422: Błąd generacji
  - 429: Przekroczony limit żądań
  - 500: Błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie POST z danymi (`source_text` i `model`).
2. Walidacja danych wejściowych przy użyciu narzędzia (np. Zod) – weryfikacja długości `source_text` (od 1,000 do 10,000 znaków).
3. Konwersja danych do typu `GenerateFlashcardsCommand`.
4. Przekazanie danych do warstwy serwisowej (np. funkcja `generateFlashcards` w `src/lib/services/flashcards.ts`), która:
   - Inicjalizuje i zapisuje sesję generacji w tabeli `FlashcardGenerationSessions` (uwzględniając dane użytkownika, model, długość tekstu oraz liczbę generowanych fiszek).
   - Wywołuje proces generacji fiszek na podstawie wejściowego tekstu.
   - W przypadku błędu, rejestruje szczegóły w tabeli `FlashcardGenerationErrorLogs`.
5. Zwrócenie odpowiedzi zawierającej `GenerateFlashcardsResponse` lub odpowiedni błąd.

## 6. Względy bezpieczeństwa
- Autoryzacja: Weryfikacja tożsamości użytkownika przed przetwarzaniem żądania (np. poprzez token dostępu z Supabase).
- Walidacja wejścia: Użycie Zod lub innej biblioteki do walidacji danych wejściowych.
- Ochrona przed atakami typu injection poprzez stosowanie parametrów w zapytaniach do bazy danych.

## 7. Obsługa błędów
- 400: Zwracane, gdy `source_text` nie spełnia wymogów długości.
- 422: Zwracane, gdy proces generacji fiszek napotyka na błąd.
- 429: Zwracane, gdy użytkownik przekroczy limit żądań.
- 500: Błąd serwera, nieoczekiwane sytuacje – szczegóły logowane w systemie.
- Rejestrowanie błędów: Wszystkie błędy krytyczne powinny być logowane zarówno do systemu logowania, jak i do tabeli `FlashcardGenerationErrorLogs` z odpowiednimi kodami błędów i wiadomościami.

## 8. Rozważania dotyczące wydajności
- Asynchroniczne przetwarzanie generacji fiszek, aby nie blokować głównego wątku.
- Optymalizacja zapytań do bazy danych, szczególnie przy zapisie sesji generacji i logowaniu błędów.
- Możliwość wdrożenia kolejkowania zadań w przypadku operacji wymagających dłuższego czasu przetwarzania.

## 9. Etapy wdrożenia
1. Utworzenie endpointu API w pliku `src/pages/api/flashcards/generate.ts` z obsługą metody POST.
2. Zdefiniowanie schematu walidacji wejściowych przy użyciu Zod (minimalna i maksymalna długość `source_text`).
3. Implementacja logiki biznesowej w warstwie serwisowej (np. w `src/lib/services/flashcards.ts`).
4. Integracja z bazą danych Supabase:
   - Zapis sesji generacji w tabeli `FlashcardGenerationSessions`.
   - Rejestracja błędów w tabeli `FlashcardGenerationErrorLogs`.
5. Implementacja mechanizmu weryfikacji autoryzacji użytkownika.
6. Testowanie endpointu: testy jednostkowe oraz integracyjne.
7. Optymalizacja wydajności oraz przegląd kodu.
8. Dokumentacja wdrożenia oraz przekazanie szczegółowych instrukcji zespołowi programistów. 