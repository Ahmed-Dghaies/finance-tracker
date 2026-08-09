---
description: "Use when working with Supabase, database operations, CRUD functions, or data layer code. Covers db patterns and type transformations."
applyTo: "**/lib/supabase/**/*.ts"
---

# Supabase Database Layer Guidelines

## File Structure

```
lib/
├── db/
│   ├── expenses.ts      # CRUD for expenses table
│   ├── income.ts        # CRUD for income table
│   ├── investments.ts   # CRUD for investments table
│   ├── possessions.ts   # CRUD for possessions table
│   ├── exchanges.ts     # CRUD for currency exchanges
│   └── settings.ts      # App settings
└── supabase/
    ├── client.ts        # Browser client
    └── server.ts        # Server client
```

## CRUD Function Pattern

```typescript
import { createClient } from "../supabase/client";
import type { Entity } from "@/lib/types";

// GET ALL
export async function getAllEntities(): Promise<Entity[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;

  return (data || []).map(transformRow);
}

// GET BY MONTH
export async function getEntitiesByMonth(month: string): Promise<Entity[]> {
  const supabase = createClient();

  const [monthNum, year] = month.split("/");
  const startDate = `${year}-${monthNum}-01`;
  const nextMonth = /* calculate next month */;

  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .gte("date", startDate)
    .lt("date", nextMonth)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data || []).map(transformRow);
}

// CREATE
export async function createEntity(entity: Omit<Entity, "id">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("table_name")
    .insert({
      // Transform camelCase to snake_case
      field_name: entity.fieldName,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// UPDATE
export async function updateEntity(id: string, entity: Partial<Entity>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("table_name")
    .update({
      // Only include changed fields
      ...(entity.fieldName !== undefined && { field_name: entity.fieldName }),
    })
    .eq("id", id);

  if (error) throw error;
}

// DELETE
export async function deleteEntity(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("table_name")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
```

## Type Transformation

Supabase uses snake_case, app uses camelCase:

```typescript
// Row from Supabase → App type
const transformRow = (row: DatabaseRow): Entity => ({
  id: row.id,
  amount: Number(row.amount), // Ensure numbers
  currency: row.currency,
  fieldName: row.field_name, // snake_case → camelCase
  recurring: row.recurring_day_of_month ? { dayOfMonth: row.recurring_day_of_month } : undefined, // Handle optional nested objects
});
```

## Date Handling

- **App format**: `DD/MM/YYYY` (display)
- **Database format**: `YYYY-MM-DD` (PostgreSQL date)

```typescript
// Parse DD/MM/YYYY to YYYY-MM-DD for DB
function parseDate(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

// Format YYYY-MM-DD to DD/MM/YYYY for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}
```

## Error Handling

Always check for errors and throw:

```typescript
const { data, error } = await supabase.from("table").select("*");
if (error) throw error;
return data || [];
```

## Month Key Format

Used for filtering by month: `MM/YYYY`

```typescript
const getMonthKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
};
```
