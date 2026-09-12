import { create } from 'zustand'
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/config'
import type {
  Bullet,
  Enemy,
  Boss,
  Egg,
  PowerUp,
  ActiveDot,
  LeaderboardEntry,
  SaveSlot,
  GameEngine,
} from '../utils/types'

export type GameStatus =
  | 'menu'
  | 'starting'
  | 'playing'
  | 'gameover'
  | 'paused'
  | 'resuming'
  | 'leaderboard'
  | 'saves'
  | 'victory'

export interface GameState {
  gameState: GameStatus
  previousGameState: GameStatus
  gameMode: 'endless' | 'campaign'
  gamePhase: 'minions' | 'meteors' | 'boss'
  difficulty: 'easy' | 'normal' | 'hard' | 'hardcore'
  currentWave: number
  weaponType: number
  weaponLevel: number
  bgHue: number
  boardRotation: number
  isRotating: boolean
  activeWidth: number
  activeHeight: number
  globalScale: number
  isMuted: boolean
  hiddenEventWavesLeft: number
  resumingCountdown: number
  resumeInterval: ReturnType<typeof setInterval> | null
  notification: string
  
  player: {
    x: number
    y: number
    width: number
    height: number
    invulnerable: number
  }
  score: number
  lives: number
  
  bullets: Bullet[]
  enemyBullets: Egg[]
  enemies: Enemy[]
  powerUps: PowerUp[]
  bosses: Boss[]
  waveAnnouncement: string
  activeDots: ActiveDot[]
  
  leaderboard: LeaderboardEntry[]
  saves: SaveSlot[]
  currentSaveId: string | null
  
  engine: GameEngine

  tick?: number

  // Actions
  setGameState: (state: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => void
  showNotification: (msg: string) => void
}

let notifTimeout: ReturnType<typeof setTimeout> | null = null;

export const initialGameState = {
  gameState: 'menu' as GameStatus,
  previousGameState: 'menu' as GameStatus,
  gameMode: 'endless' as const,
  gamePhase: 'minions' as const,
  difficulty: 'easy' as const,
  currentWave: 1,
  weaponType: 0,
  weaponLevel: 1,
  bgHue: 0,
  boardRotation: 0,
  isRotating: false,
  activeWidth: GAME_WIDTH,
  activeHeight: GAME_HEIGHT,
  globalScale: 1,
  isMuted: false,
  hiddenEventWavesLeft: 0,
  resumingCountdown: 0,
  resumeInterval: null,
  notification: '',
  tick: 0,
  
  player: {
    x: GAME_WIDTH / 2 - 30,
    y: GAME_HEIGHT - 90,
    width: 60,
    height: 60,
    invulnerable: 0,
  },
  score: 0,
  lives: 3,
  
  bullets: [],
  enemyBullets: [],
  enemies: [],
  powerUps: [],
  bosses: [],
  waveAnnouncement: '',
  activeDots: [],
  
  leaderboard: [],
  saves: [],
  currentSaveId: null,
  
  engine: {
    pendingSpawns: [],
    hazardSpawnCooldown: 0,
    formationCenter: { x: GAME_WIDTH / 2, y: 150, dx: 1 },
    formationTimer: 0,
    formationType: 0,
    objCounter: 0,
    lastFireTime: 0,
    enemyDirection: 1,
    wasSpaceDown: false,
    isTransitioningWave: false,
    hasSpawnedBoss: false,
    waveEnemySpeed: 1.5,
    waveEggFireRate: 0.005,
  }
}

export const useGameStore = create<GameState>((set, get) => {
  let initialLeaderboard: LeaderboardEntry[] = []
  let initialSaves: SaveSlot[] = []
  
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('chicken_invaders_leaderboard')
      if (stored) initialLeaderboard = JSON.parse(stored)
      
      const storedSaves = localStorage.getItem('chicken_invaders_saves')
      if (storedSaves) initialSaves = JSON.parse(storedSaves)
    } catch (e) {
      console.error('Error loading stored game data', e)
    }
  }

  return {
    ...initialGameState,
    leaderboard: initialLeaderboard,
    saves: initialSaves,
    
    setGameState: (updater) => set((state) => {
      return typeof updater === 'function' ? updater(state) : updater
    }),
    
    showNotification: (msg: string) => {
      set({ notification: msg })
      if (notifTimeout) clearTimeout(notifTimeout)
      notifTimeout = setTimeout(() => {
        set({ notification: '' })
      }, 3000)
    }
  }
})
