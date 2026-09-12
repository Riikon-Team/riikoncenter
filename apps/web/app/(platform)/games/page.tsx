"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import * as Icons from "lucide-react";
import { ThumbnailPlaceholder } from "../../../components/ui/thumbnail-placeholder";
import { AppManifest } from "../../../lib/apps";
import { useApps } from "../../../lib/hooks/useApps";

export default function GamesHubPage() {
  const { t } = useTranslation("common");
  const { apps, isLoading } = useApps();
  const availableGames = apps.filter(app => app.category === 'game' && app.type !== 'third-party');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 select-none">
      <div className="flex items-center gap-3 mb-8" id="games-hub-header">
        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
          <Icons.Gamepad2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
            {t("games_hub.title", "Games Hub")}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            {t("games_hub.desc", "Select a game to start playing directly inside your browser.")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="games-grid">
        {isLoading ? (
          <>
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
          </>
        ) : availableGames.map((game) => (
          <div
            key={game.id}
            className="flex flex-col bg-card border border-border/60 hover:border-cyan-500/40 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)] transition-all duration-300 group"
            id={`game-card-${game.id}`}
          >
            {/* Visual Header / Poster Placeholder */}
            {game.thumbnail ? (
              <div className="h-44 w-full border-b relative overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              </div>
            ) : (
              <div className="h-44 w-full relative overflow-hidden border-b">
                <ThumbnailPlaceholder 
                  icon={(Icons as any)[game.icon] || Icons.Box}
                  iconUrl={game.iconUrl}
                  appName={game.name}
                  bannerBg={game.bannerBg}
                />
              </div>
            )}

            {/* Description Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 bg-muted px-2.5 py-0.5 rounded-full">
                    {game.category}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full text-emerald-500 bg-emerald-500/10">
                    Active
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-1 group-hover:text-cyan-500 transition-colors">
                  {game.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {game.description}
                </p>
              </div>

              <div className="mt-5">
                <Link
                  href={game.entryPath}
                  className="w-full flex items-center justify-center gap-2 rounded-xl font-medium text-xs px-4 py-2.5 transition-colors border bg-cyan-500 text-white hover:bg-cyan-600 border-transparent"
                >
                  {t("games_hub.play", "Play Game")} <Icons.ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameCardSkeleton() {
  return (
    <div className="bg-card border border-border flex flex-col overflow-hidden rounded-2xl h-[320px]">
      <div className="w-full h-44 bg-muted animate-pulse shrink-0" />
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
          <div className="h-5 w-12 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
          <div className="h-3 bg-muted animate-pulse rounded w-full" />
          <div className="h-3 bg-muted animate-pulse rounded w-4/5" />
        </div>
        <div className="pt-4 mt-auto">
          <div className="h-10 bg-muted animate-pulse rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
