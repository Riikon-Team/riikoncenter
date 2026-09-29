# Vibe Card Game - Deployment & Iframe Integration Guide

This document explains the security mechanisms and architectural decisions made to embed the **Vibe Card Game** (a Next.js Discord Activity) seamlessly into **RiikonCenter** without modifying its core source code.

## 1. The Challenge (CSP `frame-ancestors`)

The Game was built to run inside Discord. Its `next.config.ts` injects a strict `Content-Security-Policy`:
```
frame-ancestors 'self' https://*.discord.com https://discord.com
```
This header explicitly instructs modern browsers to **block** the game from being embedded in any `<iframe>` outside of Discord. Since we want to embed it inside RiikonCenter (`localhost:3003` or the production domain), the browser will refuse to load it.

## 2. The Development Solution: Dev Proxy

To bypass the CSP header during local development (where we don't have access to an NGINX reverse proxy), a lightweight Node.js proxy script is used.

- **File**: `apps/web/scripts/dev-proxy.mjs`
- **Port**: `3309` (Proxy) -> `3310` (Game Gateway)

### How it works:
1. The proxy acts as a "Man-In-The-Middle" between RiikonCenter and the Game Gateway.
2. It intercepts responses from the Game Gateway and forcefully **deletes** the `Content-Security-Policy` and `X-Frame-Options` headers.
3. It seamlessly upgrades and proxies WebSocket connections (`Socket.io`) so multiplayer features continue to function.

### Running in Dev:
Ensure you run both the proxy and the main workspace during development:
```bash
node apps/web/scripts/dev-proxy.mjs
```

## 3. The Production Solution: NGINX / Cloudflare

**Do NOT use `dev-proxy.mjs` in production!**

In a production environment, the infrastructure (NGINX, Traefik, or Cloudflare Workers) must be responsible for stripping the CSP headers before they reach the user's browser.

### NGINX Configuration Example:
When configuring the reverse proxy for the game's production domain (e.g., `vibe-game.riikon.center`), instruct NGINX to hide the restrictive headers:

```nginx
server {
    server_name vibe-game.riikon.center;

    location / {
        proxy_pass http://localhost:3310; # Your internal game gateway port
        
        # STRIP THE HEADERS PREVENTING IFRAME EMBEDDING
        proxy_hide_header Content-Security-Policy;
        proxy_hide_header X-Frame-Options;
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 4. Environment Switching in RiikonCenter

To ensure the RiikonCenter iframe points to the correct proxy (Dev) or domain (Production), the environment is checked in the frontend component.

File: `apps/web/app/(platform)/games/vibe-card-game/page.tsx`
```tsx
const isDev = process.env.NODE_ENV === 'development';
const src = isDev ? "http://localhost:3309" : "https://vibe-game.riikon.center";

return (
    <iframe src={src} ... />
);
```

### Summary
By utilizing a Development Proxy and NGINX header stripping, we successfully embed the game into RiikonCenter without polluting its submodule codebase (`external/vibe-card-game`) with Riikon-specific logic, maintaining a clean architectural separation.
