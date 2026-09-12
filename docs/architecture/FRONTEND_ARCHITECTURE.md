# Frontend Architecture

## Overview
The frontend is built using Next.js 14+ with the App Router. It serves as a shell application that hosts multiple distinct modules (ZenTab, Study With Me, Games, and Standalone Apps).

## Technology Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (Utility classes only)
- **State Management:** Zustand (Global State) + React Query (Server State)
- **Component Library:** Shadcn/UI (Base)

## Routing Architecture
The Next.js App Router enables group routing to isolate layouts without affecting the URL structure.

```mermaid
graph TD
    Root[Root Layout] --> Auth[(auth) Group]
    Root --> Platform[(platform) Group]
    
    Auth --> Login[/login]
    Auth --> Register[/register]
    
    Platform --> Dashboard[/dashboard]
    Platform --> Personal[/personal/]
    Platform --> Games[/games/]
    Platform --> Apps[/apps/]
    
    Personal --> ZenTab[/personal/zentab]
    Personal --> Study[/personal/study]
```

## State Management
1. **Local State (React `useState`):** Used for component-specific, ephemeral state.
2. **Global Client State (Zustand):** Used for user preferences, dark mode, and UI toggles.
3. **Server State (React Query):** Used for data fetching, caching, and syncing with the NestJS backend.
4. **Offline Storage (`localStorage`):** Used primarily by ZenTab and Study modules for stateless functionality.
