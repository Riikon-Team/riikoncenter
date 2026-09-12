"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ToolsBackgroundObjects } from "./BackgroundObjects";

export function ToolsSection() {
  const { t } = useTranslation("common");

  return (
    <section className="h-dvh w-full snap-start relative flex flex-col-reverse md:flex-row items-center justify-center px-6 md:px-24 bg-background text-foreground overflow-hidden gap-12">
      <ToolsBackgroundObjects />
      {/* Ambient Blue Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.03] dark:bg-cyan-600/[0.05] rounded-full blur-[160px] -z-10 pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="flex-1 w-full max-w-lg aspect-square border border-border rounded-3xl bg-black shadow-sm flex items-center justify-center p-8 relative overflow-hidden group"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity duration-700">
           {/* Abstract space Invaders representation */}
           <div className="w-4 h-4 bg-white rounded-full mb-8 animate-bounce"></div>
           <div className="w-16 h-16 border-t-4 border-l-4 border-r-4 border-white rounded-t-full mt-12"></div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col items-start justify-center relative z-10"
      >
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-none">
          {t('landing.tools.title')}
        </h2>
        <p className="text-lg text-muted-foreground font-light max-w-md mb-6 leading-relaxed">
          {t('landing.tools.desc')}
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground font-medium mb-8">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-foreground"></span> {t('landing.tools.item1')}</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-foreground"></span> {t('landing.tools.item2')}</li>
        </ul>
        <Link 
          href="/dashboard"
          className="group flex items-center gap-2 text-foreground font-medium text-lg hover:text-cyan-500 transition-colors duration-300"
        >
          {t('landing.tools.explore')}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  );
}
