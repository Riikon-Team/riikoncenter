# Adding a New Standalone App

## Overview
Standalone apps live under `/apps`. They are treated as black boxes and self-manage their state. They do not share backend logic with the core platform.

## Registration Metadata
Each app must register itself using the following interface:

```typescript
export interface StandaloneApp {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'tool' | 'entertainment' | 'other';
  isEmbedded: boolean;      // true if embedding an external UI (iframe)
  externalUrl?: string;     // URL if isEmbedded is true
  hasOwnBackend: boolean;   // true if it has a dedicated backend
  backendUrl?: string;
}
```

## Implementation Rules
- Keep the UI bounded within its container.
- If it requires authentication, it should request a token from the host app via a defined bridge, rather than implementing its own auth flow directly (unless completely external).
