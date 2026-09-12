"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { cn } from "@riikoncenter/ui";
import { LayoutDashboard, X, Star, History, Box, Clock, GraduationCap, Gamepad2, BarChart3, Kanban, Trophy, Layers } from "lucide-react";
import { useSidebarStore } from "../../store/useSidebarStore";
import { useAppStore } from "../../store/useAppStore";
import { AppManifest } from "../../lib/apps";
import { useApps } from "../../lib/hooks/useApps";
import { ThumbnailPlaceholder } from "../../components/ui/thumbnail-placeholder";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  GraduationCap,
  Gamepad2,
  BarChart3,
  Kanban,
  Trophy,
  Box,
};

export function Sidebar() {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const { isOpen, setIsOpen, isSidebarVisible } = useSidebarStore();
  const { favoriteAppIds, recentAppIds } = useAppStore();
  const { apps: allApps, isLoading } = useApps();

  const favoriteApps = favoriteAppIds.map(id => allApps.find(a => a.id === id)).filter(Boolean) as AppManifest[];
  const recentApps = recentAppIds.map(id => allApps.find(a => a.id === id)).filter(Boolean) as AppManifest[];

  const renderAppList = (apps: AppManifest[], fallbackText: string) => {
    if (isLoading) {
      return (
        <div className="px-3 py-2 space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded-md" />
          <div className="h-8 bg-muted animate-pulse rounded-md" />
        </div>
      );
    }
    if (apps.length === 0) {
      return <div className="text-xs text-muted-foreground/60 px-3 py-2 italic">{fallbackText}</div>;
    }
    return (
      <ul className="space-y-1">
        {apps.map(app => {
          const isActive = pathname.startsWith(app.entryPath) && app.entryPath !== '#';
          const Icon = ICON_MAP[app.icon] || Box;
          return (
            <li key={app.id}>
              <Link
                href={app.entryPath}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-xs transition-all duration-200 border border-transparent",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="relative w-6 h-6 shrink-0 rounded flex items-center justify-center overflow-hidden bg-background border border-border/50">
                  {app.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.iconUrl} alt={app.name} className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <ThumbnailPlaceholder icon={Icon} appName={app.name} bannerBg={app.bannerBg} size="sm" className="rounded" iconClassName={isActive ? "text-primary" : "text-muted-foreground"} />
                  )}
                </div>
                <span className="truncate">{app.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card flex flex-col transition-all duration-300 ease-in-out md:static overflow-hidden border-r border-border shadow-sm",
          // Mobile state
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop state
          isSidebarVisible 
            ? "md:w-64 md:opacity-100 md:pointer-events-auto" 
            : "md:w-0 md:opacity-0 md:pointer-events-none md:border-none"
        )}
      >
        <div className="w-64 h-full flex flex-col shrink-0">
          <div className="md:hidden flex h-16 shrink-0 items-center justify-end px-4 border-b border-border bg-background/50 backdrop-blur-sm">
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
            
            {/* Dashboard Link */}
            <div>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 border border-transparent",
                  pathname === "/dashboard"
                    ? "bg-primary text-primary-foreground shadow-md font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                {t("sidebar.dashboard", "Store Dashboard")}
              </Link>
            </div>

            {/* Hubs Section */}
            <div className="space-y-1">
              <Link
                href="/apps"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 border border-transparent",
                  pathname.startsWith("/apps")
                    ? "bg-primary/10 text-primary border-primary/20 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Layers className="h-4 w-4" />
                {t("sidebar.apps", "Apps Hub")}
              </Link>

              <Link
                href="/games"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 border border-transparent",
                  pathname.startsWith("/games")
                    ? "bg-primary/10 text-primary border-primary/20 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Gamepad2 className="h-4 w-4" />
                {t("sidebar.games", "Games Hub")}
              </Link>
            </div>

            {/* Favorites Section */}
            <div className="space-y-2">
              <h3 className="px-3 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4" /> {t("sidebar.favorites", "Favorites")}
              </h3>
              {renderAppList(favoriteApps, t("sidebar.no_favorites", "No favorites yet."))}
            </div>

            {/* Recent Section */}
            <div className="space-y-2">
              <h3 className="px-3 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <History className="w-4 h-4" /> {t("sidebar.recent", "Recent")}
              </h3>
              {renderAppList(recentApps, t("sidebar.no_recent", "No recent apps."))}
            </div>
            
          </nav>
        </div>
      </aside>
    </>
  );
}
