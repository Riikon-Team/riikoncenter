"use client";

import dynamic from 'next/dynamic';
import './_components/index.css';

// Dynamically import the ZenTab App with SSR disabled
const ZenTabApp = dynamic(() => import('./_components/ZenTabApp'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#090b0f] text-white">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  ),
});

export default function ZenTabPage() {
  return (
    <div className="w-full h-full min-h-0 relative flex-1 flex flex-col">
      <ZenTabApp />
    </div>
  );
}
