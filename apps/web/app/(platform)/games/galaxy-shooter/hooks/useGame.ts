import { useGameStore } from '../store/useGameStore'
import { useControls } from './useControls'
import { useGameActions } from './useGameActions'
import { useGameLoop } from './useGameLoop'
import { useEffect } from 'react'

export function useGame() {
  const controls = useControls()
  const actions = useGameActions(controls)

  // Start the game loop
  useGameLoop(controls, actions)

  const setPointerState = (clientX?: number, clientY?: number, isDown?: boolean) => {
    if (isDown !== undefined) controls.pointerState.current.isDown = isDown
    const state = useGameStore.getState()
    if (state.gameState !== 'playing' && state.gameState !== 'starting') return

    if (clientX !== undefined && clientY !== undefined && clientX !== -1) {
      const translated = controls.getTranslatedPointer(clientX, clientY, state.boardRotation)
      if (translated) {
        const logical_cx = state.activeWidth / 2
        const logical_cy = state.activeHeight / 2
        
        const newX = Math.max(
          0,
          Math.min(
            logical_cx + translated.local_dx - state.player.width / 2,
            state.activeWidth - state.player.width,
          ),
        )
        const newY = Math.max(
          0,
          Math.min(
            logical_cy + translated.local_dy - state.player.height / 2,
            state.activeHeight - state.player.height,
          ),
        )

        state.player.x = newX
        state.player.y = newY
      }
    }
  }

  const handleBoardPointerDown = (e: React.PointerEvent) => {
    const state = useGameStore.getState()
    if (state.gameState === 'paused' && e.pointerType === 'mouse') {
      actions.resumeGame()
    } else {
      setPointerState(e.clientX, e.clientY, true)
    }
  }

  return {
    controls,
    actions,
    setPointerState,
    handleBoardPointerDown,
  }
}

export type GameContext = ReturnType<typeof useGame>
