'use client'

import React, { Suspense, useState, useEffect } from 'react'

function VibeCardGameFrame() {
  const proxyUrl = process.env.NEXT_PUBLIC_GAME_PROXY_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3309` : "http://localhost:3309");
  const src = proxyUrl;
  const [isReady, setIsReady] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    let wasWaiting = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${proxyUrl}/api/health`)
        const data = await res.json()
        if (data.state === 'running') {
          setIsReady(true)
          clearInterval(interval)
          if (wasWaiting) {
             window.location.reload(); // Specifically requested by user to fix 502
          }
        } else {
          wasWaiting = true;
        }
      } catch (err) {
        wasWaiting = true;
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [proxyUrl])

  return (
    <div className="relative w-full h-full">
      {!isReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold">Waking up Vibe Card Game...</h2>
          <p className="text-zinc-400 mt-2">Cold start takes about 15-30s</p>
        </div>
      )}
      <iframe 
        src={src} 
        className="w-full h-full border-none bg-black"
        title="Ú Nồ Card Game"
        allow="microphone; camera; display-capture"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
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
