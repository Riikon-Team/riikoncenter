'use client'

import React, { Suspense } from 'react'

function VibeCardGameFrame() {
  // Point directly to the port of the standalone Vibe Card Game
  // We use .env in the submodule to set PORT=3310 to avoid conflicts
  const src = "http://localhost:3310"

  return (
      <iframe 
        src={src} 
        className="w-full h-full border-none bg-black"
        title="Ú Nồ Card Game"
        allow="microphone; camera; display-capture"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
  )
}

export default function VibeCardGamePage() {
  return (
    <div className="w-full h-dvh bg-black flex flex-col relative overflow-hidden">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white">Loading...</div>}>
         <VibeCardGameFrame />
      </Suspense>
    </div>
  )
}
