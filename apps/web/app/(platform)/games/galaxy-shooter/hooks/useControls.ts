import { useEffect, useRef } from 'react'
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/config'

export function useControls() {
  const mobileKeys = useRef({ left: false, right: false, fire: false })
  const pointerState = useRef({ isDown: false })
  const keys = useRef<Record<string, boolean>>({})
  const mousePressed = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false
    }
    const handleMouseDown = () => {
      mousePressed.current = true
    }
    const handleMouseUp = () => {
      mousePressed.current = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchstart', handleMouseDown)
    window.addEventListener('touchend', handleMouseUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchstart', handleMouseDown)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [])

  const getTranslatedPointer = (clientX: number, clientY: number, boardRotation: number) => {
    const boardEl = document.getElementById('touch-layer')
    if (!boardEl) return null
    const rect = boardEl.getBoundingClientRect()

    const localX = ((clientX - rect.left) / rect.width) * GAME_WIDTH
    const localY = ((clientY - rect.top) / rect.height) * GAME_HEIGHT

    const cx = GAME_WIDTH / 2
    const cy = GAME_HEIGHT / 2
    const dx = localX - cx
    const dy = localY - cy

    const theta = (boardRotation * Math.PI) / 180
    const local_dx = dx * Math.cos(-theta) - dy * Math.sin(-theta)
    const local_dy = dx * Math.sin(-theta) + dy * Math.cos(-theta)

    return { local_dx, local_dy }
  }

  // To match the previous Vue reactive behavior in a way that doesn't trigger re-renders,
  // we expose getters for the key states.
  const isKeyPressed = (key: string) => !!keys.current[key]
  
  const getKeys = () => ({
    w: isKeyPressed('w') || isKeyPressed('W'),
    a: isKeyPressed('a') || isKeyPressed('A'),
    s: isKeyPressed('s') || isKeyPressed('S'),
    d: isKeyPressed('d') || isKeyPressed('D'),
    ArrowUp: isKeyPressed('ArrowUp'),
    ArrowDown: isKeyPressed('ArrowDown'),
    ArrowLeft: isKeyPressed('ArrowLeft'),
    ArrowRight: isKeyPressed('ArrowRight'),
    space: isKeyPressed(' ') || isKeyPressed('Spacebar'),
    Escape: isKeyPressed('Escape'),
  })

  return {
    mobileKeys,
    pointerState,
    getKeys,
    mousePressed,
    getTranslatedPointer,
  }
}
