'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function KonnnsFrame() {
  const searchParams = useSearchParams()
  const path = searchParams.get('path')

  // If path is provided (e.g. #/whiteboard), open the tools page (page=site)
  // Otherwise, open the default newtab page
  const baseUrl = process.env.NEXT_PUBLIC_KONNNS_EXTENSION_URL || "http://localhost:3304"
  const src = path ? `${baseUrl}/?page=site${path}` : baseUrl

  return (
      <iframe 
        src={src} 
        className="w-full h-full border-none bg-bg-deep"
        title="Konnns Extension"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
  )
}

export default function KonnnsExtensionPage() {
  return (
    <div className="w-full h-dvh bg-bg-deep flex flex-col relative overflow-hidden">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white">Loading...</div>}>
         <KonnnsFrame />
      </Suspense>
    </div>
  )
}
