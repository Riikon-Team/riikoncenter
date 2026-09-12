"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { MonitorPlay } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { parseJwt, JwtPayload, getAvatarColor } from "@/lib/auth";
import { User, Settings, LogOut } from "lucide-react";
import { cn } from "@riikoncenter/ui";

export function LandingHeader() {
  const { t, i18n } = useTranslation("common");
  const [isHidden, setIsHidden] = useState(false);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const container = document.getElementById('landing-scroll-container');
    if (!container) return;

    const handleScroll = () => {
      // Hide header if scrolled past 100px
      if (container.scrollTop > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('riikon_lang', newLang);
  };

  const handleSignOut = () => {
    setIsProfileOpen(false);
    localStorage.removeItem("riikon_access_token");
    setUser(null);
  };

  return (
    <motion.header 
      initial={{ y: 0 }}
      animate={{ y: isHidden ? "-100%" : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-background/50 backdrop-blur-md border-b border-border/50"
    >
      <div className="flex items-center gap-2 font-bold tracking-tight text-xl text-foreground">
        <MonitorPlay className="w-6 h-6" />
        RiikonCenter
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleLanguage}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase"
        >
          {i18n.language}
        </button>
        <div className="mr-6">
          <ThemeToggle />
        </div>

        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-colors shadow-sm text-white font-bold text-sm",
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
                  href="/dashboard"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground bg-primary/10 hover:bg-primary/20 transition-colors font-bold border-b border-border/50"
                >
                  <MonitorPlay className="w-4 h-4" /> {t("landing.tools.explore", "Dashboard")}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 mt-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
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
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
              {t('landing.header.login')}
            </Link>
            <Link href="/register" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 transition-colors">
              {t('landing.header.register')}
            </Link>
          </div>
        )}
      </div>
    </motion.header>
  );
}
