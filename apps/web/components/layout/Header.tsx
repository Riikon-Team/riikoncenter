"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { parseJwt, JwtPayload, getAvatarColor } from "../../lib/auth";
import { 
  Store,
  EyeOff,
  Languages,
  User,
  LogOut,
  Settings,
  Menu
} from "lucide-react";
import { useSidebarStore } from "../../store/useSidebarStore";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@riikoncenter/ui";

export function Header() {
  const pathname = usePathname();
  const { t, i18n } = useTranslation("common");
  const { toggleHeaderVisibility, toggle, toggleSidebarVisibility } = useSidebarStore();
  const isZenTab = pathname.startsWith("/personal/zentab");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [user, setUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("riikon_access_token");
    if (token) {
      const payload = parseJwt(token);
      if (payload) setUser(payload);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const toggleLanguage = () => {
    const nextLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("riikon_lang", nextLang);
  };

  const handleSignOut = () => {
    setIsProfileOpen(false);
    localStorage.removeItem("riikon_access_token");
    router.push("/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur-md px-4 md:px-8 z-40 sticky top-0 w-full shadow-sm">
      
      {/* Brand & Store Logo */}
      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={() => {
            // Mobile toggle
            if (window.innerWidth < 768) {
              toggle();
            } else {
              toggleSidebarVisibility();
            }
          }}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link 
          href="/dashboard" 
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 group-hover:rotate-6 transition-transform">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Riikon<span className="text-primary">Center</span>
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest -mt-1">
              App Store
            </span>
          </div>
        </Link>

      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 relative">

        {isZenTab && (
          <button
            onClick={toggleHeaderVisibility}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={t("header.hide_header")}
          >
            <EyeOff className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          title="Toggle Language"
        >
          <Languages className="h-4 w-4" />
          <span className="text-xs font-bold uppercase">{i18n.language}</span>
        </button>

        <ThemeToggle />

        {/* User Profile Avatar with Dropdown */}
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors shadow-sm text-white font-bold text-sm",
                getAvatarColor(user.email.split('@')[0])
              )}
            >
              {user.email.split('@')[0].charAt(0).toUpperCase()}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background border border-border/60 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-border/50 mb-1 flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-foreground">
                    {user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" title={user.email}>
                    {user.email}
                  </p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <Settings className="w-4 h-4" /> {t("header.profile_settings", "Profile Settings")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 mt-1 text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> {t("header.sign_out", "Sign Out")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <Link href="/login" className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
              {t("landing.header.login", "Login")}
            </Link>
            <Link href="/register" className="text-sm font-medium bg-foreground text-background px-4 py-1.5 rounded-full hover:bg-foreground/90 transition-colors">
              {t("landing.header.register", "Register")}
            </Link>
          </div>
        )}
      </div>

    </header>
  );
}
