"use client";

import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("common");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-zinc-950 text-white relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
        
        {/* Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            RiikonCenter.
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            {t("auth.branding.title")}
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            {t("auth.branding.subtitle")}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-zinc-500 font-medium">
          {t("auth.branding.footer", { year: new Date().getFullYear() })}
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="flex flex-col flex-1 relative overflow-y-auto">
        <div className="absolute top-6 left-6 lg:hidden z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 min-h-max">
          <div className="w-full max-w-[400px] py-12 lg:py-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
