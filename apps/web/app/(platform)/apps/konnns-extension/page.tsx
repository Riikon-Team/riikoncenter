'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function KonnnsFrame() {
  const searchParams = useSearchParams()
  const path = searchParams.get('path')

  // Nếu có truyền path (ví dụ: #/whiteboard), mở trang các công cụ
  // Nếu không có, mở trang gốc mặc định (ZenTab)
  const src = path ? `http://localhost:3304/?page=site${path}` : "http://localhost:3304"

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
