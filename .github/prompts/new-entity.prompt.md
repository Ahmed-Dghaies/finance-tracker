---
mode: "agent"
description: "Create a new entity feature with page, form, hook, and db layer. Use for adding new trackable items like subscriptions, goals, budgets."
---

# New Entity Feature

Create a complete feature for a new entity type following existing patterns.

## Requirements

Entity name: {{entity}}

## Tasks

1. **Type Definition** - Add interface to `lib/types.ts` following existing patterns
2. **Database Layer** - Create `lib/db/{{entity}}.ts` with CRUD functions
3. **Hook** - Create `hooks/use-{{entity}}.ts` for state management
4. **Page** - Create `app/{{entity}}/page.tsx` with list view
5. **Form** - Create `app/{{entity}}/{{Entity}}Form.tsx` for add/edit
6. **Tests** - Create `app/{{entity}}/__tests__/page.test.tsx`

## Follow These Patterns

- Look at `lib/db/expenses.ts` for database layer pattern
- Look at `hooks/use-expenses.ts` for hook pattern
- Look at `app/expenses/page.tsx` and `ExpenseForm.tsx` for UI patterns
- Look at `app/expenses/__tests__/page.test.tsx` for test patterns

## Checklist

- [ ] Type interface added to lib/types.ts
- [ ] DB functions: getAll, getByMonth, create, update, delete
- [ ] Hook with loading state and handlers
- [ ] Page with list, add dialog, loading state, empty state
- [ ] Form supporting create and edit modes
- [ ] Basic tests for loading, display, empty state
