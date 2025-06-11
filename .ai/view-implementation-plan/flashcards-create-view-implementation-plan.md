# Plan implementacji widoku tworzenia fiszki

## 1. Przegląd
Widok tworzenia fiszki umożliwia użytkownikom ręczne tworzenie nowych fiszek poprzez wprowadzenie treści przedniej (pytanie) i tylnej (odpowiedź) strony. Widok zapewnia natychmiastową walidację wprowadzanych danych, wyświetla licznik znaków oraz pasek postępu dla obu pól.

## 2. Routing widoku
- Ścieżka: `/flashcard/create`
- Komponent: `CreateFlashcardPage`
- Dostęp: tylko dla zalogowanych użytkowników

## 3. Struktura komponentów
```
CreateFlashcardPage
└── FlashcardForm
    ├── FormField (front)
    │   ├── Input
    │   ├── CharacterCount
    │   └── ProgressBar
    ├── FormField (back)
    │   ├── Input
    │   ├── CharacterCount
    │   └── ProgressBar
    └── ActionButtons
```

## 4. Szczegóły komponentów

### CreateFlashcardPage
- Opis komponentu: Główny komponent widoku, odpowiedzialny za zarządzanie stanem formularza i integrację z API
- Główne elementy: Container, ErrorBoundary, FlashcardForm
- Obsługiwane interakcje: Nawigacja po zapisie, obsługa anulowania
- Obsługiwana walidacja: Brak (delegowana do FlashcardForm)
- Typy: CreateFlashcardCommand, FlashcardDTO
- Propsy: Brak (komponent routingu)

### FlashcardForm
- Opis komponentu: Formularz tworzenia fiszki z walidacją i licznikiem znaków
- Główne elementy: Form, FormField (x2), Button (x2)
- Obsługiwane interakcje: 
  - Wprowadzanie tekstu
  - Zatwierdzenie formularza
  - Anulowanie
- Obsługiwana walidacja:
  - Front: max 200 znaków
  - Back: max 500 znaków
  - Pola nie mogą być puste
- Typy: CreateFlashcardFormData, FormFieldProps
- Propsy: 
  - onSubmit: (data: CreateFlashcardFormData) => Promise<void>
  - onCancel: () => void

### FormField
- Opis komponentu: Reużywalny komponent pola formularza z licznikiem i paskiem postępu
- Główne elementy: Label, Input, CharacterCount, ProgressBar
- Obsługiwane interakcje: Wprowadzanie tekstu
- Obsługiwana walidacja: Limit znaków, wymagane pole
- Typy: FormFieldProps
- Propsy:
  - name: string
  - label: string
  - maxLength: number
  - value: string
  - onChange: (value: string) => void
  - error?: string

## 5. Typy

```typescript
interface CreateFlashcardFormData {
  front: string;
  back: string;
}

interface FormFieldProps {
  name: string;
  label: string;
  maxLength: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

interface FormState {
  isSubmitting: boolean;
  error?: string;
}
```

## 6. Zarządzanie stanem

### useFlashcardForm
Custom hook zarządzający stanem formularza:
```typescript
const useFlashcardForm = () => {
  // Stan formularza
  // Walidacja
  // Integracja z API
  // Nawigacja
}
```

### useCharacterCount
Custom hook do obsługi licznika znaków:
```typescript
const useCharacterCount = (value: string, maxLength: number) => {
  // Licznik znaków
  // Procent wypełnienia
  // Stan walidacji
}
```

## 7. Integracja API

### Endpoint
- Metoda: POST
- URL: `/api/flashcards`
- Request body: CreateFlashcardCommand
- Response: FlashcardDTO
- Błędy: 400 Bad Request

### Implementacja
```typescript
const createFlashcard = async (data: CreateFlashcardFormData): Promise<FlashcardDTO> => {
  // Wywołanie API
  // Obsługa błędów
  // Zwrot utworzonej fiszki
}
```

## 8. Interakcje użytkownika
1. Wprowadzanie tekstu:
   - Aktualizacja licznika znaków
   - Aktualizacja paska postępu
   - Walidacja w czasie rzeczywistym
2. Zatwierdzenie formularza:
   - Walidacja wszystkich pól
   - Wyświetlenie stanu ładowania
   - Obsługa sukcesu/błędu
3. Anulowanie:
   - Potwierdzenie jeśli są zmiany
   - Nawigacja do poprzedniego widoku

## 9. Warunki i walidacja
1. Pole "Front":
   - Wymagane
   - Max 200 znaków
   - Walidacja w czasie rzeczywistym
2. Pole "Back":
   - Wymagane
   - Max 500 znaków
   - Walidacja w czasie rzeczywistym
3. Formularz:
   - Wszystkie pola muszą być poprawne
   - Blokada przycisku "Zapisz" przy błędach

## 10. Obsługa błędów
1. Błędy walidacji:
   - Wyświetlanie pod polami formularza
   - Czerwone obramowanie pól
2. Błędy API:
   - Toast z komunikatem błędu
   - Możliwość ponowienia próby
3. Błędy sieci:
   - Informacja o braku połączenia
   - Automatyczne ponowienie próby
4. Nieoczekiwane błędy:
   - ErrorBoundary z przyjaznym komunikatem
   - Opcja odświeżenia strony

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury komponentów
2. Implementacja formularza z React Hook Form
3. Dodanie komponentu FormField z walidacją
4. Implementacja licznika znaków i paska postępu
5. Integracja z API i obsługa błędów
6. Dodanie nawigacji i obsługi anulowania
7. Implementacja ErrorBoundary
8. Stylizacja komponentów z Tailwind
9. Dodanie animacji i przejść
10. Testy jednostkowe i integracyjne
11. Optymalizacja wydajności
12. Dokumentacja komponentów 