"use client";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { AppsBackgroundObjects } from "./BackgroundObjects";

export function ProductivitySection() {
  const { t } = useTranslation("common");

  return (
    <section className="h-dvh w-full snap-start relative flex flex-col md:flex-row items-center justify-center px-6 md:px-24 bg-muted/30 text-foreground overflow-hidden gap-12">
      <AppsBackgroundObjects />
      {/* Ambient Blue Blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/[0.05] dark:bg-cyan-600/[0.08] rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-600/[0.05] dark:bg-blue-600/[0.08] rounded-full blur-[160px] -z-10 pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col items-start justify-center relative z-10"
      >
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-none">
          {t('landing.apps.title')}
        </h2>
        <p className="text-lg text-muted-foreground font-light max-w-md leading-relaxed mb-6">
          {t('landing.apps.desc')}
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground font-medium">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-foreground"></span> {t('landing.apps.item1')}</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-foreground"></span> {t('landing.apps.item2')}</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-foreground"></span> {t('landing.apps.item3')}</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-foreground"></span> {t('landing.apps.item4')}</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="flex-1 w-full max-w-lg aspect-square border border-border rounded-3xl bg-background shadow-sm flex items-center justify-center p-8 relative overflow-hidden"
      >
        {/* Abstract representation of a Bento Grid */}
        <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-4 opacity-70">
          <div className="col-span-2 row-span-1 bg-muted rounded-xl animate-pulse delay-75"></div>
          <div className="col-span-1 row-span-2 bg-muted rounded-xl animate-pulse delay-150"></div>
          <div className="col-span-1 row-span-1 bg-muted rounded-xl animate-pulse delay-300"></div>
          <div className="col-span-1 row-span-1 bg-muted rounded-xl animate-pulse delay-500"></div>
        </div>
      </motion.div>
    </section>
  );
}
