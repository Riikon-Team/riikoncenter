# RiikonCenter - Implementation Plan

This document outlines the step-by-step plan to create the documentation and codebase scaffold as requested in `MASTER_REQUIREMENT.md`.

## Phase 1: Documentation Generation
**Goal:** Create all required technical, development, and design documents.
**Rules:** Write in English, use Mermaid for diagrams, ensure valid code examples.

### 1.1 Architecture Documentation
- Create `docs/architecture/SYSTEM_DESIGN.md` (Context & Container diagrams).
- Create `docs/architecture/FRONTEND_ARCHITECTURE.md` (Next.js App Router structure, State management).
- Create `docs/architecture/BACKEND_ARCHITECTURE.md` (NestJS DDD structure, Data flow).
- Create `docs/architecture/DATABASE_SCHEMA.md` (Prisma schema overview, Mermaid ERD).
- Create `docs/architecture/API_SPECIFICATION.md` (Initial OpenAPI YAML for Auth & Users).

### 1.2 Design Documentation
- Create `docs/design/DESIGN_SYSTEM.md` (Colors, Typography, Component rules).
- Create `docs/design/UI_PATTERNS.md` (Layouts, Routing architecture mappings).

### 1.3 Development Documentation
- Create `docs/dev/SETUP_GUIDE.md` (Docker, pnpm, Env variables).
- Create `docs/dev/CODING_STANDARDS.md` (SOLID, File size limits, Clean code).
- Create `docs/dev/COMPONENT_GUIDE.md` (Prop limits, Naming conventions).
- Create `docs/dev/ADDING_NEW_GAME.md` (Game interface, HUD requirements).
- Create `docs/dev/ADDING_NEW_APP.md` (Standalone app metadata).

## Phase 2: Monorepo Scaffold
**Goal:** Set up the Turborepo workspace and create the foundational folders and config files.
**Rules:** Only use pre-approved libraries.

### 2.1 Workspace Setup
- Initialize root `package.json`, `pnpm-workspace.yaml`, and `turbo.json`.
- Create root `.env.example` and `docker-compose.yml`.

### 2.2 Shared Packages (`packages/`)
- **`packages/types`**: Scaffold TS config and basic types (e.g., `TUserPreferences`).
- **`packages/ui`**: Scaffold shared UI components structure (Tailwind config, Shadcn/UI base).
- **`packages/config`**: Scaffold shared ESLint and TypeScript configs.

### 2.3 Frontend Shell (`apps/web/`)
- Initialize Next.js app (App Router, Tailwind, TS).
- Create route groups `(auth)`, `(platform)`.
- Set up module folders: `/personal/zentab`, `/personal/study`, `/games`, `/apps`.
- Configure Zustand and React Query providers.

### 2.4 Backend Core (`apps/api/`)
- Initialize NestJS app.
- Setup DDD structure: `modules/auth`, `modules/users`, `modules/preferences`.
- Configure Prisma client.

## Phase 3: Review and Refine
- Ensure all documents are cross-linked correctly.
- Verify that the scaffold adheres to the constraints (no unapproved libraries).
- Final user review before moving to actual feature implementation (Modules 1-4).

## Phase 4: Foundation & UI Shell
**Goal:** Build the core layouts, sidebar, header, and theme switching.
### 4.1 Layout Components
- Create `Sidebar`, `Header`, and `ThemeToggle` components.
- Implement responsive Sidebar (hidden on mobile, hamburger menu).
- Integrate `next-themes` for Dark/Light mode toggle.
### 4.2 Auth UI Skeleton
- Set up login/register page placeholders in `(auth)`.

## Phase 5: ZenTab Module (`/personal/zentab`)
**Goal:** Migrate existing React code to Next.js App Router.
- Port Clock, Pomodoro, Weather, and Quote widgets.
- Configure `localStorage` for state management without a backend.

## Phase 6: Study Module (`/personal/study`)
**Goal:** Implement the immersive Pomodoro and background player.
- Create Music Player and Background Customization components.
- Implement Focus Timer and Quick Notes.

## Phase 7: Games Hub & Standalone Apps
**Goal:** Implement the Games directory and the Standalone app container.
- Port "Chicken Invaders" canvas game to React.
- Create metadata registration for `/apps`.

## Phase 8: Backend Integration (NestJS)
**Goal:** Connect frontend with backend for Auth and Preferences sync.
- Implement JWT Auth in NestJS.
- Connect `Prisma` to PostgreSQL.
- Add React Query hooks in frontend to fetch/sync user preferences.
