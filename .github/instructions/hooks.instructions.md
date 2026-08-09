---
description: "Use when creating or modifying custom React hooks for data fetching and state management. Covers the use-* pattern."
applyTo: "hooks/**/*.ts"
---

# Custom Hooks Guidelines

## Hook Structure Pattern

```typescript
import { useEffect, useState } from "react";

import {
  createEntity,
  deleteEntity,
  getAllEntities,
  getEntitiesByMonth,
  updateEntity,
} from "@/lib/db/entities";
import { getMonthKey } from "@/lib/utils";

import type { Entity } from "@/lib/types";

interface UseEntitiesProps {
  defaultValues?: {
    selectedMonth?: string;
  };
}

const useEntities = ({ defaultValues }: UseEntitiesProps = {}) => {
  // State
  const [entities, setEntities] = useState<Entity[]>([]);
  const [allEntities, setAllEntities] = useState<Entity[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    defaultValues?.selectedMonth || getMonthKey(new Date()),
  );
  const [isLoading, setIsLoading] = useState(true);

  // Computed values
  const total = allEntities.reduce((sum, e) => sum + Number(e.amount), 0);
  const currentMonthTotal = entities.reduce((sum, e) => sum + Number(e.amount), 0);

  // Data loading
  const loadEntities = async () => {
    setIsLoading(true);
    try {
      const [monthData, allData] = await Promise.all([
        getEntitiesByMonth(selectedMonth),
        getAllEntities(),
      ]);
      setEntities(monthData);
      setAllEntities(allData);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleAdd = async (entity: Omit<Entity, "id">) => {
    await createEntity(entity);
    await loadEntities();
  };

  const handleUpdate = async (id: string, entity: Partial<Entity>) => {
    await updateEntity(id, entity);
    await loadEntities();
  };

  const handleDelete = async (id: string) => {
    await deleteEntity(id);
    await loadEntities();
  };

  // Effects
  useEffect(() => {
    loadEntities();
  }, [selectedMonth]);

  // Return value
  return {
    // Data
    entities,
    allEntities,
    selectedMonth,
    isLoading,
    // Computed
    total,
    currentMonthTotal,
    // Handlers
    handleAdd,
    handleUpdate,
    handleDelete,
    setSelectedMonth,
    refresh: loadEntities,
  };
};

export default useEntities;
```

## Key Patterns

### Return Object Shape

```typescript
return {
  // Data (current state)
  data,
  allData,
  selectedMonth,
  isLoading,

  // Computed values (derived state)
  total,
  categoryBreakdown,

  // Handlers (async operations)
  handleAdd,
  handleUpdate,
  handleDelete,

  // Setters (state updates)
  setSelectedMonth,
  refresh,
};
```

### Month Selection

```typescript
const [selectedMonth, setSelectedMonth] = useState<string>(
  defaultValues?.selectedMonth || getMonthKey(new Date()),
);

// Reload when month changes
useEffect(() => {
  loadData();
}, [selectedMonth]);
```

### Loading State

```typescript
const [isLoading, setIsLoading] = useState(true);

const loadData = async () => {
  setIsLoading(true);
  try {
    // fetch data
  } finally {
    setIsLoading(false);
  }
};
```

## Naming

- File: `use-{entity}.ts` (kebab-case)
- Hook function: `use{Entity}` (camelCase)
- Handlers: `handle{Action}` (handleAdd, handleUpdate, handleDelete)
