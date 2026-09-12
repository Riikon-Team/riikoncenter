# RiikonCenter - Task List

Based on the `MASTER_REQUIREMENT.md`, here is the checklist of tasks required to set up the project documentation and initial codebase scaffold.

## 1. Architecture Documentation (`docs/architecture/`)
- [x] `SYSTEM_DESIGN.md` — Overall system design, C4 diagram
- [x] `FRONTEND_ARCHITECTURE.md` — Detailed frontend architecture
- [x] `BACKEND_ARCHITECTURE.md` — DDD + NestJS structure
- [x] `DATABASE_SCHEMA.md` — ERD + Prisma schema
- [x] `API_SPECIFICATION.md` — OpenAPI spec (YAML)

## 2. Development Documentation (`docs/dev/`)
- [x] `SETUP_GUIDE.md` — Environment setup guide
- [x] `CODING_STANDARDS.md` — Coding standards (SOLID, DDD, Clean Code)
- [x] `COMPONENT_GUIDE.md` — How to create a new component
- [x] `ADDING_NEW_GAME.md` — Guide to adding a new game
- [x] `ADDING_NEW_APP.md` — Guide to adding a new standalone app

## 3. Design Documentation (`docs/design/`)
- [x] `DESIGN_SYSTEM.md` — All design tokens, component variants
- [x] `UI_PATTERNS.md` — Layout patterns, responsive breakpoints

## 4. Codebase Scaffold
- [x] Monorepo root files: `package.json`, `turbo.json`, `pnpm-workspace.yaml`
- [x] `apps/web/` — Next.js app scaffold with full folder structure
- [x] `apps/api/` — NestJS app scaffold with DDD structure
- [x] `packages/ui/` — Shared UI library scaffold
- [x] `packages/types/` — Shared types scaffold
- [x] `.env.example` for both `web` and `api`
- [x] `docker-compose.yml` for development (Postgres + Redis)

## 5. Phase 4: Foundation & UI Shell
- [x] Install `next-themes` and configure `ThemeProvider`
- [x] Create `ThemeToggle` component
- [x] Create responsive `Sidebar` component
- [x] Create `Header` component with mobile trigger
- [x] Compose `app/(platform)/layout.tsx`
- [x] Create `/dashboard` placeholder page
- [x] Create Auth UI Skeleton (`/login`, `/register`)

## 6. Phase 5 & 6: Personal Modules
- [x] Migrate ZenTab widgets (Clock, Pomodoro, Weather)
- [x] Implement ZenTab localStorage sync (Client-side dynamics)
- [ ] Build Study Background Customizer
- [ ] Build Study Focus Timer & Notes

## 7. Phase 7: Games & Apps
- [x] Build Games Hub listing page
- [x] Port Chicken Invaders Canvas game
- [x] Build Standalone Apps registry

## 8. Phase 8: Backend API
- [x] Implement NestJS Auth Module (JWT)
- [x] Connect Prisma & PostgreSQL
- [ ] Implement Preferences sync endpoints

## 9. Phase 9: Landing Page
- [x] Build minimal Hero, Productivity, and Gaming sections
- [x] Implement dynamic i18n
- [x] Add auto-hiding header and smooth scrolling

## 10. Phase 10 & 11: Auth UI & Stable Backend
- [x] Redesign Login/Register with split-screen modern UI
- [x] Integrate backend JWT authentication and fix Prisma SSL issue
- [x] Implement global Toast error handling (Sonner) with dynamic i18n keys

## 11. Phase 12: Hub Apps System
- [x] Define `AppManifest` schema
- [x] Implement dynamic JSON import for built-in apps (`lib/apps.ts`)

## 12. Phase 13: User Profile Page
- [x] Build user profile view with About Us, Settings, and Favorites
- [x] Implement Header dropdown using Shadcn UI
- [x] Create persistent history via global Zustand store

## 13. Phase 14: Polishing
- [x] Fix Chicken Invaders input logic (Tap vs Hold separation)
- [x] Enhance physics scaling and translation logic for game loop
