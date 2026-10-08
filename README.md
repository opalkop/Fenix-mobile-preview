# FENIX Mobile Preview (FPM)

Mobilna wersja FENIX: Studia (labirynt, wykreślanka, kolorowanka, szlaczki, łączenie, alfabet, logika, kropki, ukryte obiekty, Complete the Picture) i Book Builder w układzie na telefon. Ostatnie zmiany: sierpień 2026.

> **Status:** rozwój Feniksa jest kontynuowany w repozytorium `opalkop/fenix` na gałęzi `feature/fenix-portable-mobile`, publikowanej pod adresem https://opalkop.github.io/fenix-fp-preview/.

## Uruchomienie

Otwórz `index.html` w przeglądarce telefonu lub komputera.

## Fenix Sync

Projekty są synchronizowane przez gałąź `fenix-sync-data` w repozytorium `opalkop/fenix`. Nowsza wersja Feniksa zapisuje tam dane w formacie (v6, z obrazami w osobnych częściach), którego ta wersja nie obsługuje. Dlatego ta wersja odmawia wczytania i nadpisania takich danych, żeby nie usunąć obrazów z projektów. Test: `node tests/sync-guard.test.cjs`.

## Struktura

| Ścieżka | Zawartość |
|---|---|
| `index.html`, `fpm*.js`, `fpm.css` | dashboard i labirynt |
| `<studio>.html` + `<studio>.js` / `*-core.js` | Studia |
| `core/` | rdzeń: projekty, schemat stron, PDF, synchronizacja |
| `modules/` | Book Builder i strony książki (intro, gratulacje, certyfikat, QR) |
| `tests/` | testy |
