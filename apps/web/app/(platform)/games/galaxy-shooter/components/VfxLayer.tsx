import React, { useRef, useEffect } from 'react'
import { vfx } from '../utils/vfx'
import { useGameStore } from '../store/useGameStore'

export default function VfxLayer() {
  const { activeWidth, activeHeight, boardRotation, isRotating } = useGameStore()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let rafId = 0
    const loop = () => {
      if (canvasRef.current) {
        vfx.updateAndDraw(canvasRef.current.width, canvasRef.current.height)
      }
      rafId = requestAnimationFrame(loop)
    }

    if (canvasRef.current) {
      canvasRef.current.width = activeWidth
      canvasRef.current.height = activeHeight
      vfx.init(canvasRef.current)
      loop()
    }

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [activeWidth, activeHeight])

  return (
    <div
      className={`absolute top-1/2 left-1/2 pointer-events-none z-60 ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
      style={{
        width: `${activeWidth}px`,
        height: `${activeHeight}px`,
        transform: `translate(-50%, -50%) rotate(${boardRotation}deg)`,
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}
