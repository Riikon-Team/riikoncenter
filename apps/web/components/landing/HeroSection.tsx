"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { HeroBackgroundObjects } from "./BackgroundObjects";

export function HeroSection() {
  const { t } = useTranslation("common");

  return (
    <section className="h-dvh w-full snap-start relative flex flex-col items-center justify-center px-6 md:px-24 bg-background text-foreground overflow-hidden">
      <HeroBackgroundObjects />
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      {/* Ambient Blue Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-600/15 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[160px] -z-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-start text-left max-w-5xl w-full relative z-10"
      >
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight max-w-4xl">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light mb-12 max-w-2xl leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-start gap-4 w-full sm:w-auto">
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 active:scale-95 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.35)] dark:shadow-[0_0_35px_-5px_rgba(59,130,246,0.45)] border border-blue-400/30 text-center"
          >
            {t('landing.hero.cta_main')}
          </Link>
          <Link 
            href="/about-us"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-100 hover:bg-zinc-200/90 text-zinc-900 border border-zinc-200/90 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-800 rounded-xl font-medium text-lg transition-all duration-300 active:scale-95 shadow-sm dark:shadow-none text-center"
          >
            {t('landing.hero.cta_secondary')}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
