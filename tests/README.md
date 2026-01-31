# GymRatPlanner - Test Suite

## Struktura testów

```
tests/
├── unit/                  # Testy jednostkowe
│   ├── services/         # Testy warstwy serwisowej
│   └── validation/       # Testy schematów walidacji
├── integration/          # Testy integracyjne
│   ├── api/             # Testy endpointów API
│   └── database/        # Testy operacji bazodanowych i RLS
├── e2e/                 # Testy end-to-end
└── setup.ts             # Konfiguracja globalna testów
```

## Uruchamianie testów

### Testy jednostkowe
```bash
npm run test:unit
```

### Testy integracyjne
```bash
npm run test:integration
```

### Testy E2E
```bash
npm run test:e2e
```

### Wszystkie testy w trybie watch
```bash
npm run test
```

### Raport pokrycia kodu
```bash
npm run test:coverage
```

### UI mode (wizualna nawigacja po testach)
```bash
npm run test:ui
```

## Wytyczne pisania testów

### Testy jednostkowe (Vitest)

Stosuj wzorzec **Arrange-Act-Assert**:

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange - przygotuj dane testowe
    const input = 'test';
    
    // Act - wykonaj testowaną operację
    const result = input.toUpperCase();
    
    // Assert - sprawdź wynik
    expect(result).toBe('TEST');
  });
});
```

### Mockowanie z Vitest

```typescript
import { vi } from 'vitest';

// Mock funkcji
const mockFn = vi.fn();

// Mock modułu
vi.mock('@/lib/services/example', () => ({
  exampleService: {
    getData: vi.fn(() => Promise.resolve({ data: 'test' })),
  },
}));
```

### Testy E2E (Playwright)

Używaj Page Object Model dla czytelności:

```typescript
import { test, expect } from '@playwright/test';

test('user can complete critical flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/templates');
});
```

## Cele pokrycia kodu

- **Warstwa serwisowa & API**: 70%+
- **Schematy walidacji**: 90%+
- **Ogólne pokrycie projektu**: 70%+

## Narzędzia

- **Vitest**: Framework do testów jednostkowych i integracyjnych
- **Playwright**: Framework do testów E2E
- **Testing Library**: Narzędzia do testowania komponentów React
- **jsdom**: Środowisko DOM dla testów jednostkowych

## Dodatkowe zasoby

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Test Plan](.ai/testing/test-plan.md)
