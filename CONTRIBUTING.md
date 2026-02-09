# Contributing to Agente Tributário

Thank you for contributing to Agente Tributário! This document provides guidelines for development, code standards, and workflow.

---

## 🎯 Development Workflow

### 1. Pick a Story

Stories are in `docs/stories/` with format `story-X.Y.Z.md`. Check the [Development Dashboard](./docs/DASHBOARD.md) for current assignments.

### 2. Create Feature Branch

```bash
git checkout -b feature/story-1.1-project-setup develop
```

**Branch naming convention:**
- `feature/story-X.Y-description` — New features
- `fix/issue-description` — Bug fixes
- `docs/update-type` — Documentation updates
- `chore/update-type` — Maintenance

### 3. Work on Story Tasks

Each story has checkbox tasks. Update progress as you complete:

```markdown
**Phase 1: Repository Setup**
- [x] GitHub repo created with Turborepo initialized  ✅
- [ ] Folder structure created (apps, packages)
```

### 4. Testing Requirements

**Before marking ANY task complete:**

```bash
# 1. Run all checks
npm run lint       # Must have 0 errors/warnings
npm run typecheck  # Must have 0 TypeScript errors
npm test           # All tests must pass
npm run build      # Must build successfully

# 2. If all pass, commit
git add .
git commit -m "feat: complete story 1.1 phase 1 [Story 1.1]"
```

### 5. Submit for Review

```bash
# Push to GitHub
git push origin feature/story-1.1-project-setup

# Create Pull Request (handled by @github-devops agent)
```

---

## 📋 Code Standards

### TypeScript

**Always use strict mode:**

```typescript
// ✅ GOOD
interface User {
  id: string;
  name: string;
  email: string | null; // Explicit nullable
}

const user: User = {
  id: "123",
  name: "John",
  email: null
};

// ❌ BAD
const user: any = { /* ... */ };
const name: string | undefined | null = ...;
```

**No implicit any:**

```typescript
// ✅ GOOD
function calculate(a: number, b: number): number {
  return a + b;
}

const handler = (event: Event) => { /* ... */ };

// ❌ BAD
function calculate(a, b) { /* ... */ }
const handler = (event) => { /* ... */ };
```

### Component Naming

```typescript
// ✅ GOOD - PascalCase
export function DashboardHeader() { /* ... */ }
export const AnalysisCard = () => { /* ... */ };

// ❌ BAD - lowercase
export function dashboardHeader() { /* ... */ }
export const analysisCard = () => { /* ... */ };
```

### Function Organization

```typescript
// ✅ GOOD
export function processData(input: string): Result {
  // 1. Validate input
  if (!input) throw new Error("Input required");

  // 2. Transform
  const data = transform(input);

  // 3. Return result
  return { success: true, data };
}

// ❌ BAD - No structure
export function processData(input) {
  if (!input) throw new Error("...");
  return { data: input.toUpperCase() };
}
```

### Error Handling

```typescript
// ✅ GOOD
try {
  const response = await fetchData();
  return response.data;
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error(`Failed to fetch data: ${message}`);
  throw new Error(`Failed to fetch data: ${message}`);
}

// ❌ BAD
try {
  return await fetchData();
} catch (e) {
  console.log(e);
}
```

### Documentation

```typescript
/**
 * Calculates tax impact based on company data
 *
 * @param company - Company information
 * @param regime - Tax regime (SIMPLES or LUCRO)
 * @returns Calculated tax impact in reais
 * @throws Error if company data is invalid
 */
export function calculateTaxImpact(
  company: Company,
  regime: TaxRegime
): number {
  // Implementation
}
```

---

## 🧪 Testing Standards

### Unit Tests

```typescript
// ✅ GOOD
describe("calculateTaxImpact", () => {
  it("should calculate correct tax for SIMPLES regime", () => {
    const company = { revenue: 100000, employees: 2 };
    const result = calculateTaxImpact(company, "SIMPLES");
    expect(result).toBeCloseTo(5000, 2);
  });

  it("should throw error for invalid company data", () => {
    expect(() => calculateTaxImpact({} as any, "SIMPLES")).toThrow();
  });
});

// ❌ BAD
describe("calculateTaxImpact", () => {
  it("works", () => {
    const result = calculateTaxImpact({}, "");
    expect(result).toBeDefined();
  });
});
```

### React Component Tests

```typescript
// ✅ GOOD
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("LoginForm", () => {
  it("should submit form with email and password", async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123"
    });
  });

  it("should show validation error for empty email", async () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText(/email required/i)).toBeInTheDocument();
  });
});
```

### Coverage Requirements

```bash
# Coverage targets
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

# Check coverage
npm test -- --coverage
```

---

## 🎨 Code Formatting

**Prettier runs automatically on commit. Manual format:**

```bash
npm run format
```

**Key rules:**
- Line length: 100 characters
- Tab width: 2 spaces
- Semicolons: always
- Quotes: double (for JSX, single elsewhere)
- Trailing commas: ES5 style

---

## 🚀 Git Commit Messages

**Format:**
```
<type>: <description> [<story-id>]

<optional body>
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Formatting (no logic change)
- `refactor:` — Code restructuring
- `test:` — Adding/updating tests
- `chore:` — Build, deps, etc.

**Examples:**
```bash
feat: implement tax analysis engine [Story 1.2]
fix: resolve database connection timeout [Bug-123]
docs: update API documentation
test: add unit tests for tax calculator
chore: upgrade dependencies
```

---

## 📝 Story Completion Checklist

Before marking a story **DONE**:

- [ ] All tasks completed with [x] checkboxes
- [ ] All acceptance criteria met
- [ ] All tests passing: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Code builds: `npm run build`
- [ ] GitHub Actions pipeline green
- [ ] No console errors or warnings in dev
- [ ] Documentation updated
- [ ] File List in story updated
- [ ] Debug Log updated with completion notes
- [ ] Change Log updated
- [ ] No unrelated changes included

---

## 🚨 Common Mistakes

### ❌ DON'T commit:

```typescript
// Debugging code
console.log("DEBUG:", userData);
debugger;

// Hardcoded values
const API_URL = "http://localhost:3001";
const SECRET = "my-secret-key";

// Incomplete types
const data: any = response.data;
```

### ✅ DO instead:

```typescript
// Use logger
logger.debug("userData", userData);

// Use environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SECRET = process.env.SECRET_KEY;

// Proper types
interface ApiResponse {
  data: UserData;
}
const data: UserData = response.data;
```

---

## 🔄 Code Review Process

1. **Automated Checks** (GitHub Actions)
   - Linting passes
   - Type checking passes
   - Tests pass
   - Build succeeds

2. **Code Review** (Team members)
   - Code follows standards
   - Logic is correct
   - Tests are adequate
   - Documentation is clear

3. **Approval & Merge**
   - ✅ All checks pass
   - ✅ At least 1 approval
   - Merge to develop/main

---

## 📚 Useful Commands

```bash
# See what changed
git status
git diff

# View commit history
git log --oneline -10

# Check if branch is up to date
git fetch origin
git log --oneline main..origin/main

# Update from develop
git fetch origin develop
git merge origin/develop

# View files changed in PR
git diff main..feature/your-branch -- --stat
```

---

## 🆘 Getting Help

1. **Check existing issues:** [GitHub Issues](https://github.com/yourusername/agente-tributario/issues)
2. **Ask in discussions:** [GitHub Discussions](https://github.com/yourusername/agente-tributario/discussions)
3. **Team coordination:** See [DASHBOARD.md](./docs/DASHBOARD.md) for team contacts
4. **Documentation:** Check [docs/](./docs/) folder

---

## 🎓 Learning Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Turbo Repository](https://turbo.build/repo/docs)

---

**Thank you for contributing! 🙏**

Last updated: Feb 9, 2026
