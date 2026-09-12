# Adding a New Game

## Requirements
- Games are entirely frontend-based (no backend dependencies).
- Strictly adhere to the Design System.
- Must provide navigation back to the Games Hub.
- Mobile and desktop support is mandatory.

## Template
Every new game must export a default component fulfilling the `GameProps` interface.

```tsx
export interface GameProps {
  onExit: () => void;       // Navigate back to /games
  onPause?: () => void;
}
```

## Structure
A complete game component should contain:
1. **GameHUD:** Score, lives, current level.
2. **PauseMenu:** Must include an "Exit to Hub" button.
3. **GameOverScreen:** Must include "Play Again" and "Exit" buttons.
4. **Mobile Controls:** Necessary if the game relies on keyboard input on desktop.
