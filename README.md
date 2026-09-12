# RiikonCenter

RiikonCenter is a multi-purpose web platform and monorepo that consolidates several personal management tools, games, and utility applications into a single ecosystem.

## Workspace Structure

This project uses Turborepo to manage multiple applications and shared packages.

- `apps/web`: The main Next.js frontend application serving as the shell platform for all sub-apps.
- `apps/api`: The NestJS backend server handling business logic, authentication, and database operations.
- `packages/ui`: Shared React components (based on shadcn/ui).
- `packages/types`: Shared TypeScript definitions and DTOs.
- `packages/config`: Shared configurations (ESLint, TypeScript, Tailwind).
- `external/`: External applications integrated as Git Submodules that run within our repository but are not built natively into RiikonCenter.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Zustand, React Query.
- **Backend**: NestJS, Prisma, PostgreSQL, Redis.
- **Tooling**: Turborepo, pnpm, TypeScript, Vite (for external wrappers).

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- pnpm (v9+)
- PostgreSQL
- Redis

### Installation

1. Clone the repository and initialize submodules:
   ```bash
   git clone <repository-url>
   cd riikoncenter
   git submodule update --init --recursive
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and update the required values (Database URL, Redis connection, etc.).

4. Setup the database:
   ```bash
   cd apps/api
   npx prisma migrate dev
   ```

### Development

Run the local development server for the entire workspace:
```bash
npm run dev
```

The system will start the following services:
- Web Application: `http://localhost:3003`
- API Server: `http://localhost:8008`
- External Wrappers: `http://localhost:3304`

## Documentation

Detailed architectural decisions, system design, and the external submodule integration strategy (Wrapper Mode) are documented in the [`docs/`](./docs) directory.
