"use client";
import { motion } from "motion/react";
import { Github } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import teamData from "../../data/team.json";
import { TeamBackgroundObjects } from "./BackgroundObjects";

export function TeamSection() {
  const { t } = useTranslation("common");

  return (
    <section className="h-dvh w-full snap-start relative flex flex-col md:flex-row items-center justify-center px-6 md:px-24 bg-muted/30 text-foreground overflow-hidden gap-12">
      <TeamBackgroundObjects />
      {/* Ambient Blue Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/[0.03] dark:bg-cyan-600/[0.05] rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/[0.03] dark:bg-blue-600/[0.05] rounded-full blur-[160px] -z-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col items-start justify-center relative z-10 text-left"
      >
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-none">
          {t('landing.team.title')}
        </h2>
        <p className="text-lg text-muted-foreground font-light max-w-md leading-relaxed mb-6">
          {t('landing.team.desc')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="flex-1 w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10"
      >
        {teamData.map((member, index) => (
          <motion.div
            key={member.id}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="flex flex-col items-center justify-center p-6 rounded-3xl bg-background border border-border shadow-sm group hover:border-cyan-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)] transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 mb-4 flex items-center justify-center overflow-hidden border border-border group-hover:border-cyan-500/50 transition-colors duration-300">
              {member.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-muted-foreground font-bold">{member.name.charAt(0)}</span>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
            <p className="text-muted-foreground mb-4 text-xs font-medium text-center">{member.role}</p>
            
            <Link 
              href={member.github_url || "#"} 
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-cyan-500 hover:text-white dark:hover:text-white transition-all duration-300"
            >
              <Github className="w-4 h-4" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
