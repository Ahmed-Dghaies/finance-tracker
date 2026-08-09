---
description: "Use when creating React components, forms, or UI. Covers component patterns, shadcn/ui usage, form handling with controlled state."
applyTo: "**/*.tsx"
---

# React Component Guidelines

## Component Structure

```tsx
// 1. Imports (external → internal → types)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/lib/types";

// 2. Interface definitions
interface ComponentProps {
  onSubmit: (data: Data) => Promise<void>;
  initialData?: Data;
  isEditing?: boolean;
}

// 3. Component (named export for pages, named function for shared)
export function ComponentName({ onSubmit, initialData, isEditing = false }: ComponentProps) {
  // State declarations first
  const [value, setValue] = useState(initialData?.value || "");
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...
  };

  // Render
  return (/* JSX */);
}
```

## Form Pattern (Controlled Components)

```tsx
export function EntityForm({ onSubmit, defaultCurrency, initialData, isEditing = false }: Props) {
  // Individual state for each field
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [currency, setCurrency] = useState(initialData?.currency || defaultCurrency);
  const [category, setCategory] = useState(initialData?.category || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entity = {
      amount: Number.parseFloat(amount),
      currency,
      category,
      // Include id only when editing
      ...(isEditing && initialData && { id: initialData.id }),
    };

    onSubmit(entity);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}
```

## shadcn/ui Components

Import from `@/components/ui/*`:

```tsx
// Dialog pattern
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Select pattern
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Card pattern
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

## Common UI Patterns

### Form with Grid Layout

```tsx
<form className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <div className="flex flex-col gap-2">
      <Label htmlFor="amount">Amount *</Label>
      <Input
        id="amount"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
    </div>
    {/* More fields */}
  </div>
  <Button type="submit">Save</Button>
</form>
```

### Dialog with Form

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Add New</Button>
  </DialogTrigger>
  <DialogContent>
    <EntityForm onSubmit={handleSubmit} />
  </DialogContent>
</Dialog>
```

### Loading State

```tsx
if (isLoading) {
  return <div className="flex items-center justify-center p-8">Loading...</div>;
}
```

## Accessibility

- Always include `htmlFor` on Labels matching Input `id`
- Use `aria-label` for icon-only buttons
- Use semantic HTML (`<form>`, `<button type="submit">`)
