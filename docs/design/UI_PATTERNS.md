# UI Patterns

## Overview
This document defines common layouts and structural patterns used across RiikonCenter.

## Layout Patterns

### 1. App Shell (Dashboard Layout)
- **Top Bar:** Search, User Profile, Notifications.
- **Sidebar:** Navigation links (Dashboard, ZenTab, Study, Games, Apps).
- **Main Content Area:** Renders the specific page content.

### 2. Full-Screen Focus Layout (ZenTab / Study With Me)
- Hides the main sidebar.
- Uses absolute positioning for floating controls or a minimalistic top bar.
- Emphasizes the main canvas area (e.g., Background + Timer).

### 3. Game Layout
- Contains a centered canvas or game container.
- Persistent "Exit" button to return to the Hub.
- Mobile controls (D-Pad / Action buttons) overlaid if on a touch device.

## Responsive Breakpoints
- **sm (640px):** Mobile landscape / Small tablets.
- **md (768px):** Tablets. Switch from bottom-nav/hamburger to sidebar.
- **lg (1024px):** Laptops.
- **xl (1280px):** Desktop screens.
- **2xl (1536px):** Large displays. Limit maximum width of content containers (e.g., `max-w-7xl`).
