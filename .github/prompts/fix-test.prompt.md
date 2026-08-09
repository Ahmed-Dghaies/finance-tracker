---
agent: "agent"
description: "Debug and fix a failing test. Use when tests are failing and you need help understanding why."
---

# Fix Failing Test

Analyze and fix the failing test.

## Problem

Test file: {{testFile}}
Error message: {{error}}

## Debugging Steps

1. Read the test file to understand what it's testing
2. Read the component being tested
3. Check if mock data matches expected format
4. Verify selectors (aria-labels, text, roles) match actual DOM
5. Check for async timing issues (missing `waitFor`, `findBy*`)

## Common Issues

- **Element not found**: Check aria-labels in component match test selectors
- **Timeout**: Add proper `waitFor` or use `findBy*` queries
- **Mock data mismatch**: Verify `setSupabaseTable` data matches DB schema (snake_case)
- **State not updated**: Ensure async operations complete before assertions
