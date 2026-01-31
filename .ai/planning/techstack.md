Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

CI/CD:
- Github Actions do tworzenia pipeline’ów CI/CD

Testowanie:
- Vitest do testów jednostkowych i integracyjnych:
  - Testy jednostkowe dla serwisów i schematów walidacji
  - Testy integracyjne dla endpointów API i operacji bazodanowych
  - Raportowanie pokrycia kodu (cel: 70%+ dla logiki biznesowej)
- Playwright do testów end-to-end:
  - Testy E2E dla krytycznych ścieżek użytkownika (autentykacja, szablony, treningi)
  - Automatyczne testowanie UI
  - Możliwość testowania w różnych przeglądarkach