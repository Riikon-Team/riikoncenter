"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AppManifest } from "../../../lib/apps";
import { useApps } from "../../../lib/hooks/useApps";
import { 
  Clock, 
  GraduationCap, 
  Gamepad2, 
  BarChart3, 
  Kanban, 
  Trophy, 
  Search, 
  ExternalLink, 
  Info, 
  Layers, 
  Box, 
  GitBranch, 
  ChevronRight,
  Star,
  LayoutGrid
} from "lucide-react";
import { cn } from "@riikoncenter/ui";
import { useAppStore } from "../../../store/useAppStore";
import { ThumbnailPlaceholder } from "../../../components/ui/thumbnail-placeholder";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  GraduationCap,
  Gamepad2,
  BarChart3,
  Kanban,
  Trophy,
  Box,
};

export default function RiikonHubDashboardPage() {
  const { t } = useTranslation("common");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { apps: allApps, isLoading } = useApps();

  const builtinApps = useMemo(() => allApps.filter((a) => a.type === "builtin"), [allApps]);
  const orgApps = useMemo(() => allApps.filter((a) => a.type === "org_app"), [allApps]);
  const thirdPartyApps = useMemo(() => allApps.filter((a) => a.type === "third-party"), [allApps]);

  const filterApp = (app: AppManifest) => {
    const matchesCategory = activeCategory === "all" || app.category === activeCategory;
    
    // Check translation or fallback to original text for search
    const translatedName = t(`apps.${app.id}.name`, app.name);
    const translatedDesc = t(`apps.${app.id}.description`, app.description);

    const matchesSearch = 
      translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translatedDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      app.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  };

  const filteredBuiltin = useMemo(() => builtinApps.filter(filterApp), [activeCategory, searchQuery, t, builtinApps]);
  const filteredOrg = useMemo(() => orgApps.filter(filterApp), [activeCategory, searchQuery, t, orgApps]);
  const filteredThirdParty = useMemo(() => thirdPartyApps.filter(filterApp), [activeCategory, searchQuery, t, thirdPartyApps]);

  const CATEGORIES = [
    { id: "all", label: t("dashboard.categories.all", "Tất cả") },
    { id: "app", label: t("dashboard.categories.app", "Ứng dụng") },
    { id: "utility", label: t("dashboard.categories.utility", "Tiện ích") },
    { id: "game", label: t("dashboard.categories.game", "Trò chơi") },
  ];

  return (
    <div className="min-h-full p-6 md:p-10 space-y-12 max-w-7xl mx-auto">
      
      {/* Hero Section - Geometric Minimalism */}
      <div className="relative border border-border bg-card p-8 md:p-12 overflow-hidden shadow-sm rounded-3xl">
        {/* Ambient Cyan/Blue Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-48 h-48 bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[60px] pointer-events-none" />
        
        {/* Geometric accent */}
        <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-border/50 bg-muted/10 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-16 w-16 h-16 border-t border-l border-border/50 bg-cyan-500/5 rounded-tl-xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted border border-border text-xs font-semibold tracking-wide uppercase text-muted-foreground rounded-full">
            <LayoutGrid className="w-3.5 h-3.5" /> {t("dashboard.hero_badge", "Platform Dashboard")}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground uppercase">
            RiikonCenter
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg">
            {t("dashboard.hero_desc", "Khám phá hệ sinh thái ứng dụng của Riikon. Tối giản, hiệu quả và mạnh mẽ.")}
          </p>
        </div>

        {/* Quick Stats - Minimalist blocks */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-1 w-full max-w-xl border-t border-border pt-6">
          <div className="flex flex-col gap-1 border-r border-border pr-4">
            <span className="text-2xl font-bold text-foreground">{builtinApps.length}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-normal font-semibold">{t("dashboard.stats_builtin", "Built-in Apps")}</span>
          </div>
          <div className="flex flex-col gap-1 md:border-r border-border px-4">
            <span className="text-2xl font-bold text-foreground">{thirdPartyApps.length}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-normal font-semibold">{t("dashboard.stats_third_party", "Org Repos")}</span>
          </div>
          <div className="hidden md:flex flex-col gap-1 pl-4">
            <span className="text-2xl font-bold text-foreground">3</span>
            <span className="text-xs text-muted-foreground uppercase tracking-normal font-semibold">{t("dashboard.stats_categories", "Categories")}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-5 py-2.5 text-xs md:text-sm font-semibold tracking-normal transition-all duration-300 border rounded-2xl",
                activeCategory === cat.id
                  ? "bg-cyan-500 text-white border-cyan-500 shadow-md"
                  : "bg-transparent border-border text-muted-foreground hover:border-cyan-500/50 hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("dashboard.search_placeholder", "Search apps...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all rounded-2xl"
          />
        </div>
      </div>

      {/* SECTION 1: Built-in Apps */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Box className="w-5 h-5 text-muted-foreground" />
            {t("dashboard.section_builtin_title", "Built-in Core")}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 border border-border text-muted-foreground rounded-full">
            {filteredBuiltin.length} {t("dashboard.apps_count", "APPS")}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AppCardSkeleton />
            <AppCardSkeleton />
            <AppCardSkeleton />
          </div>
        ) : filteredBuiltin.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm uppercase tracking-normal">{t("dashboard.section_builtin_empty", "No matching built-in apps found.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuiltin.map((app: AppManifest) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Org Apps */}
      <div className="space-y-6 pt-8">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-muted-foreground" />
            {t("dashboard.section_org_title", "Phát triển bởi RiikonTeam")}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 border border-border text-muted-foreground rounded-full">
            {filteredOrg.length} {t("dashboard.apps_count", "APPS")}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AppCardSkeleton />
            <AppCardSkeleton />
            <AppCardSkeleton />
          </div>
        ) : filteredOrg.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm uppercase tracking-normal">{t("dashboard.section_org_empty", "No matching org apps found.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrg.map((app: AppManifest) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Third-Party Apps (Org Repos) */}
      <div className="space-y-6 pt-8">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-muted-foreground" />
            {t("dashboard.section_repo_title", "Repository của RiikonTeam")}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 border border-border text-muted-foreground rounded-full">
            {filteredThirdParty.length} {t("dashboard.apps_count", "APPS")}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AppCardSkeleton />
            <AppCardSkeleton />
          </div>
        ) : filteredThirdParty.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm uppercase tracking-normal">{t("dashboard.section_third_party_empty", "No apps deployed yet.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThirdParty.map((app: AppManifest) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// Subcomponent: App Card
function AppCard({ app }: { app: AppManifest }) {
  const { t } = useTranslation("common");
  const [isMounted, setIsMounted] = useState(false);
  const { toggleFavorite, favoriteAppIds, addRecentApp } = useAppStore();
  const IconComponent = ICON_MAP[app.icon] || Box;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFavorite = isMounted && favoriteAppIds.includes(app.id);

  const categoryLabels: Record<string, string> = {
    app: t("dashboard.categories.app", "APP"),
    utility: t("dashboard.categories.utility", "UTILITY"),
    game: t("dashboard.categories.game", "GAME"),
  };

  const isThirdParty = app.type === "third-party";
  const appName = t(`apps.${app.id}.name`, app.name);
  const appDesc = t(`apps.${app.id}.description`, app.description);

  return (
    <div className="group relative bg-card border border-border flex flex-col overflow-hidden transition-all duration-300 hover:border-cyan-500/30 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)]">
      
      {/* Thumbnail Area */}
      {app.thumbnail && (
        <div className={cn("relative w-full h-40 overflow-hidden shrink-0 bg-muted")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={app.thumbnail} alt={appName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          
          {/* Absolute Tags / Badges on top of thumbnail */}
          <div className="absolute top-3 left-3 flex gap-2">
             <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-background/80 backdrop-blur-md text-foreground capitalize shadow-sm">
               {categoryLabels[app.category]}
             </span>
          </div>

          {/* Favorite Button on Thumbnail */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(app.id);
              }}
              className="p-1.5 rounded-full bg-background/80 backdrop-blur-md text-muted-foreground hover:text-amber-500 transition-colors shadow-sm"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={cn("w-4 h-4", isFavorite ? "fill-amber-500 text-amber-500" : "")} />
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Top Header inside card */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {!app.thumbnail && (
              <div className="p-2 border border-border bg-background rounded-lg flex items-center justify-center overflow-hidden w-9 h-9">
                {app.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.iconUrl} alt={`${appName} icon`} className="w-full h-full object-contain" />
                ) : (
                  <IconComponent className="w-5 h-5 text-foreground" />
                )}
              </div>
            )}
            <div>
              <h3 className="font-bold text-base tracking-tight text-foreground line-clamp-1">
                {appName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono font-medium text-muted-foreground">
                  v{app.version}
                </span>
                {!app.thumbnail && (
                  <>
                    <span className="text-muted-foreground/30 text-[10px]">|</span>
                    <span className="text-[10px] font-semibold text-muted-foreground capitalize">
                      {categoryLabels[app.category]}
                    </span>
                  </>
                )}
                {isThirdParty && (
                  <>
                    <span className="text-muted-foreground/30 text-[10px]">|</span>
                    <span className="text-[10px] font-semibold text-cyan-500 capitalize">
                      Org Repo
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Favorite Button for non-thumbnail */}
          {!app.thumbnail && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(app.id);
              }}
              className="p-1.5 text-muted-foreground hover:text-amber-500 transition-colors -mr-1.5"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={cn("w-4 h-4", isFavorite ? "fill-amber-500 text-amber-500" : "")} />
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {appDesc}
        </p>

        {/* Tags */}
        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
            {app.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="text-[9px] tracking-normal font-semibold bg-muted text-muted-foreground px-2 py-0.5 border border-border rounded-md"
              >
                {tag}
              </span>
            ))}
            {app.tags.length > 3 && (
              <span className="text-[9px] tracking-normal font-semibold text-muted-foreground px-1 py-0.5">
                +{app.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Card Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3 mt-auto">
          <Link
          href={`/dashboard/app/${app.id}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-normal text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
        >
          <Info className="w-3.5 h-3.5" /> {t("app_card.action_details", "Details")}
        </Link>

        {isThirdParty ? (
          <a
            href={app.repoUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-normal bg-foreground hover:bg-foreground/90 text-background px-4 py-2 transition-all rounded-xl"
          >
            {t("app_card.action_repo", "Repo")} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <Link
            href={app.entryPath}
            onClick={() => addRecentApp(app.id)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-normal bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white px-5 py-2.5 transition-all rounded-xl shadow-sm group-hover:pl-6 group-hover:pr-4"
          >
            {t("app_card.action_open", "Open")} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
        </div>
      </div>

    </div>
  );
}

function AppCardSkeleton() {
  return (
    <div className="bg-card border border-border flex flex-col overflow-hidden rounded-2xl h-[320px]">
      <div className="w-full h-40 bg-muted animate-pulse shrink-0" />
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex gap-3">
          <div className="w-9 h-9 bg-muted animate-pulse rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted animate-pulse rounded w-full" />
          <div className="h-3 bg-muted animate-pulse rounded w-4/5" />
        </div>
        <div className="pt-4 mt-auto flex justify-between gap-3">
          <div className="h-8 bg-muted animate-pulse rounded w-16" />
          <div className="h-8 bg-muted animate-pulse rounded w-20" />
        </div>
      </div>
    </div>
  );
}

