---
agent: "agent"
description: "Review code for best practices, patterns, and potential issues. Use for code review or refactoring suggestions."
---

# Code Review

Review the specified code for quality and adherence to project patterns.

## Target

Files to review: {{files}}

## Review Checklist

### TypeScript

- [ ] Proper typing (no implicit `any`)
- [ ] Type imports using `import type`
- [ ] Interfaces for props and data shapes

### React Patterns

- [ ] Proper hook usage (dependencies, cleanup)
- [ ] Controlled components for forms
- [ ] Loading and error states handled
- [ ] Accessibility (labels, aria attributes)

### Project Conventions

- [ ] Import order (external → internal → types)
- [ ] File naming (kebab-case)
- [ ] Component naming (PascalCase)
- [ ] Using `@/` path aliases

### Data Layer

- [ ] Error handling (`if (error) throw error`)
- [ ] Type transformations (snake_case ↔ camelCase)
- [ ] Date format handling

## Output

Provide:

1. Issues found with severity (error/warning/suggestion)
2. Specific code changes if needed
3. Positive observations (patterns followed correctly)
