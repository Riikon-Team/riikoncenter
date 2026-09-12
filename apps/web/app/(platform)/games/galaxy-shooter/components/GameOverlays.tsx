import React, { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../store/useGameStore'

const diffOptions = [
  {
    id: 'easy',
    name: 'DỄ',
    desc: '• Hệ số điểm: x1\n• 10,000 điểm = +1 Mạng\n• Trải nghiệm cơ bản, dễ thở.',
    color: 'text-foreground',
    border: 'border-border',
    hover: 'hover:border-foreground hover:bg-foreground hover:text-background',
    shadow: '',
  },
  {
    id: 'normal',
    name: 'VỪA',
    desc: '• Hệ số điểm: x1.5\n• 25,000 điểm = +1 Mạng\n• Độ khó thông thường',
    color: 'text-foreground',
    border: 'border-border',
    hover: 'hover:border-foreground hover:bg-foreground hover:text-background',
    shadow: '',
  },
  {
    id: 'hard',
    name: 'KHÓ',
    desc: '• Hệ số điểm: x2\n• 50,000 điểm = +1 Mạng\n• Tỷ lệ rớt súng giảm mạnh.',
    color: 'text-foreground',
    border: 'border-border',
    hover: 'hover:border-foreground hover:bg-foreground hover:text-background',
    shadow: '',
  },
  {
    id: 'hardcore',
    name: 'HARDCORE',
    desc: '• Hệ số điểm: x3\n• KHÔNG CỘNG MẠNG (Chỉ 1 mạng duy nhất)\n• Sai một ly, đi một dặm.',
    color: 'text-destructive',
    border: 'border-destructive/50',
    hover: 'hover:border-destructive hover:bg-destructive hover:text-destructive-foreground',
    shadow: '',
  },
] as const

interface GameOverlaysProps {
  actions: any
}

export default function GameOverlays({ actions }: GameOverlaysProps) {
  const { t } = useTranslation('common')
  const {
    gameState,
    previousGameState,
    score,
    resumingCountdown,
    waveAnnouncement,
    difficulty,
    gameMode,
    saves,
    notification,
    setGameState,
  } = useGameStore()

  const {
    initGame,
    resumeGame,
    saveCurrentGame,
    loadGame,
    deleteSave,
    exportSaves,
    importSaves,
    surrenderGame,
  } = actions

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentDiff = useMemo(() => diffOptions[currentIndex] || diffOptions[0], [currentIndex])

  const nextDiff = () => {
    setCurrentIndex((currentIndex + 1) % diffOptions.length)
  }
  const prevDiff = () => {
    setCurrentIndex((currentIndex - 1 + diffOptions.length) % diffOptions.length)
  }

  const handlePlay = () => {
    setGameState({ difficulty: currentDiff.id })
    initGame()
  }

  const openSavesMenu = () => {
    setGameState({ previousGameState: gameState, gameState: 'saves' })
  }

  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const confirmExit = () => {
    setShowExitConfirm(false)
    setGameState({ gameState: 'menu' })
  }

  const [saveToDelete, setSaveToDelete] = useState<string | null>(null)
  const confirmDeleteSave = () => {
    if (saveToDelete) {
      deleteSave(saveToDelete)
      setSaveToDelete(null)
    }
  }

  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false)
  const confirmSurrender = () => {
    setShowSurrenderConfirm(false)
    surrenderGame()
  }

  const fileInput = useRef<HTMLInputElement | null>(null)
  const triggerImport = () => {
    fileInput.current?.click()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .scale-in-center { animation: scale-in-center 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
        @keyframes scale-in-center { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      `}} />

      {gameState === 'menu' && (
        <div className="absolute inset-0 z-[600] bg-background/95 backdrop-blur-md flex flex-col items-center pointer-events-auto overflow-y-auto py-8">
          <button
            onClick={() => setGameState({ gameState: 'leaderboard' })}
            className="fixed top-4 right-4 lg:top-8 lg:right-8 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-background border border-border text-foreground rounded-none text-xl lg:text-2xl transition-all hover:bg-foreground hover:text-background active:scale-95 z-[610]"
            title={t('galaxy_shooter.leaderboard', { defaultValue: 'Bảng Thành Tích' })}
          >
            🏆
          </button>

          <div className="border border-border bg-background/50 p-6 max-w-md w-full text-center mb-6 shrink-0 mt-auto">
            <div className="flex gap-2 mb-6 border-b border-border pb-6">
              <button
                className={`flex-1 py-3 font-display font-medium text-sm tracking-widest uppercase transition-all rounded-none border ${
                  gameMode === 'endless'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-foreground border-border'
                }`}
                onClick={() => setGameState({ gameMode: 'endless' })}
              >
                {t('galaxy_shooter.modes.endless')}
              </button>
              <button
                className={`flex-1 py-3 font-display font-medium text-sm tracking-widest uppercase transition-all rounded-none border ${
                  gameMode === 'campaign'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-foreground border-border'
                }`}
                onClick={() => setGameState({ gameMode: 'campaign' })}
              >
                {t('galaxy_shooter.modes.campaign')}
              </button>
            </div>

            <h3 className="text-xl font-display font-medium text-foreground tracking-widest mb-6 uppercase border-b border-border pb-2">
              {t('galaxy_shooter.choose_difficulty')}
            </h3>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevDiff}
                className="w-12 h-12 shrink-0 flex items-center justify-center bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors text-2xl font-light rounded-none active:scale-95"
              >
                &lt;
              </button>

              <button
                onClick={handlePlay}
                className={`flex-1 mx-3 py-3 bg-transparent border transition-all rounded-none group active:scale-95 flex flex-col items-center justify-center ${currentDiff.border} ${currentDiff.hover}`}
              >
                <span className={`font-display font-medium text-2xl tracking-widest transition-colors group-hover:text-inherit ${currentDiff.color}`}>
                  {t(`galaxy_shooter.difficulties.${currentDiff.id}.name`)}
                </span>
                <span className="text-xs font-body uppercase tracking-widest opacity-80 mt-1 transition-colors group-hover:text-inherit text-muted-foreground">
                  {t('galaxy_shooter.play_now')}
                </span>
              </button>

              <button
                onClick={nextDiff}
                className="w-12 h-12 shrink-0 flex items-center justify-center bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors text-2xl font-light rounded-none active:scale-95"
              >
                &gt;
              </button>
            </div>

            <button
              onClick={openSavesMenu}
              className="w-full py-3 border border-border bg-transparent hover:bg-muted/50 hover:border-foreground text-foreground font-display font-medium transition-all mb-4"
            >
              {t('galaxy_shooter.manage_saves')}
            </button>

            <div className="bg-transparent p-4 border border-border min-h-[7rem] flex items-center justify-center text-left flex-col gap-2">
              <span className="text-xs text-foreground bg-muted/50 px-2 py-1 border border-border w-full text-center tracking-widest uppercase">
                {gameMode === 'campaign' ? t('galaxy_shooter.mode_campaign_desc') : t('galaxy_shooter.mode_endless_desc')}
              </span>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed font-normal text-sm w-full mt-2">
                {t(`galaxy_shooter.difficulties.${currentDiff.id}.desc`)}
              </p>
            </div>
          </div>

          <div className="border border-border bg-background/50 p-6 max-w-md w-full text-center shrink-0 mb-auto">
            <h3 className="text-xl font-display font-medium text-foreground tracking-widest mb-4 uppercase border-b border-border pb-2">
              {t('galaxy_shooter.instructions')}
            </h3>
            <div className="hidden lg:flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-muted-foreground text-sm tracking-wider">{t('galaxy_shooter.inst_move')}</span>
                <span className="bg-transparent px-3 py-1 font-medium text-foreground border border-border text-xs tracking-widest">
                  {t('galaxy_shooter.inst_mouse_wasd')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm tracking-wider">{t('galaxy_shooter.inst_shoot')}</span>
                <span className="bg-transparent px-3 py-1 font-medium text-foreground border border-border text-xs tracking-widest">
                  {t('galaxy_shooter.inst_click_space')}
                </span>
              </div>
            </div>
            <div className="lg:hidden flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-muted-foreground text-sm tracking-wider">{t('galaxy_shooter.inst_move_shoot')}</span>
                <span className="bg-transparent px-3 py-1.5 font-medium text-foreground border border-border w-full text-xs tracking-widest">
                  {t('galaxy_shooter.inst_touch')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center z-[500] backdrop-blur-md pointer-events-auto">
          <h2 className="text-7xl font-display font-bold mb-2 text-foreground tracking-tighter uppercase">
            {t('galaxy_shooter.game_over')}
          </h2>
          <p className="text-3xl text-muted-foreground font-display font-medium mb-10">{t('galaxy_shooter.score')} {score}</p>
          <button
            onClick={() => setGameState({ gameState: 'menu' })}
            className="px-10 py-4 bg-transparent border border-border text-foreground font-display font-medium text-xl transition-all hover:bg-foreground hover:text-background cursor-pointer active:scale-95"
          >
            {t('galaxy_shooter.main_menu')}
          </button>
        </div>
      )}

      {gameState === 'victory' && (
        <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center z-[500] backdrop-blur-md pointer-events-auto">
          <h2 className="text-6xl md:text-8xl font-display font-bold mb-4 text-foreground tracking-widest uppercase animate-fade-up">
            {t('galaxy_shooter.victory')}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-body mb-2 animate-fade-up animate-delay-1 text-center px-4">
            {t('galaxy_shooter.victory_msg')}
          </p>
          <p className="text-4xl text-foreground font-display font-medium mb-10 animate-fade-up animate-delay-2">
            {t('galaxy_shooter.total_score')} {score.toLocaleString()}
          </p>
          <button
            onClick={() => setGameState({ gameState: 'menu' })}
            className="px-10 py-4 bg-foreground text-background font-display font-medium text-xl transition-all hover:bg-muted-foreground active:scale-95 animate-fade-up animate-delay-3"
          >
            {t('galaxy_shooter.return_menu')}
          </button>
        </div>
      )}

      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center z-[400] pointer-events-auto">
          <h2 className="text-7xl font-display font-bold text-foreground mb-8 tracking-widest uppercase">
            {t('galaxy_shooter.paused')}
          </h2>

          <div className="flex flex-col gap-4 w-64">
            <button
              onClick={resumeGame}
              className="px-8 py-4 bg-foreground text-background font-display font-medium text-xl transition-all hover:bg-muted-foreground active:scale-95 cursor-pointer border border-transparent"
            >
              {t('galaxy_shooter.continue')}
            </button>

            <button
              onClick={openSavesMenu}
              className="px-8 py-4 bg-transparent text-foreground border border-border font-display font-medium text-xl transition-all hover:bg-muted/50 active:scale-95 cursor-pointer"
            >
              {t('galaxy_shooter.save_load')}
            </button>

            <button
              onClick={() => setShowSurrenderConfirm(true)}
              className="px-8 py-4 bg-transparent border border-destructive text-destructive font-display font-medium text-xl transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-95 cursor-pointer"
            >
              {gameMode === 'campaign' ? t('galaxy_shooter.give_up') : t('galaxy_shooter.retreat')}
            </button>

            <button
              onClick={() => setShowExitConfirm(true)}
              className="px-8 py-4 bg-transparent border border-border text-foreground font-display font-medium text-xl transition-all hover:bg-muted/50 active:scale-95 cursor-pointer"
            >
              {t('galaxy_shooter.menu')}
            </button>
          </div>

          <p className="font-display text-xl text-muted-foreground mt-8 text-center">
            <span className="hidden lg:inline">{t('galaxy_shooter.pause_hint')}</span>
          </p>

          {showExitConfirm && (
            <div className="fixed inset-0 z-[700] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4 pointer-events-auto">
              <div className="bg-background border border-border p-8 max-w-sm w-full text-center scale-in-center">
                <h3 className="text-2xl font-display font-bold text-foreground mb-4 uppercase tracking-tighter">
                  {t('galaxy_shooter.confirm_exit')}
                </h3>
                <p className="font-display text-muted-foreground mb-8">
                  {t('galaxy_shooter.exit_warning')}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="font-display py-3 bg-transparent border border-border text-foreground font-medium hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    {t('galaxy_shooter.go_back')}
                  </button>
                  <button
                    onClick={confirmExit}
                    className="font-display py-3 bg-destructive text-destructive-foreground font-medium hover:brightness-110 transition-all cursor-pointer"
                  >
                    {t('galaxy_shooter.exit')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showSurrenderConfirm && (
            <div className="fixed inset-0 z-[700] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4 pointer-events-auto">
              <div
                className={`bg-background border p-8 max-w-sm w-full text-center scale-in-center ${
                  gameMode === 'campaign'
                    ? 'border-destructive'
                    : 'border-border'
                }`}
              >
                <h3
                  className={`text-2xl font-display font-bold mb-4 uppercase tracking-tighter ${
                    gameMode === 'campaign' ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {gameMode === 'campaign' ? t('galaxy_shooter.surrender_campaign') : t('galaxy_shooter.surrender_endless')}
                </h3>

                {gameMode === 'campaign' ? (
                  <p className="font-display text-muted-foreground mb-8" dangerouslySetInnerHTML={{ __html: t('galaxy_shooter.surrender_campaign_warning').replace('<1>', '<span class="text-destructive font-medium font-display">').replace('</1>', '</span>').replace('<3>', '<span class="text-destructive font-medium">').replace('</3>', '</span>') }} />
                ) : (
                  <p className="font-display text-muted-foreground mb-8" dangerouslySetInnerHTML={{ __html: t('galaxy_shooter.surrender_endless_warning').replace('<1>', '<span class="text-foreground font-medium font-display">').replace('</1>', '</span>') }} />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowSurrenderConfirm(false)}
                    className="font-display py-3 bg-transparent border border-border text-foreground font-medium hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    {t('galaxy_shooter.continue_playing')}
                  </button>
                  <button
                    onClick={confirmSurrender}
                    className={`font-display py-3 font-medium transition-all cursor-pointer ${
                      gameMode === 'campaign'
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        : 'bg-foreground text-background hover:bg-muted-foreground'
                    }`}
                  >
                    {gameMode === 'campaign' ? t('galaxy_shooter.accept_defeat') : t('galaxy_shooter.end_game')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'saves' && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-md z-[600] flex flex-col items-center justify-center pointer-events-auto p-4">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 uppercase tracking-widest">
            {t('galaxy_shooter.saves_title')}
          </h2>

          <div className="w-full max-w-2xl bg-transparent border border-border p-4 flex flex-col gap-3 max-h-[50vh] overflow-y-auto mb-6">
            {saves.length === 0 && (
              <div className="text-muted-foreground font-medium text-center py-10 tracking-widest">
                {t('galaxy_shooter.no_saves')}
              </div>
            )}

            {saves.map((save) => (
              <div
                key={save.id}
                className="p-4 border border-border bg-background/50 flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-colors hover:border-foreground"
              >
                <div className="flex flex-col">
                  <span className="text-foreground font-medium font-display text-xl uppercase tracking-wider">
                    {save.name}
                  </span>
                  <span className="text-sm text-muted-foreground font-normal mt-1">
                    {t('galaxy_shooter.score')} {save.score.toLocaleString()} | {t('galaxy_shooter.lives')} {save.lives}
                  </span>
                  <span className="text-xs text-muted-foreground/50 mt-0.5">
                    {new Date(save.date).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => loadGame(save)}
                    className="px-5 py-2 bg-foreground text-background font-medium font-display hover:bg-muted-foreground transition-colors cursor-pointer rounded-none border border-transparent"
                  >
                    {t('galaxy_shooter.load')}
                  </button>
                  <button
                    onClick={() => setSaveToDelete(save.id)}
                    className="px-5 py-2 bg-transparent text-foreground border border-border font-medium font-display hover:bg-destructive hover:border-destructive hover:text-destructive-foreground transition-colors cursor-pointer rounded-none"
                  >
                    {t('galaxy_shooter.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl">
            {previousGameState === 'paused' && (
              <button
                onClick={saveCurrentGame}
                className="px-6 py-4 bg-foreground text-background font-medium font-display hover:bg-muted-foreground transition-colors cursor-pointer rounded-none shrink-0"
              >
                {t('galaxy_shooter.save_current')}
              </button>
            )}

            <button
              onClick={triggerImport}
              className="px-6 py-4 bg-transparent border border-border text-foreground font-medium font-display hover:bg-muted/50 transition-colors cursor-pointer rounded-none shrink-0"
            >
              {t('galaxy_shooter.import_json')}
            </button>

            <input
              type="file"
              ref={fileInput}
              accept=".json"
              className="hidden"
              onChange={importSaves as any}
            />

            <button
              onClick={exportSaves}
              className="px-6 py-4 bg-transparent border border-border text-foreground font-medium font-display hover:bg-muted/50 transition-colors cursor-pointer rounded-none shrink-0"
            >
              {t('galaxy_shooter.export_json')}
            </button>

            <button
              onClick={() => setGameState({ gameState: previousGameState })}
              className="px-6 py-4 bg-transparent border border-border text-muted-foreground font-medium font-display hover:text-foreground transition-colors cursor-pointer rounded-none shrink-0"
            >
              {t('galaxy_shooter.back_to_window')}
            </button>
          </div>

          {saveToDelete && (
            <div className="fixed inset-0 z-[700] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4 pointer-events-auto">
              <div className="bg-background border border-border p-8 max-w-sm w-full text-center scale-in-center">
                <h3 className="text-2xl font-display font-bold text-foreground mb-4 uppercase tracking-tighter">
                  {t('galaxy_shooter.confirm_delete')}
                </h3>
                <p className="text-muted-foreground mb-8">
                  {t('galaxy_shooter.delete_warning')}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSaveToDelete(null)}
                    className="font-display py-3 bg-transparent border border-border text-foreground font-medium hover:bg-muted/50 transition-colors cursor-pointer rounded-none"
                  >
                    {t('galaxy_shooter.cancel')}
                  </button>
                  <button
                    onClick={confirmDeleteSave}
                    className="font-display py-3 bg-destructive text-destructive-foreground font-medium hover:brightness-110 transition-all cursor-pointer rounded-none"
                  >
                    {t('galaxy_shooter.delete_now')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'resuming' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[400] pointer-events-none">
          <span className="text-[150px] font-display font-bold text-accent-amber drop-shadow-[0_0_20px_#FFB830]">
            {resumingCountdown}
          </span>
        </div>
      )}

      {waveAnnouncement && (
        <div className="absolute top-1/3 left-0 w-full flex items-center justify-center z-[300] pointer-events-none">
          <h2 className="text-5xl sm:text-6xl font-display font-bold text-foreground tracking-widest text-center px-4 uppercase whitespace-pre-line">
            {waveAnnouncement}
          </h2>
        </div>
      )}

      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-background border border-border text-foreground px-8 py-4 font-display font-medium text-lg sm:text-xl rounded-none shadow-sm z-[9999] pointer-events-none scale-in-center uppercase tracking-widest">
          {notification}
        </div>
      )}
    </>
  )
}
