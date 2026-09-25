"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";
import { useSidebarStore } from "../../store/useSidebarStore";
import { cn } from "@riikoncenter/ui";
import { Eye, Wrench } from "lucide-react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    isHeaderVisible, 
    toggleHeaderVisibility,
    setHeaderVisible
  } = useSidebarStore();

  const isFullScreenApp = 
    pathname.startsWith("/apps/zentab") || 
    pathname.startsWith("/games/galaxy-shooter") ||
    pathname.startsWith("/apps/konnns-extension");
  const isKonnnsExtension = pathname.startsWith("/apps/konnns-extension");
  const isZenTab = pathname.startsWith("/apps/zentab");
  const canHideHeader = isZenTab || isKonnnsExtension;
  const [lang, setLang] = useState("en");
  const [isMounted, setIsMounted] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  useEffect(() => {
    // Reset header visibility when leaving full screen apps
    if (!canHideHeader && !isHeaderVisible) {
      setHeaderVisible(true);
    }
  }, [pathname, canHideHeader, isHeaderVisible, setHeaderVisible]);

  useEffect(() => {
    // Lắng nghe lệnh điều hướng (NAVIGATE) từ popup iframe gửi lên
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE' && event.data?.path) {
        setIsToolsMenuOpen(false); // Đóng menu
        window.location.href = event.data.path; // Điều hướng
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
          {/* Bottom Left Hover Zone to toggle Header & Tools */}
          {isMounted && canHideHeader && (
            <div className="absolute bottom-4 left-16 group z-[9999] flex gap-2 items-center pointer-events-none">
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

              <button
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className={cn(
                  "transition-opacity duration-300 p-2.5 rounded-full shadow-xl border flex items-center justify-center cursor-pointer pointer-events-auto",
                  isToolsMenuOpen ? "opacity-100 bg-cyan-500 text-white border-cyan-400 hover:bg-cyan-600" : "opacity-0 group-hover:opacity-100 bg-background text-muted-foreground border-border hover:bg-muted"
                )}
                title="Tools & Apps"
              >
                <Wrench className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Floating Konnns Tools Menu */}
          {isMounted && isToolsMenuOpen && (
            <div className="absolute bottom-16 left-16 z-[9999] w-[450px] h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
               <iframe 
                  src="http://localhost:3304/?page=popup" 
                  width="100%" 
                  height="100%" 
                  className="border-none bg-transparent pointer-events-auto"
               />
            </div>
          )}
          
          {children}
        </main>
      </div>

    </div>
  );
}
