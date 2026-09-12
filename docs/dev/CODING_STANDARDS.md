# Coding Standards

## General Rules
1. **TypeScript Only:** No `.js` or `.jsx` files. Do not use `any`; use `unknown` if the type is truly unknown.
2. **Error Handling:** Always wrap asynchronous operations in `try/catch` or handle promises explicitly.
3. **Comments:** Write JSDoc comments for any complex business logic.

## Clean Code
1. **Correctness > Performance > Readability > Cleverness.**
2. **Explicit > Implicit.**
3. **Simple > Complex.**

## Frontend Standards
- **File Size:** Maximum 150 lines of code per component file.
- **Responsibility:** Each component must do exactly one thing.
- **Naming:**
  - Components: `PascalCase` (e.g., `ClockWidget.tsx`)
  - Hooks: `camelCase` starting with `use` (e.g., `useWeather.ts`)
  - Utils: `camelCase` (e.g., `formatTime.ts`)
  - Constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_TODOS = 100`)
  - Types/Interfaces: `PascalCase` starting with `T` or `I` (e.g., `TUserPreferences`)

## Backend Standards
- Adhere strictly to **SOLID** principles.
- **SRP:** Controllers only parse HTTP requests/responses. Services handle business logic.
- **DDD:** Organize code by domains (Auth, Users, Preferences).
