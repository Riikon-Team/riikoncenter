"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { User, Mail, Shield, History, Settings, Star, Info, Clock, GraduationCap, Gamepad2, BarChart3, Kanban, Trophy, Box } from "lucide-react";
import { parseJwt, JwtPayload } from "../../../lib/auth";
import { useAppStore } from "../../../store/useAppStore";
import { AppManifest } from "../../../lib/apps";
import { useApps } from "../../../lib/hooks/useApps";
import Link from "next/link";
import { cn } from "@riikoncenter/ui";
import { ThumbnailPlaceholder } from "../../../components/ui/thumbnail-placeholder";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  GraduationCap,
  Gamepad2,
  BarChart3,
  Kanban,
  Trophy,
};

// Local Simple App Card
function ProfileAppCard({ app }: { app: AppManifest }) {
  const { t } = useTranslation("common");
  const { toggleFavorite, favoriteAppIds, addRecentApp } = useAppStore();
  const isFavorite = favoriteAppIds.includes(app.id);
  const IconComponent = ICON_MAP[app.icon] || Box;

  const categoryLabels: Record<string, string> = {
    app: t("dashboard.categories.app", "App"),
    utility: t("dashboard.categories.utility", "Utility"),
    game: t("dashboard.categories.game", "Game"),
  };

  const appName = t(`apps.${app.id}.name`, app.name);
  const appDesc = t(`apps.${app.id}.description`, app.description);

  return (
    <div className="group relative bg-card border border-border flex flex-col overflow-hidden transition-all duration-300 hover:border-foreground/40 rounded-2xl hover:shadow-md">
      
      {/* Thumbnail Area */}
      {app.thumbnail && (
        <div className={cn("relative w-full h-32 overflow-hidden shrink-0 bg-muted")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={app.thumbnail} alt={appName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute top-2 right-2 z-10">
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
      {!app.thumbnail && (
        <div className="relative w-full h-32 overflow-hidden shrink-0">
          <ThumbnailPlaceholder appName={appName} icon={IconComponent} iconUrl={app.iconUrl} className="h-full w-full rounded-none" />
           <div className="absolute top-2 right-2 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(app.id);
              }}
              className="p-1.5 rounded-full bg-background/80 backdrop-blur-md text-muted-foreground hover:text-amber-500 transition-colors shadow-sm"
            >
              <Star className={cn("w-4 h-4", isFavorite ? "fill-amber-500 text-amber-500" : "")} />
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <Link 
        href={app.entryPath} 
        onClick={() => addRecentApp(app.id)}
        className="flex-1 p-4 flex flex-col justify-between"
      >
        <div>
          <h3 className="text-base font-bold text-foreground line-clamp-1">{appName}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{appDesc}</p>
        </div>
      </Link>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [activeTab, setActiveTab] = useState("settings");
  const [mounted, setMounted] = useState(false);

  const { favoriteAppIds, recentAppIds } = useAppStore();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("riikon_access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    const payload = parseJwt(token);
    if (payload) {
      setUser(payload);
    } else {
      router.push("/login");
    }
  }, [router]);

  const { apps: allApps } = useApps();
  const favoriteApps = mounted ? favoriteAppIds.map(id => allApps.find(a => a.id === id)).filter(Boolean) as AppManifest[] : [];
  const recentApps = mounted ? recentAppIds.map(id => allApps.find(a => a.id === id)).filter(Boolean) as AppManifest[] : [];

  const tabs = [
    { id: "settings", label: t("profile.personal_info", "Personal information"), icon: <Settings className="w-4 h-4" /> },
    { id: "security", label: t("profile.menu_security", "Security"), icon: <Shield className="w-4 h-4" /> },
    { id: "favorites", label: t("profile.menu_favorites", "Favorite apps"), icon: <Star className="w-4 h-4" /> },
    { id: "recent", label: t("profile.menu_activity", "Recent apps"), icon: <History className="w-4 h-4" /> },
    { id: "about", label: t("profile.menu_about", "About us"), icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-full p-4 md:p-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-border pb-6 flex items-start justify-between mb-8">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted border border-border rounded-full text-xs font-medium text-muted-foreground mb-4">
            <User className="w-3.5 h-3.5" /> {t("profile.badge", "User profile")}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {t("profile.title", "Account settings")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("profile.desc", "Manage your personal information, security preferences, and activity history.")}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-6">
          <div className="border border-border bg-card p-6 flex flex-col items-center text-center rounded-2xl">
            <div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center mb-4 overflow-hidden">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {user ? user.email.split('@')[0] : "Loading..."}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email || "loading@example.com"}
            </p>
            <div className="mt-4 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold">
              {t("profile.role_user", "User")}
            </div>
          </div>
          
          <div className="border border-border bg-card rounded-2xl overflow-hidden flex flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 text-sm font-medium p-3 transition-colors text-left",
                  activeTab === tab.id 
                    ? "bg-muted text-foreground border-l-2 border-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent"
                )}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 space-y-6">
          
          {activeTab === "settings" && (
            <div className="border border-border bg-card p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold tracking-tight border-b border-border pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" /> {t("profile.personal_info", "Personal information")}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t("profile.full_name", "Full name")}</label>
                    <input 
                      type="text" 
                      defaultValue={user ? user.email.split('@')[0] : ""} 
                      key={`fullname-${user?.sub}`}
                      className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t("profile.display_name", "Display name")}</label>
                    <input 
                      type="text" 
                      defaultValue={user ? user.email.split('@')[0] : ""} 
                      key={`display-${user?.sub}`}
                      className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("profile.email", "Email address")}</label>
                  <input 
                    type="email" 
                    defaultValue={user?.email || ""} 
                    key={`email-${user?.sub}`}
                    className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-foreground transition-colors"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button className="bg-foreground text-background px-6 py-2 rounded-xl text-sm font-semibold hover:bg-foreground/90 transition-colors">
                  {t("profile.save_changes", "Save changes")}
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="border border-border bg-card p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold tracking-tight border-b border-border pb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-muted-foreground" /> {t("profile.auth", "Authentication")}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border bg-background rounded-xl">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{t("profile.password", "Password")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("profile.password_desc", "Change secure password")}</p>
                  </div>
                  <button className="bg-muted border border-border px-4 py-1.5 rounded-lg text-xs font-semibold hover:border-foreground transition-colors">
                    {t("profile.change", "Change")}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border bg-background rounded-xl">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{t("profile.2fa", "Two-factor auth")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("profile.2fa_desc", "Not enabled")}</p>
                  </div>
                  <button className="bg-muted border border-border px-4 py-1.5 rounded-lg text-xs font-semibold hover:border-foreground transition-colors">
                    {t("profile.enable", "Enable")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="border border-border bg-card p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold tracking-tight border-b border-border pb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-muted-foreground" /> {t("profile.menu_favorites", "Favorite apps")}
              </h3>
              
              {favoriteApps.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-sm">{t("profile.no_favorite_apps", "No favorite apps yet.")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteApps.map((app) => (
                    <ProfileAppCard key={app.id} app={app} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "recent" && (
            <div className="border border-border bg-card p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold tracking-tight border-b border-border pb-2 flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" /> {t("profile.menu_activity", "Recent apps")}
              </h3>
              
              {recentApps.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-sm">{t("profile.no_recent_apps", "No recent apps found.")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentApps.map((app) => (
                    <ProfileAppCard key={app.id} app={app} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="border border-border bg-card p-6 rounded-2xl space-y-6 min-h-[300px]">
              <h3 className="text-lg font-bold tracking-tight border-b border-border pb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-muted-foreground" /> {t("profile.menu_about", "About us")}
              </h3>
              
              <div className="prose prose-sm dark:prose-invert">
                {/* User Content Goes Here */}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
