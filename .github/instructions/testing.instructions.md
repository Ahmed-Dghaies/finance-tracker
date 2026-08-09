---
description: "Use when writing tests, creating test files, or debugging test failures. Covers Jest, React Testing Library, and Supabase mocking."
applyTo: "**/*.test.*"
---

# Testing Guidelines

## Test File Location

Tests live in `__tests__/` folders adjacent to source:

```
app/expenses/
  ├── page.tsx
  ├── ExpenseForm.tsx
  └── __tests__/
      └── page.test.tsx
```

## Test Setup

```tsx
import { setSupabaseTable } from "@/test/utils/msw-server";
import { render, screen, waitFor, fireEvent } from "@/test/utils/test-utils";

import ComponentToTest from "../page";
```

## Mocking Supabase Data

```tsx
// Set mock data before rendering
setSupabaseTable("expenses", [
  {
    id: "1",
    amount: 50,
    currency: "EUR",
    category: "Food & Dining",
    type: "necessary",
    date: "2024-01-15",
    notes: null,
    recurring_day_of_month: null,
  },
]);

render(<ExpensesPage />);
```

## Test Patterns

### Loading State

```tsx
it("Renders loading state initially", () => {
  render(<Page />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

### Async Data Loading

```tsx
it("displays data after loading", async () => {
  render(<Page />);

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  expect(screen.getByText("Expected Content")).toBeInTheDocument();
});
```

### Finding Multiple Items

```tsx
it("displays list of items", async () => {
  render(<Page />);

  const items = await screen.findAllByLabelText(/item-/i);
  expect(items.length).toBe(expectedCount);
});
```

### Empty State

```tsx
it("shows empty state when no data", async () => {
  setSupabaseTable("expenses", []);
  render(<Page />);

  await waitFor(() => {
    expect(screen.getByText(/no .* found/i)).toBeInTheDocument();
  });
});
```

### Form Interaction

```tsx
it("submits form with correct data", async () => {
  const mockSubmit = jest.fn();
  render(<Form onSubmit={mockSubmit} />);

  fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "100" } });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 100,
      }),
    );
  });
});
```

## Query Priority

1. `getByRole` - Accessible queries (best)
2. `getByLabelText` - Form elements
3. `getByText` - Non-interactive elements
4. `findBy*` - For async elements
5. `queryBy*` - When expecting element NOT to exist

## Naming Conventions

- Test descriptions: Start with verb ("Renders", "Displays", "Shows", "Submits")
- Use descriptive `aria-label` attributes in components for easy testing
- Labels like `expense-item-{id}`, `total-expenses`, `open-add-expense-form`

## Commands

```bash
npm run test        # Watch mode
npm run test:ci     # CI with coverage
```
