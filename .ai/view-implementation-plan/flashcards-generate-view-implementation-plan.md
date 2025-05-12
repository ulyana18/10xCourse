# Plan implementacji widoku "Flashcards Generate"

## 1. Przegląd
Widok generowania flashcardów umożliwia użytkownikowi wprowadzenie długiego tekstu (od 1,000 do 10,000 znaków) i wygenerowanie sugestii flashcardów przy użyciu API, co pozwala zaoszczędzić czas i uprościć proces tworzenia flashcardów.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/generate`.

## 3. Struktura komponentów
- **FlashcardsGenerateView** (główny kontener widoku)
  - **TextInput** (pole wprowadzania tekstu z dynamicznym licznikiem znaków)
  - **GenerateButton** (przycisk inicjujący generowanie flashcardów)
  - **LoadingSkeleton** (komponent wyświetlający stan ładowania podczas komunikacji z API)
  - **FlashcardSuggestionList** (lista wyświetlająca wygenerowane sugestie flashcardów z opcjami: zaakceptuj, edytuj, odrzuć)
  - **ErrorMessage** (komponent do wyświetlania komunikatów błędów)

## 4. Szczegóły komponentów
### FlashcardsGenerateView
- Opis: Główny kontener widoku, zbiera dane wejściowe, zarządza stanem, wywołuje API oraz prezentuje wyniki i błędy.
- Główne elementy: Formularz z `TextInput`, przycisk `GenerateButton`, obszar ładowania `LoadingSkeleton`, lista sugestii w `FlashcardSuggestionList`, oraz `ErrorMessage`.
- Obsługiwane interakcje: Wprowadzanie tekstu, kliknięcie przycisku, wybór akcji na poszczególnych flashcardach (zaakceptuj, edytuj, odrzuć).
- Obsługiwana walidacja: Walidacja długości tekstu (minimum 1000, maksimum 10000 znaków).
- Typy: Używa typu `GenerateFlashcardsCommand` dla żądania oraz `GenerateFlashcardsResponse` dla odpowiedzi z API.
- Propsy: Zarządza wewnętrznym stanem; ewentualnie może otrzymywać initial state lub callbacki od rodzica.

### TextInput
- Opis: Pole wprowadzania tekstu umożliwiające wpisanie treści do analizy.
- Główne elementy: Element `<textarea>` z dynamicznym licznikiem znaków.
- Obsługiwane interakcje: Wprowadzanie danych (onChange).
- Walidacja: Sprawdzenie czy tekst ma co najmniej 1000 i maksymalnie 10000 znaków.
- Typy: Pracuje na typie `string`.
- Propsy:
  - `value`: aktualna wartość tekstu
  - `onChange`: funkcja aktualizująca wartość
  - `error`: komunikat walidacyjny, jeśli występuje

### GenerateButton
- Opis: Przycisk, który inicjuje proces generowania flashcardów.
- Główne elementy: Przycisk `<button>` z etykietą "Generuj".
- Obsługiwane interakcje: Kliknięcie (onClick) wywołujące funkcję wysyłającą żądanie do API.
- Walidacja: Przycisk aktywny tylko, gdy tekst jest poprawny (spełnia warunki długości).
- Propsy:
  - `onClick`: funkcja wywoływana przy kliknięciu
  - `disabled`: stan przycisku

### LoadingSkeleton
- Opis: Komponent wizualny informujący użytkownika o trwającym ładowaniu.
- Główne elementy: Animowany skeleton lub spinner.
- Obsługiwane interakcje: Brak – jest to element czysto wizualny.
- Propsy: Opcjonalnie `isLoading`, aby kontrolować widoczność

### FlashcardSuggestionList
- Opis: Lista prezentująca wygenerowane sugestie flashcardów wraz z możliwością interakcji.
- Główne elementy: Elementy listy zawierające front, back oraz przyciski do akcji (zaakceptuj, edytuj, odrzuć).
- Obsługiwane interakcje: Kliknięcie przycisków akcji dla każdego flashcarda.
- Walidacja: Akcje muszą być zgodne z dozwolonymi typami (accept, edit, reject).
- Typy: Używa typu `FlashcardSuggestion`.
- Propsy:
  - `suggestions`: tablica obiektów typu `FlashcardSuggestion`
  - `onAction`: funkcja przekazująca wybór akcji dla danego flashcarda

### ErrorMessage
- Opis: Komponent do wyświetlania komunikatów o błędach.
- Główne elementy: Element tekstowy lub alert wyświetlający komunikat.
- Obsługiwane interakcje: Brak – służy tylko do wyświetlania informacji.
- Propsy:
  - `message`: komunikat błędu

## 5. Typy
- `GenerateFlashcardsCommand`: { source_text: string, model: string }
- `GenerateFlashcardsResponse`: { generation_id: number, suggestions: FlashcardSuggestion[] }
- `FlashcardSuggestion`: { id: number, front: string, back: string }
- Dodatkowy ViewModel (opcjonalnie):
  - `FlashcardGenerateViewModel` z polami:
    - `inputText`: string
    - `isLoading`: boolean
    - `error`: string | null
    - `suggestions`: FlashcardSuggestion[]

## 6. Zarządzanie stanem
- Użycie hooków React (`useState`) do zarządzania kluczowymi stanami:
  - `inputText` – wartość wprowadzana przez użytkownika
  - `isLoading` – stan oczekiwania na odpowiedź API
  - `error` – przechowywanie komunikatów o błędach
  - `suggestions` – tablica sugestii flashcardów uzyskanych z API
- Możliwe wdrożenie custom hooka (np. `useFlashcardsGeneration`) do enkapsulacji logiki wywołania API i walidacji.

## 7. Integracja API
- Endpoint: POST `/api/flashcards/generate`
- Żądanie:
  - Body: { source_text: string, model: "gpt4" }
- Odpowiedź:
  - Status 201: { generation_id: number, suggestions: FlashcardSuggestion[] }
- Obsługa błędów:
  - 400: Niepoprawna długość tekstu
  - 422: Błąd generowania flashcardów
  - 429: Przekroczony limit wywołań
- Implementacja:
  - Wywołanie API przy użyciu `fetch` lub innej biblioteki HTTP
  - Aktualizacja stanów `isLoading`, `suggestions` i `error` w zależności od odpowiedzi

## 8. Interakcje użytkownika
- Użytkownik wprowadza tekst w komponencie `TextInput` i obserwuje dynamiczny licznik znaków.
- Jeśli tekst spełnia wymagania, `GenerateButton` staje się aktywny.
- Po kliknięciu przycisku:
  - Wyświetlany jest `LoadingSkeleton`.
  - Wysyłane jest żądanie do API.
- Po otrzymaniu odpowiedzi:
  - Sukces: Wyświetlenie sugestii w komponencie `FlashcardSuggestionList`.
  - Błąd: Wyświetlenie komunikatu w komponencie `ErrorMessage`.
- W liście sugestii możliwe są akcje: zaakceptowanie, edycja lub odrzucenie flashcarda.

## 9. Warunki i walidacja
- Walidacja długości tekstu:
  - Minimum: 1000 znaków
  - Maksimum: 10000 znaków
- Przycisk `GenerateButton` aktywowany tylko, gdy tekst spełnia wymogi walidacyjne.
- W momencie wysłania żądania odbywa się dodatkowa weryfikacja długości tekstu.
- Odpowiedzi API z kodami 400, 422 lub 429 są mapowane na odpowiednie komunikaty błędów wyświetlane w `ErrorMessage`.

## 10. Obsługa błędów
- Błędy walidacji (np. zbyt krótki tekst) są natychmiastowo komunikowane użytkownikowi pod polem tekstowym.
- Błędy wynikające z odpowiedzi API powodują aktualizację stanu `error` i wyświetlenie `ErrorMessage`.
- W przypadku błędów sieciowych lub nieoczekiwanych błędów, użytkownik otrzymuje informację o problemie oraz sugerowaną możliwość ponowienia próby.

## 11. Kroki implementacji
1. Utworzenie nowej strony widoku w katalogu `/src/pages` z trasą `/generate`.
2. Stworzenie głównego komponentu `FlashcardsGenerateView` w katalogu `/src/components`.
3. Implementacja komponentu `TextInput` z dynamicznym licznikiem znaków oraz walidacją długości tekstu.
4. Implementacja komponentu `GenerateButton`, który jest aktywny tylko przy spełnieniu warunków walidacji.
5. Dodanie komponentu `LoadingSkeleton` do wizualizacji stanu ładowania podczas wywołań API.
6. Utworzenie komponentu `FlashcardSuggestionList` (`FlashcardSuggestionCard` jako pojedyńcza sugestia) do prezentacji wygenerowanych flashcardów wraz z opcjami interakcji (zaakceptuj, edytuj, odrzuć).
7. Utworzenie komponentu `ErrorMessage` do wyświetlania komunikatów o błędach.
8. Integracja z endpointem POST `/api/flashcards/generate` – implementacja funkcji wywołującej API, przetwarzanie odpowiedzi oraz aktualizacja stanów widoku.
9. Zarządzanie stanem widoku przy użyciu hooków React (`useState`) oraz ewentualnego custom hooka do obsługi logiki API.
10. Implementacja mechanizmu walidacji danych wejściowych zarówno na poziomie komponentu, jak i przed wysłaniem żądania do API.
11. Testowanie widoku: weryfikacja wszystkich interakcji, poprawność walidacji oraz obsługi błędów.
12. Przegląd kodu, refaktoryzacja oraz integracja z istniejącym projektem zgodnie z zasadami czystego kodu. 