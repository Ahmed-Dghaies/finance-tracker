# Finance Tracker - Copilot Instructions

## Project Overview

Finance tracking app built with Next.js 16, React 19, TypeScript, Supabase, and shadcn/ui components.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui with Radix primitives
- **Styling**: Tailwind CSS 4
- **Forms**: react-hook-form with zod validation
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library

## Code Architecture

```
app/           → Pages and route-specific components (e.g., ExpenseForm.tsx colocated with page)
components/    → Shared components (ui/ for shadcn, dashboard/ for dashboard widgets)
hooks/         → Custom React hooks (use-expenses.ts pattern)
lib/
  ├── db/      → Supabase CRUD operations by entity (expenses.ts, income.ts)
  ├── supabase/→ Supabase client (client.ts, server.ts)
  ├── types.ts → TypeScript interfaces for all entities
  └── utils.ts → Shared utilities
```

## Key Patterns

### Data Layer (lib/db/\*.ts)

- Each entity (expenses, income, investments, possessions) has its own db file
- Functions: `getAll*`, `get*ByMonth`, `create*`, `update*`, `delete*`
- Always use `createClient()` from `@/lib/supabase/client`
- Transform Supabase rows to app types (snake_case → camelCase)

### Hooks (hooks/use-\*.ts)

- One hook per entity: `useExpenses`, `useIncomes`, `useInvestments`, etc.
- Return: `{ data, isLoading, handlers }` pattern
- Handle loading states internally with `useState`

### Forms

- Use controlled components with React state (useState pattern)
- Support both create and edit modes via `initialData` and `isEditing` props
- Date format: `DD/MM/YYYY` (use `formatDateToDDMMYYYY` helper)

### Components

- Import UI from `@/components/ui/*`
- Use `@/` path aliases for all imports
- Follow shadcn patterns for dialog, form, select, etc.

## Import Order (enforced by ESLint)

```typescript
// 1. React/external packages
import { useState } from "react";
import { format } from "date-fns";

// 2. Internal components (@/)
import { Button } from "@/components/ui/button";

// 3. Types (type imports last)
import type { Expense } from "@/lib/types";
```

## Naming Conventions

- **Files**: kebab-case (`use-expenses.ts`, `expense-form.tsx`)
- **Components**: PascalCase (`ExpenseForm`, `StartingBalanceDialog`)
- **Hooks**: camelCase with `use` prefix (`useExpenses`)
- **DB functions**: camelCase (`createExpense`, `getExpensesByMonth`)
- **Types**: PascalCase interfaces (`Expense`, `Income`, `Investment`)

## Testing

- Tests live in `__tests__/` folders next to source files
- Use `@/test/utils/test-utils` for render helpers
- Use `setSupabaseTable()` from `@/test/utils/msw-server` for mocking Supabase
- Test file naming: `*.test.tsx` or `*.test.ts`

## Commands

- `npm run dev` - Start development server
- `npm run test` - Run tests in watch mode
- `npm run test:ci` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Entity Types

Reference `lib/types.ts` for complete type definitions:

- `Expense`: amount, currency, category, type (necessary/pleasure), date, notes, recurring
- `Income`: amount, currency, category (fixed/variable/refund/one-time/selling), date, recurring
- `Investment`: name, type, initialAmount, currentValue, expectedYearlyPercentage, recurringInvestment
- `Possession`: name, category, purchasePrice, currentValue, currency, purchaseDate
- `CurrencyBalance`: currency, amount, eurEquivalent, country, exchangeRate
