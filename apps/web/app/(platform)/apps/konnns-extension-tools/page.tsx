'use client'

import React, { Suspense } from 'react'

function ToolsFrame() {
  // Point directly to the port of the standalone Next.js repo
  // We rely on the default port 3000 since we should not modify the submodule
  const src = process.env.NEXT_PUBLIC_KONNNS_EXTENSION_TOOLS_URL || "http://localhost:3000"

  return (
      <iframe 
        src={src} 
        className="w-full h-full border-none bg-bg-deep"
        title="Konnns Extension Tools"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
      />
  )
}

export default function KonnnsExtensionToolsPage() {
  return (
    <div className="w-full h-dvh bg-bg-deep flex flex-col relative overflow-hidden">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white">Loading...</div>}>
         <ToolsFrame />
      </Suspense>
    </div>
  )
}
