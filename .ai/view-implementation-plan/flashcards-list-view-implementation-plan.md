# Plan implementacji widoku Flashcards List

## 1. Przegląd
Widok "Moje Flashcardy" umożliwia użytkownikowi przeglądanie zapisanych flashcardów, filtrowanie ich według źródła (ai-full, ai-edited, manual), a także korzystanie z funkcji edycji i usuwania. Celem widoku jest zapewnienie intuicyjnego i responsywnego interfejsu do zarządzania flashcardami.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką: `/my-flashcards`.

## 3. Struktura komponentów
- **FlashcardsListView** (kontener widoku)
  - `FilterBar` – umożliwia wybór filtrów źródła flashcardów.
  - `FlashcardsList` – renderuje listę flashcardów w postaci elementów `FlashcardItem`.
    - `FlashcardItem` – pojedycza karta flashcard zawierająca opcje edycji i usuwania.
  - `Pagination` – umożliwia nawigację między stronami listy flashcardów.
  - `EditModal` – modal z formularzem do edycji wybranej flashcardy.

## 4. Szczegóły komponentów
### FlashcardsListView
- **Opis:** Główny kontener widoku, pobiera dane z API, zarządza stanem widoku oraz koordynuje interakcje między komponentami.
- **Główne elementy:** `FilterBar`, `FlashcardsList`, `Pagination`, `EditModal`.
- **Obsługiwane interakcje:** Zmiana filtrów, przełączanie stron, otwieranie modala edycji.
- **Walidacja:** Weryfikacja poprawności parametrów zapytania do API.
- **Typy:** Stan zawiera listę flashcardów (`FlashcardDTO[]`), bieżącą stronę, filtry, sortowanie.
- **Propsy:** Brak – komponent zarządza stanem lokalnym.

### FilterBar
- **Opis:** Komponent umożliwiający wybór źródeł flashcardów do wyświetlenia (np. ai-full, ai-edited, manual).
- **Główne elementy:** Lista checkboxów lub komponent multi-select.
- **Obsługiwane interakcje:** Zmiana wyboru filtrów, emisja zdarzenia `onFilterChange`.
- **Walidacja:** Sprawdzenie, że wybrane wartości należą do dozwolonego zbioru.
- **Typy:** Filtry określane jako tablica stringów lub enum.
- **Propsy:** `onFilterChange` – callback z nowymi filtrami.

### FlashcardsList
- **Opis:** Komponent odpowiedzialny za renderowanie listy flashcardów pobranych z API.
- **Główne elementy:** Lista elementów `FlashcardItem`.
- **Obsługiwane interakcje:** Przekazywanie zdarzeń edycji i usuwania z elementów listy.
- **Walidacja:** Sprawdzenie integralności danych flashcard.
- **Typy:** Wykorzystuje `FlashcardListResponse` oraz `FlashcardDTO`.
- **Propsy:** `flashcards` (lista flashcardów), `onEdit` (callback), `onDelete` (callback).

### FlashcardItem
- **Opis:** Pojedyncza karta flashcard wyświetlająca informacje (front, back, źródło) oraz przyciski akcji.
- **Główne elementy:** Tekst flashcard, przyciski edycji i usuwania.
- **Obsługiwane interakcje:** Kliknięcie przycisku edycji (otwiera `EditModal`), kliknięcie przycisku usuwania (inicjuje potwierdzenie usunięcia).
- **Walidacja:** Brak – komponent prezentacyjny.
- **Typy:** Bazuje na `FlashcardDTO`.
- **Propsy:** `flashcard` (dane flashcard), `onEdit` (callback), `onDelete` (callback).

### Pagination
- **Opis:** Komponent do zarządzania paginacją listy flashcardów.
- **Główne elementy:** Przycisk "Poprzednia", "Następna", numeracja stron.
- **Obsługiwane interakcje:** Zmiana strony przez kliknięcie przycisków, emisja zdarzenia `onPageChange`.
- **Walidacja:** Weryfikacja zakresu stron (nie przekracza dostępnych stron).
- **Typy:** Prosty model: { page: number, total: number, per_page: number }.
- **Propsy:** `currentPage`, `totalItems`, `perPage`, `onPageChange`.

### EditModal
- **Opis:** Modal pozwalający na edycję flashcardy. Zawiera formularz z polami "Front" oraz "Back".
- **Główne elementy:** Formularz, pola tekstowe, przyciski "Zapisz" i "Anuluj".
- **Obsługiwane interakcje:** Edycja pól, zatwierdzenie zmian, zamknięcie modala.
- **Walidacja:** Pola nie mogą być puste, ograniczenie długości tekstu.
- **Typy:** `EditFlashcardForm` (np. { id: number, front: string, back: string }).
- **Propsy:** `flashcard` (dane do edycji), `isOpen` (boolean), `onClose` (callback), `onSave` (callback).

## 5. Typy
- **FlashcardDTO:** { id: number, front: string, back: string, source: string, created_at: string, updated_at: string }
- **FlashcardListResponse:** { items: FlashcardDTO[], total: number, page: number, per_page: number }
- **EditFlashcardForm:** { id: number, front: string, back: string }
- **PaginationModel:** { page: number, total: number, per_page: number }
- **FilterTypes:** Enum lub tablica stringów z wartościami: "ai-full", "ai-edited", "manual".

## 6. Zarządzanie stanem
- Stan zarządzany w głównym komponencie `FlashcardsListView`:
  - `currentPage` – bieżąca strona listy
  - `flashcards` – lista pobranych flashcardów
  - `total` – całkowita liczba flashcardów
  - `filter` – aktualnie wybrane filtry (źródło)
  - `sort` i `order` – kryteria sortowania
  - `isEditModalOpen` – stan otwarcia modala edycji
  - `selectedFlashcard` – flashcard wybrana do edycji
- Możliwa implementacja custom hooka (np. `useFlashcards`) do zarządzania logiką pobierania danych.

## 7. Integracja API
- **Endpoint:** GET `/api/flashcards`
- **Parametry:** page, per_page, source, sort, order przekazywane w query string
- **Typ żądania:** Żądanie GET z parametrami
- **Typ odpowiedzi:** `FlashcardListResponse` zawierający tablicę `FlashcardDTO` oraz metadane paginacji
- **Integracja:** Pobieranie danych przy zmianie stanu (filtry, strona, sortowanie) oraz aktualizacja stanu widoku na podstawie odpowiedzi API.

## 8. Interakcje użytkownika
- Wybór filtrów w `FilterBar` aktualizuje stan filtrów i powoduje ponowne pobranie danych.
- Kliknięcie przycisku paginacji zmienia `currentPage` i odświeża listę flashcardów.
- Kliknięcie przycisku edycji w `FlashcardItem` otwiera `EditModal` z danymi wybranej flashcardy.
- W `EditModal` użytkownik edytuje dane i zatwierdza zmiany, co powoduje wysłanie zapytania aktualizującego flashcardę (integracja z API aktualizacji może być dodatkowa).
- Kliknięcie przycisku usuwania inicjuje proces potwierdzenia oraz wywołanie API usuwania flashcardy.

## 9. Warunki i walidacja
- Filtry: Tylko dozwolone wartości ("ai-full", "ai-edited", "manual") mogą być wybrane.
- Parametry wysyłane do API muszą być liczbami (page, per_page) oraz zgodne z dozwolonymi wartościami sortowania.
- W `EditModal` pola "Front" i "Back" nie mogą być puste i powinny spełniać ograniczenia długości tekstu.
- Odpowiedź API jest weryfikowana pod kątem błędów (stan 400, 422, 500) – w razie wystąpienia błędu, użytkownik zobaczy komunikat (Toast).

## 10. Obsługa błędów
- Błędy połączenia lub walidacji API: Wyświetlenie powiadomienia (Toast) z informacją o błędzie.
- Walidacja formularza w `EditModal`: Dynamiczne komunikaty o błędach przy niepoprawnych danych.
- Scenariusz pustej listy: Wyświetlenie komunikatu "Brak danych".

## 11. Kroki implementacji
1. Utworzenie kontenera widoku `FlashcardsListView` i skonfigurowanie routingu na ścieżce `/my-flashcards`.
2. Implementacja komponentu `FilterBar` z mechanizmem wyboru filtrów źródła i emisją zdarzenia `onFilterChange`.
3. Implementacja komponentu `FlashcardsList` do pobierania danych z API i renderowania listy flashcardów.
4. Utworzenie komponentu `FlashcardItem` prezentującego pojedynczą kartę z opcjami edycji i usuwania.
5. Dodanie komponentu `Pagination` umożliwiającego nawigację między stronami oraz emisję zdarzenia `onPageChange`.
6. Implementacja komponentu `EditModal` z formularzem edycji opartym o React Hook Form i Zod do walidacji pól.
7. Stworzenie custom hooka `useFlashcards` do zarządzania logiką pobierania flashcards oraz stanem widoku.
8. Integracja wszystkich komponentów w `FlashcardsListView` i zapewnienie komunikacji między nimi (przekazywanie callbacków dla edycji oraz usuwania).
9. Dodanie obsługi błędów: wyświetlanie Toast z komunikatami o błędach dla nieudanych zapytań API czy walidacji formularza.
10. Testowanie widoku pod kątem poprawności danych, responsywności oraz zgodności z wytycznymi dostępnymi (ARIA, dostępność).
11. Refaktoryzacja kodu i finalny przegląd zgodnie z zasadami clean code. 