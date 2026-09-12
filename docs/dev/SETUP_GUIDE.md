# Environment Setup Guide

## Prerequisites
- Node.js (v20+)
- pnpm (v9+)
- Docker & Docker Compose

## Initial Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` in both `apps/web` and `apps/api`.
   ```bash
   cp apps/web/.env.example apps/web/.env
   cp apps/api/.env.example apps/api/.env
   ```

3. **Start Infrastructure (PostgreSQL & Redis):**
   ```bash
   docker-compose up -d
   ```

4. **Initialize Database:**
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   ```

5. **Start Development Servers:**
   At the root of the project:
   ```bash
   pnpm run dev
   ```
   This will start both the Next.js shell on `localhost:3000` and the NestJS API on `localhost:4000`.
