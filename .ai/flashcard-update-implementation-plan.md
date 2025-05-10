# API Endpoint Implementation Plan: Update Flashcard

## 1. Przegląd punktu końcowego
Endpoint `/api/flashcards/{id}` umożliwia aktualizację istniejącej fiszki. Użytkownik może zaktualizować tekst na przedniej (front) i/lub tylnej (back) stronie fiszki. System weryfikuje własność fiszki, aktualizuje znacznik czasu i zwraca zaktualizowane dane.

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: `/api/flashcards/update/{id}`
- Parametry ścieżki:
  - `id`: identyfikator fiszki do aktualizacji
- Request Body:
```json
{
  "front": "string", // opcjonalne
  "back": "string"   // opcjonalne
}
```
- Walidacja:
  - Przynajmniej jedno pole (front lub back) musi być dostarczone
  - front: maksymalnie 200 znaków
  - back: maksymalnie 500 znaków

## 3. Wykorzystywane typy
- **DTOs i Command Modele:**
  - `UpdateFlashcardCommand`: typ dla danych wejściowych (front i/lub back)
  - `FlashcardDTO`: typ dla odpowiedzi zawierającej zaktualizowaną fiszkę
- **Schematy walidacji Zod:**
  - Schema dla walidacji parametrów ścieżki
  - Schema dla walidacji ciała żądania

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
```json
{
  "id": number,
  "front": "string",
  "back": "string",
  "updated_at": "timestamp"
}
```
- Kody błędów:
  - 400: Nieprawidłowe dane wejściowe
  - 401: Brak autoryzacji
  - 404: Fiszka nie znaleziona
  - 500: Błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie PUT z ID fiszki i danymi aktualizacji.
2. Walidacja danych wejściowych:
   - Sprawdzenie poprawności ID
   - Walidacja struktury i długości pól w ciele żądania
3. Pobranie kontekstu Supabase z `context.locals`
4. Przekazanie danych do warstwy serwisowej (`updateFlashcard` w `src/lib/services/flashcard-update.ts`):
   - Weryfikacja istnienia fiszki i uprawnień użytkownika
   - Aktualizacja danych w bazie z automatycznym ustawieniem `updated_at`
   - Pobranie i zwrócenie zaktualizowanej fiszki
5. Zwrócenie odpowiedzi z zaktualizowanymi danymi lub odpowiednim błędem

## 6. Względy bezpieczeństwa
- Autoryzacja:
  - Weryfikacja tokenu JWT z Supabase
  - Sprawdzenie czy użytkownik jest właścicielem fiszki
- Walidacja wejścia:
  - Sanityzacja danych wejściowych
  - Użycie parametryzowanych zapytań do bazy danych
- Bezpieczne zwracanie błędów:
  - Brak ujawniania szczegółów technicznych w komunikatach błędów
  - Standaryzacja odpowiedzi błędów

## 7. Obsługa błędów
- 400 Bad Request:
  - Brak wymaganych pól
  - Przekroczenie limitów długości tekstu
  - Nieprawidłowy format ID
- 401 Unauthorized:
  - Brak tokenu autoryzacyjnego
  - Nieważny token
- 404 Not Found:
  - Fiszka o podanym ID nie istnieje
- 500 Internal Server Error:
  - Błędy połączenia z bazą danych
  - Nieoczekiwane błędy serwera

## 8. Rozważania dotyczące wydajności
- Optymalizacja zapytań do bazy danych:
  - Użycie pojedynczego zapytania do aktualizacji i pobrania danych
  - Indeks na kolumnie user_id w tabeli Flashcards
- Cachowanie:
  - Możliwość implementacji cache dla często aktualizowanych fiszek
- Monitorowanie:
  - Śledzenie czasu odpowiedzi endpointu
  - Monitorowanie liczby błędów i nieudanych prób aktualizacji

## 9. Etapy wdrożenia
1. Utworzenie endpointu w pliku `src/pages/api/flashcards/update/[id].ts`:
   - Implementacja metody PUT
   - Konfiguracja prerendering = false
2. Implementacja schematów walidacji Zod:
   - Schema dla parametrów ścieżki
   - Schema dla ciała żądania
3. Utworzenie nowego serwisu `src/lib/services/flashcard-update.ts`:
   - Implementacja interfejsu serwisu
   - Implementacja metody updateFlashcard
   - Implementacja logiki weryfikacji własności
   - Implementacja operacji na bazie danych
4. Implementacja middleware autoryzacyjnego:
   - Weryfikacja tokenu
   - Przekazywanie kontekstu Supabase
5. Dodanie testów:
   - Testy jednostkowe dla walidacji i serwisu
   - Testy integracyjne dla całego flow
6. Dokumentacja API i serwisu:
   - Aktualizacja dokumentacji OpenAPI/Swagger
   - Dokumentacja metod serwisu
   - Przykłady użycia w dokumentacji
7. Code review i testy wydajnościowe
8. Wdrożenie na środowisko testowe 