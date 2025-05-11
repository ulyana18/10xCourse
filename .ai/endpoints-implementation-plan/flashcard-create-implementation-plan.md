# API Endpoint Implementation Plan: Create Flashcard

## 1. Przegląd punktu końcowego
Endpoint `/api/flashcards` umożliwia ręczne tworzenie pojedynczej fiszki. Użytkownik przesyła treść przedniej i tylnej strony fiszki, a system zapisuje ją w bazie danych i zwraca utworzoną fiszkę wraz z metadanymi. Endpoint wymaga uwierzytelnienia i waliduje długość wprowadzanego tekstu.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/flashcards`
- Parametry:
  - Wymagane:
    - `front`: tekst przedniej strony (max 200 znaków)
    - `back`: tekst tylnej strony (max 500 znaków)
- Request Body:
```json
{
  "front": "string",
  "back": "string"
}
```

## 3. Wykorzystywane typy
- **DTOs i Command Modele:**
  - `CreateFlashcardCommand`: zawiera pola `front` i `back`
  - `FlashcardDTO`: reprezentuje utworzoną fiszkę z metadanymi
- **Schematy walidacji Zod:**
  - `createFlashcardSchema`: definiuje reguły walidacji dla `front` i `back`
- **Dodatkowe typy:**
  - `ApiErrorResponse`: standardowy format odpowiedzi błędu

## 4. Szczegóły odpowiedzi
- Sukces (201 Created):
```json
{
  "id": "number",
  "front": "string",
  "back": "string",
  "created_at": "timestamp"
}
```
- Typowe kody błędów:
  - 400: Nieprawidłowe dane wejściowe
  - 401: Brak uwierzytelnienia
  - 500: Błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie POST z danymi (`front` i `back`).
2. Walidacja danych wejściowych przy użyciu Zod:
   - Weryfikacja długości `front` (max 200 znaków)
   - Weryfikacja długości `back` (max 500 znaków)
3. Konwersja danych do typu `CreateFlashcardCommand`.
4. Przekazanie danych do warstwy serwisowej (`createFlashcard` w `src/lib/services/flashcards.ts`), która:
   - Pobiera ID użytkownika z kontekstu Supabase
   - Tworzy nowy rekord w tabeli `Flashcards` z source='manual'
   - Zwraca utworzoną fiszkę jako `FlashcardDTO`
5. Zwrócenie odpowiedzi z kodem 201 i danymi utworzonej fiszki lub odpowiedni błąd.

## 6. Względy bezpieczeństwa
- Autoryzacja:
  - Weryfikacja tokenu Supabase przed przetwarzaniem żądania
  - Użycie klienta Supabase z context.locals
  - Konfiguracja RLS dla tabeli Flashcards
- Walidacja wejścia:
  - Użycie Zod do walidacji i sanityzacji danych wejściowych
  - Sprawdzanie długości tekstu przed zapisem do bazy
- CSRF:
  - Implementacja ochrony CSRF zgodnie z wytycznymi Astro

## 7. Obsługa błędów
- Implementacja wzorca early return dla warunków błędu
- Kody odpowiedzi:
  - 400: Zwracane przy nieprawidłowych danych wejściowych
  - 401: Brak lub nieprawidłowy token uwierzytelniający
  - 500: Błędy bazy danych lub serwera
- Format błędów zgodny z `ApiErrorResponse`
- Logowanie błędów krytycznych w systemie

## 8. Rozważania dotyczące wydajności
- Optymalizacja zapytań do bazy danych:
  - Użycie pojedynczego zapytania INSERT
  - Właściwe indeksy na kolumnach user_id i created_at
- Minimalizacja obciążenia pamięci:
  - Walidacja danych przed operacjami na bazie
  - Efektywne zarządzanie połączeniami Supabase

## 9. Etapy wdrożenia
1. Utworzenie endpointu API w pliku `src/pages/api/flashcards/create.ts`:
   - Implementacja metody POST
   - Konfiguracja prerender = false
2. Definicja schematu walidacji Zod w `src/lib/schemas/flashcard.ts`:
   - Reguły dla pól front i back
   - Komunikaty błędów walidacji
3. Implementacja logiki biznesowej w `src/lib/services/flashcard-create.ts`:
   - Metoda createFlashcard
   - Obsługa interakcji z bazą danych
4. Konfiguracja Supabase:
   - Polityki RLS dla tabeli Flashcards
   - Indeksy dla optymalizacji zapytań
5. Implementacja middleware uwierzytelniania:
   - Weryfikacja tokenu
   - Przekazywanie klienta Supabase przez context.locals
6. Testy:
   - Testy jednostkowe dla walidacji i logiki biznesowej
   - Testy integracyjne dla całego endpointu
7. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Przykłady użycia dla zespołu
8. Code review i optymalizacja:
   - Przegląd wydajności
   - Weryfikacja zgodności z wytycznymi projektu 