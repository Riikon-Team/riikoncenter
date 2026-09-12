# Implemented Use Cases Log

### Phase 4: Foundation & UI Shell - 2026-07-08
* **Implemented Use Cases:** `ThemeToggle.tsx`, `Sidebar.tsx`, `Header.tsx`, `layout.tsx`, `useSidebarStore.ts`
* **Architecture & Clean Code:** Extracted UI components (Sidebar, Header, ThemeToggle) into separate files to keep the main layout clean. Navigation logic is contained within Client Components, while the main layout remains a Server Component.
* **Optimization & UI:** Applied Zustand global state for the mobile menu toggle to prevent re-rendering the layout on interaction. Adopted a mobile-first approach using Tailwind CSS for smooth sidebar transitions.

### Phase 8: NestJS Backend API (Auth & Users) - 2026-07-08
* **Implemented Use Cases:** `CreateUserUseCase.ts`, `FindUserUseCase.ts`, `AuthService.ts` (Login, Register, Refresh)
* **Architecture & Clean Code:** Strictly adhered to DDD structure (Domain, Application, Infrastructure) and SOLID principles. Controllers only handle HTTP requests; UseCases encapsulate all business logic. Applied Dependency Inversion via `IUserRepository` to allow easy ORM swapping. Avoided using the `any` type.
* **Optimization & UI:** Implemented a minimalist but effective JWT Access + Refresh token system without heavy frameworks like Passport, saving server resources. Used `PrismaService` for centralized database connection pooling.

### Phase 5: ZenTab Core Module Migration - 2026-07-08
* **Implemented Use Cases:** 
  * **Resizable Bento Grid Section:** Weather Widget, Focus/Pomodoro Timer Widget, Notes/Editor Widget.
  * **Integrated Dialogs & Tools:** Kanban Task Board, GitHub Activity Feed Tracker, Custom Bookmarks Organizer, SoundBoard Player (Lofi, Rain, etc.), Global Settings (wallpaper presets, custom background image, blur intensity, translation languages).
  * **Core Shell Utilities:** Custom Clock & Greeting Section, Quotes engine with rotation, Search Widget (Google/DuckDuckGo), Global Hotkeys Controller (Alt/Shift shortcut combinations).
* **Architecture & Clean Code:** Integrated an isolated React SPA directly into Next.js App Router under the `/personal/zentab` path. Removed `main.tsx` and moved `i18n` config inside `ZenTabApp.tsx`. Fixed legacy TypeScript type errors (`activityDays: any[]`, string casting with `""`). Used `next/dynamic` with `ssr: false` to perfectly encapsulate client-heavy logic (localStorage bounds) without rewriting the original ZenTab architecture.
* **Optimization & UI:** Removed global HTML/body CSS overrides from ZenTab's `index.css` to prevent bleeding into the main RiikonCenter platform shell. Static assets successfully transferred to `apps/web/public`. Guaranteed zero React Hydration mismatches.

### Sidebar & Header Visibility Refinement & ZenTab Overflow Lock - 2026-07-08
* **Implemented Use Cases:** Sidebar toggling from ZenTab Header Navigation (Menu button), default hidden Header with top hover gesture to show, and Header toggle button (EyeOff) to hide. Overflow-hidden locks on the `/personal/zentab` page. Added fluid width-collapsing slide transitions (300ms ease-in-out) for the Sidebar on desktop.
* **Architecture & Clean Code:** Extended global UI state in `useSidebarStore.ts` to manage header and sidebar visibility status. Integrated conditional mounting in the `PlatformLayout` React tree, and localized path checking via Next.js `usePathname` to apply custom overflow behavior dynamically. Refactored the `Sidebar` to stay mounted and transition its parent width dynamically, wrapping content inside a static `w-64` container to prevent squeezing during the animation.
* **Optimization & UI:** Adjusted ZenTab container layout from fixed viewport dimensions (`h-screen`) to fluid parent constraints (`h-full` and `max-h-[calc(100%-60px)]`) ensuring no vertical or horizontal scrollbars occur inside the ZenTab section regardless of Header visibility. Zero hydration mismatch or extra rendering costs. Added localized translations for "Show Header" (EN/VI) reactive to localStorage, and limited the "Hide Header" trigger strictly to the ZenTab workspace path.

### Phase 7: Games & Apps Infrastructure Setup - 2026-07-08
* **Implemented Use Cases:** Created `/games` page (Games Hub) routing to individual standalone canvas games, and `/apps` page (Apps Hub) serving as a registry of platform productivity tools.
* **Architecture & Clean Code:** Handled separate dashboard layouts for index directories. Standardized grid components utilizing structural flex layouts for cards. Kept pages completely modular to separate display metadata from component implementations.
* **Optimization & UI:** Applied modern dark aesthetics with subtle monochrome hover transitions matching our design guidelines. Fully responsive layout adapting grid widths dynamically from mobile to ultra-wide viewports. Static page optimization yields instant load times.

### Port Chicken Invaders (Vue to React) - 2026-08-07
* **Implemented Use Cases:** useGameStore.ts, useGameActions.ts, useGameLoop.ts, GameEntities.tsx, GameOverlays.tsx
* **Architecture & Clean Code:** Successfully ported a heavily reactive Vue 3 engine over to a Next.js (React) component tree. Adopted Zustand for scalable global state management, replacing local reactive refs. UI layer separated into semantic components and logic moved into cleanly typed custom React hooks.
* **Optimization & UI:** Achieved 60fps React Canvas/DOM gameplay by mutating nested properties deeply within Zustand without cloning arrays every frame, triggering single shallow re-renders using a tick mechanism to bypass performance overhead.

### Port Chicken Invaders (Bugfixes & VFX Polish) - 2026-08-16
* **Implemented Use Cases:** `vfx.ts`, `useGameLoop.ts`, `useGameActions.ts`
* **Architecture & Clean Code:** Refactored Zustand usage to dynamically call `getState()` within the game loop, eliminating all stale closures caused by the initial React mount. Extracted death VFX scaling into configurable functions.
* **Optimization & UI:** Tuned particle emissions (feathers) down by 75% for less visual clutter, added expanding shockwave overlays for better feedback, and implemented boss reward mechanics (drops 3 power-ups upon defeat).
### Phase 9: Landing Page - 2026-08-16
* **Implemented Use Cases:** `HeroSection.tsx`, `ProductivitySection.tsx`, `GamingSection.tsx`, `FooterSection.tsx`, `LandingHeader.tsx`, `BackgroundObjects.tsx`, `page.tsx`
* **Architecture & Clean Code:** Built a modular landing page broken into distinct 100vh sections following strict minimalism guidelines. Components were organized under `components/landing/`. Integrated `i18next` for seamless English/Vietnamese toggling, and decoupled abstract geometry into a dedicated `BackgroundObjects` component using SVGs.
* **Optimization & UI:** Utilized CSS Scroll Snapping (`snap-y snap-mandatory`) for a presentation-like feel without JS overhead. Integrated `framer-motion` for subtle, hardware-accelerated fade-up animations and parallax floating shapes. Added an auto-hiding `LandingHeader` on scroll, and bound all background geometries to `text-foreground` with opacity to support native dark/light themes (`next-themes`) perfectly.

### Phase 10: Auth UI Redesign & API Integration - 2026-08-22
* **Implemented Use Cases:** `(auth)/layout.tsx`, `(auth)/login/page.tsx`, `(auth)/register/page.tsx`, `vi/common.json`, `en/common.json`
* **Architecture & Clean Code:** Redesigned the authentication pages with a modern split-screen layout. Utilized Client Components strictly where interactive state (`useForm`, `useState`) and localization (`react-i18next`) were needed. Replaced mock validation with Zod schemas tightly coupled to React Hook Form for robust, scalable input handling. Wired Next.js frontend to the NestJS backend API (`/api/v1/auth/login` and `register`), properly handling JWT token storage via `localStorage` and graceful error propagation back to the UI.
* **Optimization & UI:** Achieved a premium "Absolute Minimalism" aesthetic using Tailwind CSS and Lucide icons with subtle hover elements. The form is highly responsive and includes vertical scrolling constraints to prevent breaking the viewport on small screens. Implemented UX enhancements like loading spinners, cross-fading animations, and real-time form validation highlighting.

### Phase 10 (Part 3): Toast Notifications & Backend Error i18n - 2026-08-22
* **Implemented Use Cases:** `sonner.tsx`, `auth.service.ts`, `create-user.use-case.ts`, `login/page.tsx`, `register/page.tsx`, `common.json`
* **Architecture & Clean Code:** Refactored the backend to throw strictly defined translation keys (e.g., `auth.errors.invalid_credentials`) instead of hardcoded English strings, adhering to robust i18n principles. Integrated Shadcn UI's Sonner into the Next.js root layout. The frontend now parses backend error keys and translates them instantly via `react-i18next`.
* **Optimization & UI:** Replaced basic in-form red error blocks with sleek, animated Toast notifications that support light/dark modes automatically (`useTheme`). This greatly improves UX by providing non-intrusive feedback that works flawlessly in both English and Vietnamese.

### Phase 11: Backend Database & Authentication Fix - 2026-09-05
* **Implemented Use Cases:** `prisma.service.ts`, `schema.prisma`, `.env` (API)
* **Architecture & Clean Code:** Diagnosed and resolved a critical 500 Internal Server Error in the authentication flow. Removed the failing `@prisma/adapter-pg` driver adapter which crashed due to Supabase SSL requirements and missing Postgres search paths. Configured the Prisma Client to use the native Rust engine and properly explicitly set the connection to the `public` schema.
* **Optimization & UI:** Auth API is now stable with proper token generation and error handling. Verified the full login and registration flow with valid test payloads.

### Chicken Invaders i18n & UI Minimalism - 2026-09-06
* **Implemented Use Cases:** `GameHeader.tsx`, `GameOverlays.tsx`
* **Architecture & Clean Code:** Refactored the game's UI layer to support multi-language internationalization (i18n) by integrating `react-i18next`. Replaced all hardcoded Vietnamese text with translation keys mapped to `en/common.json` and `vi/common.json`.
* **Optimization & UI:** Applied a strict monochrome minimalist design by stripping heavy box-shadows and neon glows, migrating towards clean thin borders (`border-border`) and solid backgrounds to match the platform's overarching aesthetic.

### Phase 12: Dashboard Redesign & User Profile (Geometric Minimalism) - 2026-09-07
* **Implemented Use Cases:** `dashboard/page.tsx`, `layout.tsx`, `Header.tsx`, `Sidebar.tsx`, `profile/page.tsx`, `useAppStore.ts`
* **Architecture & Clean Code:** Introduced `useAppStore` (Zustand) with local storage persistence to track user's `favoriteAppIds` and `recentAppIds`. Integrated a collapsible sidebar globally into the platform layout to access these quick actions. Replaced the generic app links in the main `Header` with an interactive User Profile dropdown.
* **Optimization & UI:** Completely overhauled the Dashboard page. Removed heavy gradients and blurry AI-like aesthetics in favor of sharp "Geometric Minimalism" (thin borders, monochrome colors, strong typography). AppCards now feature a toggleable Star icon for favorites and log to Recent Apps on click.

### Phase 13: UI Refinements & ZenTab Fixes - 2026-09-08
* **Implemented Use Cases:** `dashboard/app/[id]/page.tsx`, `thumbnail-placeholder.tsx`, `locales/vi.json`, `locales/en.json`, `BentoGridSection.tsx`
* **Architecture & Clean Code:** Added a dynamic Screenshots list section with a fallback empty state. Integrated `iconUrl` into `ThumbnailPlaceholder` when thumbnail images are missing. Refactored translation files to remove redundant parenthetical hints for a cleaner UI.
* **Optimization & UI:** Fixed a margin-collapse animation stutter in ZenTab by transitioning margins to padding, and added Framer Motion blur/fade transitions to the quote text to ensure perfectly smooth widget toggling.

### Phase 14: User Profile & JWT Integration - 2026-09-08
* **Implemented Use Cases:** `Header.tsx`, `profile/page.tsx`, `auth.ts`, `en/common.json`, `vi/common.json`
* **Architecture & Clean Code:** Implemented a pure, lightweight `parseJwt` utility inside `apps/web/lib/auth.ts` to decode the existing authentication `riikon_access_token` from `localStorage` without any external dependencies like `jwt-decode`. Replaced mock layout data with reactive Next.js state based on the JWT payload. Full i18n support applied across all profile sections using `react-i18next`.
* **Optimization & UI:** Fixed Header dropdown transparency by forcing `bg-background` and increasing shadows to prevent content overlap. Ensured the profile UI defaults gracefully to loading states and redirects unauthenticated users automatically to `/login` via `useRouter`.

### Phase 15: Profile Layout Redesign & App History Integration - 2026-09-08
* **Implemented Use Cases:** `profile/page.tsx`, `useAppStore.ts`, `vi/common.json`, `en/common.json`
* **Architecture & Clean Code:** Refactored the Profile page from a rigid 1/3 grid into a fluid inner-sidebar layout using state-driven tab switching (`activeTab`). Integrated `useAppStore` to dynamically fetch and cross-reference `favoriteAppIds` and `recentAppIds` with actual app metadata via `getBuiltinApps` and `getThirdPartyApps`.
* **Optimization & UI:** Overhauled the typography system to enforce "Sentence case" across all translation files, removing harsh `uppercase` and `tracking-wider` CSS utilities. Softened the entire interface by applying `rounded-2xl` corners to cards and inputs, creating a more organic, user-friendly aesthetic that diverges from AI-generated defaults. Khai tử tab "Thông báo" (Notifications) and added an empty "Về chúng tôi" (About Us) stub for future user customization.

### Phase 16: Landing Hero Section Redesign & Green Accent Palette - 2026-09-09
* **Implemented Use Cases:** `HeroSection.tsx`, `BackgroundObjects.tsx`, `vi/common.json`, `en/common.json`
* **Architecture & Clean Code:** Refactored the Hero section to adopt a left-aligned, high-conviction typography layout. Separated floating geometric visual objects into `BackgroundObjects.tsx`. Completely eliminated hardcoded color themes, centralizing CTA button copy and route mapping to `/dashboard` and `/about-us` via i18n dictionary.
* **Optimization & UI:** Implemented a modern layout with a vibrant True Green accent color (`bg-green-600`) that seamlessly supports both Light and Dark modes. Softened button border radius to `rounded-xl` for modern tactile feel, fully responsive across mobile and desktop viewports.

### Phase 17: Organization Apps Integration (Demo) - 2026-09-12
* **Implemented Use Cases:** `konnns-extension` (Embedded Iframe), `simple-custom-markdown-converter` (Native UI)
* **Architecture & Clean Code:** Integrated two external organization repositories using Turborepo and Git Submodules. Added `middleware.ts` to `konnns-extension` to block direct browser access via `Referer`. Bypassed WXT's Chrome Extension Dev Server by dropping in a standard Vite configuration, allowing the React UI to run seamlessly as an Iframe Web App on port 3304. Registered `simple-custom-markdown-converter` as a Workspace package to be utilized natively within Next.js.
* **Optimization & UI:** Built a custom Native UI page for `markdown-converter` matching the platform's Dark mode aesthetics, complete with live Markdown-to-HTML rendering. Created a 100% viewport Iframe wrapper for `konnns-extension` running on port 3304, maintaining the platform's Sidebar navigation intact.

### Markdown Converter UI (Integration) - 2026-09-12
* **Implemented Use Cases:** `MarkdownConverterPage.tsx`, `riikoncenter-manifest.json`
* **Architecture & Clean Code:** Separated UI tools from the core markdown library. Integrated formatting tools (Prettier) directly into the client-side component (RawHtmlViewer) for clear separation of concerns. Injected submodule README into manifest dynamically.
* **Optimization & UI:** Used dynamic imports for heavy formatting libraries to avoid client-side bloat. Fully responsive grid layouts. Seamless auto-formatting state triggers without performance hits.

### Dashboard UI Refinements - 2026-09-12
* **Implemented Use Cases:** `dashboard/page.tsx`, `dashboard/app/[id]/page.tsx`, `locales/vi/common.json`
* **Architecture & Clean Code:** Standardized translations across the stats panel, specifically replacing long text with cleaner strings (e.g. "Repository").
* **Optimization & UI:** Improved typography readability by replacing `tracking-wider` with `tracking-normal`, removing `capitalize` transforms, and softening action buttons from `font-bold` to `font-semibold`. Tuned the primary CTA button text size down to 14px (`text-sm`) for better proportion inside app cards.