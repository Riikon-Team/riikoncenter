"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Github, MonitorPlay, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FooterSection() {
  const { t } = useTranslation("common");

  return (
    <section className="h-dvh w-full snap-start relative flex flex-col items-center justify-between pt-32 pb-12 px-6 md:px-24 bg-foreground text-background overflow-hidden">
      {/* Background Image Placeholder */}
      {/* <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-10" style={{ backgroundImage: 'url(/path/to/footer-bg.jpg)' }} /> */}
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-3xl relative z-10"
      >
        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-none">
          {t('landing.footer.title')}
        </h2>
        <p className="text-lg md:text-xl text-muted font-light mb-12 max-w-xl leading-relaxed opacity-80">
          {t('landing.footer.desc')}
        </p>
        <Link 
          href="/register"
          className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 active:scale-95 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.35)] border border-blue-400/30"
        >
          {t('landing.footer.cta')}
          <Zap className="w-5 h-5" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="w-full border-t border-background/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10"
      >
        <div className="flex items-center gap-2 font-bold tracking-tight text-xl">
          <MonitorPlay className="w-6 h-6" />
          RiikonCenter
        </div>
        
        <div className="text-sm opacity-60">
          © {new Date().getFullYear()} {t('landing.footer.copyright')}
        </div>

        <div className="flex items-center gap-6">
          <Link href="#" className="hover:opacity-70 transition-opacity">
            <Github className="w-5 h-5" />
          </Link>
          <Link href="/docs" className="hover:opacity-70 transition-opacity font-medium">
            Docs
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
