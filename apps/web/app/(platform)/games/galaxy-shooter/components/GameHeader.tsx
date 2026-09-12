import React from 'react'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { GAME_WIDTH, WEAPON_TYPES } from '../utils/config'
import { SPRITES } from '../utils/sprites'
import { useGameStore } from '../store/useGameStore'

const diffMap: Record<string, { color: string }> = {
  easy: { color: 'text-green-500 dark:text-green-400' },
  normal: { color: 'text-yellow-500 dark:text-yellow-400' },
  hard: { color: 'text-orange-500 dark:text-orange-400' },
  hardcore: { color: 'text-red-500 dark:text-red-400' },
}

interface GameHeaderProps {
  gameScale: number
  actions: any
}

export default function GameHeader({ gameScale, actions }: GameHeaderProps) {
  const router = useRouter()
  const { t } = useTranslation('common')
  
  const {
    score,
    lives,
    weaponType,
    weaponLevel,
    currentWave,
    isMuted,
    gameState,
    difficulty,
  } = useGameStore()

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div
        className="w-full mx-auto flex justify-between items-center bg-background/95 backdrop-blur p-2 lg:p-4 border-b border-border z-50 shrink-0 pointer-events-auto"
        style={{ maxWidth: `${GAME_WIDTH * gameScale}px` }}
      >
        <div className="flex gap-2 lg:gap-6 items-center overflow-x-auto whitespace-nowrap hide-scrollbar">
          <h1 className="text-base sm:text-lg lg:text-2xl font-display font-bold text-foreground uppercase tracking-tight">
            {t('galaxy_shooter.score')} {score}
          </h1>
          <div className="flex items-center gap-1 lg:gap-2 border-l border-border pl-2 lg:pl-4 text-sm sm:text-base lg:text-xl font-display font-medium text-foreground">
            {lives}
            <div className="w-5 h-5 lg:w-6 lg:h-6 animate-pulse opacity-80" dangerouslySetInnerHTML={{ __html: SPRITES.heart }}></div>
          </div>
          <div className="flex items-center gap-1 lg:gap-2 font-display font-medium border border-border bg-muted/30 px-1.5 py-1 lg:px-3 lg:py-1.5 transition-colors hover:border-foreground/30">
            <div
              className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 inline-block ${WEAPON_TYPES[weaponType]?.color || ''}`}
              dangerouslySetInnerHTML={{ __html: SPRITES.giftBox }}
            ></div>

            <span className="text-foreground pl-1">
              {WEAPON_TYPES[weaponType]?.name || ''}
            </span>
            <span className="text-muted-foreground hidden lg:inline">/</span>
            <span className="text-muted-foreground uppercase hidden lg:inline">{t('galaxy_shooter.level', { defaultValue: 'CẤP' })} {weaponLevel}</span>
            <span className="text-muted-foreground uppercase lg:hidden text-[11px] sm:text-sm pl-1">
              LV.{weaponLevel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 lg:gap-2 font-display font-medium border border-border bg-muted/30 px-1.5 py-1 lg:px-3 lg:py-1.5">
            <span className="text-muted-foreground text-[10px] lg:text-xs tracking-widest">//</span>
            <span className="text-muted-foreground text-[11px] sm:text-sm lg:text-base">
              WAVE {currentWave}
            </span>
            <span className="text-border mx-0.5 lg:mx-1">|</span>
            <span className={`text-[11px] sm:text-sm lg:text-base uppercase ${diffMap[difficulty]?.color || ''}`}>
              {t(`galaxy_shooter.difficulties.${difficulty}.name`)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
          <button
            onClick={() => actions.toggleMute()}
            className="w-7 h-7 lg:w-10 lg:h-10 flex items-center justify-center bg-background border border-border text-muted-foreground transition-all hover:border-foreground hover:text-foreground text-xs lg:text-base"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={() => actions.togglePause()}
            className="w-7 h-7 lg:w-10 lg:h-10 flex items-center justify-center bg-background border border-border text-muted-foreground transition-all hover:border-foreground hover:text-foreground font-medium text-sm lg:text-lg"
          >
            {gameState === 'paused' || gameState === 'resuming' ? '▶' : '⏸'}
          </button>
          <button
            onClick={() => router.push('/games')}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold rounded-lg sm:rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300"
          >
            <LogOut size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('galaxy_shooter.exit')}</span>
          </button>
        </div>
      </div>
    </>
  )
}
