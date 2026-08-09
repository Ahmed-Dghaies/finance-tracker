---
agent: "agent"
description: "Add comprehensive tests for a page or component. Use when you need to write or improve test coverage."
---

# Add Tests

Write comprehensive tests for the specified file.

## Target

File to test: {{file}}

## Test Categories to Cover

1. **Loading State** - Initial loading spinner/text
2. **Data Display** - Content renders after loading
3. **Empty State** - Behavior when no data
4. **User Interactions** - Clicks, form submissions
5. **Error Handling** - API failures (if applicable)

## Guidelines

- Use `@/test/utils/test-utils` for render
- Use `setSupabaseTable()` to mock data
- Follow existing patterns in `app/*/__tests__/`
- Use descriptive test names starting with verbs
- Prefer `findBy*` for async elements
- Use `waitFor` for state changes

## Reference

Look at `app/expenses/__tests__/page.test.tsx` for patterns.
