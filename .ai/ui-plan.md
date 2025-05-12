# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika została zaprojektowana z podejściem mobile-first, wykorzystując Tailwind CSS, komponenty Shadcn/ui oraz React. Struktura opiera się na rozdzieleniu widoków odpowiadających kluczowym funkcjom aplikacji: autoryzacji, generowaniu flashcardów, przeglądzie sugestii, zarządzaniu flashcardami, sesji nauki i statystykach. Globalny stan zarządzany jest przy użyciu React Context, co zapewnia spójność oraz efektywną synchronizację pomiędzy widokami.

## 2. Lista widoków

- **Widok Autoryzacji (Auth)**
  - Ścieżka: `/auth`
  - Główny cel: Umożliwienie rejestracji i logowania użytkownika.
  - Kluczowe informacje do wyświetlenia: Formularze logowania oraz rejestracji (email, hasło), komunikaty walidacyjne.
  - Kluczowe komponenty widoku: `AuthForm` (z wykorzystaniem Shadcn/ui), liczniki znaków, komunikaty błędów.
  - UX, dostępność i względy bezpieczeństwa: Responsywność, pełna obsługa klawiaturą, zgodność z WCAG 2.1 AA, przechowywanie tokenu JWT w httpOnly cookie, zabezpieczenia przed atakami XSS.

- **Widok Generowania Flashcardów**
  - Ścieżka: `/generate`
  - Główny cel: Umożliwienie użytkownikowi wprowadzenia tekstu oraz generowanie sugestii flashcardów za pomocą API.
  - Kluczowe informacje do wyświetlenia: Pole tekstowe (1 000–10 000 znaków), przycisk "Generuj", stan ładowania, komunikaty błędów.
  - Kluczowe komponenty widoku: `TextInput`, `GenerateButton`, komponent `Skeleton` dla stanu ładowania, walidacja formularza, Lista `SuggestionCard` z podglądem przodu i tyłu karty, przyciski akcji widoczne na hover oraz focus, system multi-selection umożliwiający masowe akcje, modal z potwierdzeniem przy odrzuceniu.
  - UX, dostępność i względy bezpieczeństwa: Dynamiczna walidacja z licznikami znaków i progress bar, zgodność z WCAG 2.1 AA.

- **Widok „Moje Flashcardy” (My Flashcards)**
  - Ścieżka: `/my-flashcards`
  - Główny cel: Wyświetlanie listy zapisanych flashcardów użytkownika z opcją filtrowania, edycji oraz usuwania.
  - Kluczowe informacje do wyświetlenia: Lista flashcardów z paginacją (domyślnie 20 elementów na stronę, numeracja stron, przyciski prev/next), informacje o źródle karty (ai-full, ai-edited, manual).
  - Kluczowe komponenty widoku: `FlashcardsList`, `Pagination`, `FilterBar` (multi-select zsynchronizowany z URL query params), `EditModal` oraz opcja usuwania.
  - UX, dostępność i względy bezpieczeństwa: Intuicyjna nawigacja, responsywność, pełna obsługa ARIA, zabezpieczenia operacji edycji i usuwania.

- **Widok Tworzenia/Edycji Flashcarda (Create/Edit Flashcard)**
  - Ścieżka: `/flashcard/create` lub `/flashcard/edit`
  - Główny cel: Umożliwienie ręcznego tworzenia lub edycji flashcardów.
  - Kluczowe informacje do wyświetlenia: Formularz z polami "Front" oraz "Back", komunikaty walidacyjne, licznik znaków i progress bar.
  - Kluczowe komponenty widoku: `FlashcardForm` (z wykorzystaniem React Hook Form i Zod), przyciski „Zapisz” i „Anuluj”.
  - UX, dostępność i względy bezpieczeństwa: Natychmiastowa walidacja, czytelne komunikaty błędów, intuicyjna nawigacja.

- **Widok Sesji Nauki (Study Session)**
  - Ścieżka: `/study`
  - Główny cel: Przeprowadzenie użytkownika przez sesję nauki wykorzystującą algorytm powtórek.
  - Kluczowe informacje do wyświetlenia: Aktualna flashcard, przyciski nawigacji (Następny, Poprzedni), `SessionTimer`, opcje oceny (0–5).
  - Kluczowe komponenty widoku: `StudySessionCard`, `SessionTimer`, `RatingComponent`.
  - UX, dostępność i względy bezpieczeństwa: Automatyczne przechodzenie do kolejnej karty, łatwa obsługa klawiaturą, czytelność i wysoki kontrast zgodny z WCAG.

- **Widok Statystyk (Stats View)**
  - Ścieżka: `/stats`
  - Główny cel: Prezentacja kluczowych metryk dotyczących generowania flashcardów.
  - Kluczowe informacje do wyświetlenia: Kafelki z metrykami: Total Generated, Accepted Unedited, Rejected oraz placeholder na Accepted Edited.
  - Kluczowe komponenty widoku: `StatsCard`, układ gridowy prezentujący dane.
  - UX, dostępność i względy bezpieczeństwa: Przejrzysta prezentacja informacji, responsywność, wysoki kontrast i zgodność z WCAG 2.1 AA.

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na stronę autoryzacji (`/auth`) i wykonuje proces logowania lub rejestracji.
2. Po pomyślnej autoryzacji użytkownik zostaje przekierowany do widoku generowania flashcardów (`/generate`).
3. Użytkownik wprowadza wymagany tekst, monitoruje licznik znaków, a następnie klika przycisk "Generuj".
4. Po otrzymaniu wyników, użytkownik przechodzi do widoku przeglądu sugestii (`/review`), gdzie może przeglądać, zatwierdzać, edytować lub odrzucać poszczególne flashcardy.
5. Zatwierdzone flashcardy trafiają do widoku "Moje Flashcardy" (`/my-flashcards`), gdzie dostępne są opcje filtrowania, edycji oraz usuwania.
6. W razie potrzeby użytkownik może przejść do widoku tworzenia/edycji flashcarda (`/flashcard/create` lub `/flashcard/edit`) w celu wprowadzenia poprawek.
7. Użytkownik rozpoczyna sesję nauki w widoku Sesji Nauki (`/study`), ocenia flashcardy i korzysta z automatycznego przejścia między kartami.
8. Użytkownik ma możliwość monitorowania postępów poprzez odwiedzenie widoku statystyk (`/stats`).

## 4. Układ i struktura nawigacji

Nawigacja w aplikacji opiera się na systemie routing Astro/React, wzbogaconym o mechanizmy guardów chroniących trasy wymagające autoryzacji. Kluczowe elementy nawigacyjne to:

- Pasek nagłówka zawierający logo, przycisk `ThemeToggle` oraz linki do głównych widoków: Generowanie, Moje Flashcardy, Sesja Nauki, Statystyki.
- Menu boczne lub mobilne menu rozwijane dla urządzeń o mniejszej rozdzielczości.
- Kontekstowo zmieniające się przyciski, takie jak "Powrót", "Zapisz" czy "Edytuj", zależnie od aktualnego widoku.
- Synchronizacja stanu filtrowania i paginacji poprzez URL query params, umożliwiająca deep linking oraz udostępnianie stanu widoku.

## 5. Kluczowe komponenty

- `AuthForm`: Formularz logowania i rejestracji wykorzystujący Shadcn/ui, obsługujący walidację (React Hook Form + Zod) oraz dynamiczne liczniki znaków.
- `TextInput` i `GenerateButton`: Elementy widoku generowania, umożliwiające wprowadzanie tekstu i inicjowanie procesu generacji.
- `SuggestionCard`: Komponent przedstawiający pojedynczą sugestię flashcarda z akcjami (akceptacja, edycja, odrzucenie) widocznymi przy interakcji hover/focus.
- `FilterBar`: Dropdown multi-select do filtrowania flashcardów według źródła (ai-full, ai-edited, manual) z synchronizacją ze stanem URL.
- `Pagination`: Komponent paginacji oparty na Shadcn/ui, prezentujący bieżący stan strony, liczbę elementów oraz przyciski nawigacji.
- `FlashcardForm`: Formularz tworzenia/edycji flashcarda z licznikami znaków, progress barami oraz czytelnymi komunikatami walidacyjnymi.
- `SessionTimer` i `RatingComponent`: Komponenty wspierające sesję nauki, odpowiedzialne za odmierzanie czasu oraz ocenę flashcarda w skali 0–5.
- `Skeleton` i `Toast`: Uniwersalne komponenty informujące o stanie ładowania i powiadomieniach, zaprojektowane zgodnie z wytycznymi dostępności.
