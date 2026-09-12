"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";
import { useSidebarStore } from "../../store/useSidebarStore";
import { cn } from "@riikoncenter/ui";
import { Eye } from "lucide-react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    isHeaderVisible, 
    toggleHeaderVisibility 
  } = useSidebarStore();

  const isFullScreenApp = 
    pathname.startsWith("/personal/zentab") || 
    pathname.startsWith("/games/galaxy-shooter") ||
    pathname.startsWith("/apps/konnns-extension");
  const [lang, setLang] = useState("en");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const syncLang = () => {
      try {
        const saved = localStorage.getItem("serene_productivity_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.language && parsed.language !== lang) {
            setLang(parsed.language);
          }
        }
      } catch (e) {}
    };

    syncLang();
    const interval = setInterval(syncLang, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const showHeaderLabel = lang === "vi" ? "Hiện Header" : "Show Header";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background relative w-full">
      
      {/* Header - Mounted conditionally */}
      {isMounted && isHeaderVisible && <Header />}

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className={cn(
          "flex-1 relative w-full",
          isFullScreenApp ? "overflow-hidden h-full flex flex-col" : "overflow-y-auto"
        )}>
          {/* Bottom Left Hover Zone to toggle Header */}
          {isMounted && (
            <div className="absolute bottom-4 left-16 group z-[9999] flex justify-center pointer-events-none">
              <button
                onClick={toggleHeaderVisibility}
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2.5 rounded-full shadow-xl border flex items-center justify-center cursor-pointer pointer-events-auto",
                  isHeaderVisible 
                    ? "bg-background text-muted-foreground border-border hover:bg-muted" 
                    : "bg-cyan-500 text-white border-cyan-400 hover:bg-cyan-600"
                )}
                title={isHeaderVisible ? "Hide Header" : "Show Header"}
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {children}
        </main>
      </div>

    </div>
  );
}
