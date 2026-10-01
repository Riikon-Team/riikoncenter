# RiikonCenter

RiikonCenter is a multi-purpose web platform and monorepo that consolidates several personal management tools, games, and utility applications into a single ecosystem.

## Workspace Structure

This project uses Turborepo to manage multiple applications and shared packages.

- `apps/web`: The main Next.js frontend application serving as the shell platform for all sub-apps.
- `apps/api`: The NestJS backend server handling business logic, authentication, and database operations.
- `packages/ui`: Shared React components (based on shadcn/ui).
- `packages/types`: Shared TypeScript definitions and DTOs.
- `packages/config`: Shared configurations (ESLint, TypeScript, Tailwind).

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Zustand, React Query.
- **Backend**: NestJS, Prisma, PostgreSQL, Redis.
- **Tooling**: Turborepo, pnpm, TypeScript, Docker.

## Getting Started

### Prerequisites

- Node.js (v20 or newer)
- pnpm (v11+)
- Docker & Docker Compose (for production/isolated deployment)
- PostgreSQL (or Supabase)
- Redis (or Upstash)

### Installation (Local Development)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd riikoncenter
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   Create a single `.env` file at the root of the project. You must define the following variables:
   ```env
   # Core Ports
   PORT=3305

   # Database Configuration
   DATABASE_URL="postgresql://user:password@host:5432/postgres?schema=riikoncenter"

   # Redis Configuration
   REDIS_URL="redis://default:password@host:6379"

   # Security
   JWT_SECRET="your-jwt-secret"

   # Github Configuration (Authentication via Github App)
   NEXT_PUBLIC_GITHUB_ORG="Riikon-Team"
   GITHUB_APP_ID="your-github-app-id"
   GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

   # Application URLs
   FRONTEND_URL=http://localhost:3003
   NEXT_PUBLIC_API_URL=http://localhost:3305/api/v1
   ```

4. **Run the development server:**
   Go back to the root directory and start the entire workspace concurrently:
   ```bash
   pnpm dev
   ```
   *Note: Prisma Client is automatically generated after `pnpm install` via the postinstall script.*

   The system will start the following services:
   - Web Application (Next.js): `http://localhost:3003`
   - API Server (NestJS): `http://localhost:3305` (or whatever `PORT` you defined)

### Docker Deployment

RiikonCenter is fully containerized and configured to run smoothly with Docker Compose using the single root `.env` file. All environment variables, ports, and internal routing (Nginx) are automatically handled.

1. Ensure your `.env` file at the root is fully populated.
2. Build and start the containers:
   ```bash
   docker compose up -d --build
   ```
3. The platform will be securely served behind the Nginx gateway on port `80`.

## Documentation

Detailed architectural decisions, coding rules, and system design are documented in the [`docs/`](./docs) directory.
