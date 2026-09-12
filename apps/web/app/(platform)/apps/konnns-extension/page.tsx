'use client'

import React from 'react'

export default function KonnnsExtensionPage() {
  return (
    <div className="w-full h-dvh bg-bg-deep flex flex-col relative overflow-hidden">
      <iframe 
        src="http://localhost:3304" 
        className="w-full h-full border-none"
        title="Konnns Extension"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  )
}
