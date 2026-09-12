import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'

import { sfx } from '../utils/audio'
import { GAME_WIDTH, GAME_HEIGHT, WEAPON_TYPES, FIRE_RATE } from '../utils/config'
import { getWeaponStats, arrangeFormation, getRotationForWave } from '../utils/utils'
import { getCampaignBosses } from '../utils/campaign'

import type { useControls } from './useControls'
import type { Enemy, SaveSlot } from '../utils/types'
import { vfx } from '../utils/vfx'

export function useGameActions(controls: ReturnType<typeof import('./useControls').useControls>) {
  const getState = useGameStore.getState;
  const setGameState = (s: any) => getState().setGameState(s);
  

  const { mousePressed, mobileKeys, pointerState, getKeys } = controls

  const resumeGame = () => {
    if (getState().gameState !== 'paused') return
    getState().gameState = 'resuming'
    getState().resumingCountdown = 3
    sfx.playTone(600, 600, 'square', 0.1, 0.1)

    getState().resumeInterval = setInterval(() => {
      getState().resumingCountdown--
      if (getState().resumingCountdown > 0) {
        sfx.playTone(600, 600, 'square', 0.1, 0.1)
      } else {
        if (getState().resumeInterval) clearInterval(getState().resumeInterval as NodeJS.Timeout)
        sfx.playTone(800, 800, 'square', 0.3, 0.1)
        getState().gameState = 'playing'
        getState().engine.lastFireTime = Date.now()
      }
    }, 1000)
  }

  const togglePause = () => {
    sfx.init()
    if (getState().gameState === 'playing') getState().gameState = 'paused'
    else if (getState().gameState === 'paused') resumeGame()
    else if (getState().gameState === 'resuming') {
      if (getState().resumeInterval) clearInterval(getState().resumeInterval as NodeJS.Timeout)
      getState().gameState = 'paused'
    }
  }

  const toggleMute = () => {
    getState().isMuted = !getState().isMuted
    sfx.isMuted = getState().isMuted
    sfx.init()
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const state = useGameStore.getState();
        if (getState().gameState === 'playing') togglePause();
        else if (getState().gameState === 'paused') resumeGame();
      } else if (e.key === ' ' && useGameStore.getState().gameState === 'paused') {
        resumeGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);


  

  

  const addScore = (pts: number) => {
    let mult = 1,
      milestone = 10000
    if (getState().difficulty === 'normal') {
      mult = 1.5
      milestone = 25000
    } else if (getState().difficulty === 'hard') {
      mult = 2
      milestone = 50000
    } else if (getState().difficulty === 'hardcore') {
      mult = 3
      milestone = Infinity
    }

    const actualPts = pts * mult
    const oldMilestone = Math.floor(getState().score / milestone)
    getState().score += actualPts
    const newMilestone = Math.floor(getState().score / milestone)

    if (newMilestone > oldMilestone && getState().difficulty !== 'hardcore') {
      getState().lives += newMilestone - oldMilestone
      sfx.powerup()
    }
  }

  const takeDamage = () => {
    if (getState().player.invulnerable > 0) return
    sfx.damage()
    getState().lives -= 1
    getState().weaponLevel = Math.max(1, getState().weaponLevel - 1)
    getState().player.invulnerable = 120
    if (getState().lives <= 0) {
      getState().gameState = 'gameover'
      getState().leaderboard.push({
        score: getState().score,
        wave: getState().currentWave,
        difficulty: getState().difficulty,
        mode: getState().gameMode,
        date: Date.now(),
      })
      getState().leaderboard.sort((a, b) => b.score - a.score)
      getState().leaderboard = getState().leaderboard.slice(0, 100)

      localStorage.setItem('chicken_invaders_leaderboard', JSON.stringify(getState().leaderboard))

      if (getState().currentSaveId) {
        getState().saves = getState().saves.filter((s) => s.id !== getState().currentSaveId)
        localStorage.setItem('chicken_invaders_saves', JSON.stringify(getState().saves))
        getState().currentSaveId = null
      }
    }
  }

  const startWave = (wave: number) => {
    // Luôn giữ background scale là 1 (không dùng CSS transform nữa)
    getState().globalScale = 1.0

    // CHỈ THU NHỎ KÍCH THƯỚC PHI THUYỀN (PLAYER) XUỐNG CÒN 30x30 Ở MÀN 120
    if (getState().gameMode === 'campaign' && wave === 120) {
      getState().player.width = 30
      getState().player.height = 30
    } else {
      getState().player.width = 60
      getState().player.height = 60
    }

    getState().bullets = []
    getState().enemyBullets = []
    getState().activeDots = []
    getState().bgHue = (Math.floor((wave - 1) / 10) * 45) % 360
    getState().engine.hasSpawnedBoss = false

    let hpMult = 1,
      eggRateMult = 1
    if (getState().difficulty === 'normal') {
      hpMult = 1.5
      eggRateMult = 1.5
    } else if (getState().difficulty === 'hard' || getState().difficulty === 'hardcore') {
      hpMult = 2
      eggRateMult = 2
    }

    getState().engine.waveEnemySpeed =
      Math.min(1.2 + wave * 0.02, 4.0) * (getState().difficulty !== 'easy' ? 1.2 : 1)
    getState().engine.waveEggFireRate = Math.min(0.005 + wave * 0.0002, 0.02) * eggRateMult

    if (getState().hiddenEventWavesLeft > 0) getState().hiddenEventWavesLeft--
    if (getState().hiddenEventWavesLeft === 0 && wave > 30 && wave % 10 === 6 && Math.random() < 0.1)
      getState().hiddenEventWavesLeft = 4

    const isMeteorZone = wave % 100 >= 71 && wave % 100 <= 79
    const isFallingChickenZone = wave % 10 === 8 && !isMeteorZone
    const isNormalMeteorZone = wave % 10 === 5 && !isMeteorZone

    getState().engine.pendingSpawns = []
    getState().enemies = []

    // XỬ LÝ BOSS
    if (wave % 10 === 0) {
      getState().gamePhase = 'boss'
      getState().engine.hasSpawnedBoss = true

      if (getState().gameMode === 'campaign') {
        getState().bosses = getCampaignBosses(wave, getState().activeWidth, hpMult, getState().engine)
      } else {
        getState().bosses = []
        let bType = 0
        if (wave % 100 === 80) bType = 4
        else if (wave >= 100) bType = Math.floor(Math.random() * 4)
        else if (wave >= 40) bType = Math.floor(Math.random() * 3)
        else if (wave >= 20) bType = Math.random() > 0.5 ? 1 : 0
        else bType = 0

        const baseHp = (1000 + wave * 400) * hpMult

        if (bType === 1) {
          getState().bosses.push({
            id: `boss-${getState().engine.objCounter++}`,
            bossType: 1,
            x: getState().activeWidth / 4 - 60,
            y: -200,
            targetY: 60,
            width: 120,
            height: 120,
            hp: baseHp * 0.6,
            maxHp: baseHp * 0.6,
            direction: 1,
            state: 'idle',
            stateTimer: 0,
          })
          getState().bosses.push({
            id: `boss-${getState().engine.objCounter++}`,
            bossType: 1,
            x: (getState().activeWidth / 4) * 3 - 60,
            y: -200,
            targetY: 60,
            width: 120,
            height: 120,
            hp: baseHp * 0.6,
            maxHp: baseHp * 0.6,
            direction: -1,
            state: 'idle',
            stateTimer: 0,
          })
        } else {
          getState().bosses.push({
            id: `boss-${getState().engine.objCounter++}`,
            bossType: bType,
            x: getState().activeWidth / 2 - 80,
            y: -200,
            targetY: 40,
            width: 160,
            height: 160,
            hp: baseHp,
            maxHp: baseHp,
            direction: 1,
            state: 'idle',
            stateTimer: 60,
            laserTimer: 200,
            burstCount: 0,
          })
        }
      }
      return
    }

    if (isMeteorZone || isFallingChickenZone || isNormalMeteorZone) {
      getState().gamePhase = 'meteors'
      getState().engine.hazardSpawnCooldown = 0
      const count = isMeteorZone
        ? Math.floor(Math.random() * 31) + 50
        : isFallingChickenZone
          ? 20 + Math.floor(wave / 2)
          : Math.floor(Math.random() * 31) + 50

      for (let i = 0; i < count; i++) {
        const size = isFallingChickenZone ? 45 : 40 + Math.random() * 40
        let dx = 0,
          dy = getState().engine.waveEnemySpeed * 1.4
        if (isMeteorZone) {
          const rand = Math.random()
          if (rand < 0.33) dx = -(getState().engine.waveEnemySpeed * 1.0)
          else if (rand < 0.66) dx = getState().engine.waveEnemySpeed * 1.0
          dy = getState().engine.waveEnemySpeed * 1.6
        } else if (isFallingChickenZone) {
          dy = 2.0 * 0.7
        }

        const startX = isMeteorZone
          ? Math.random() * (getState().activeWidth * 2) - getState().activeWidth / 2
          : Math.random() * (getState().activeWidth - size)
        const SHIRT_COLORS = [
          '#ef4444',
          '#3b82f6',
          '#22c55e',
          '#a855f7',
          '#facc15',
          '#ec4899',
          '#06b6d4',
        ]
        const availableColors = SHIRT_COLORS.slice(
          0,
          Math.min(1 + Math.floor((wave - 1) / 10), SHIRT_COLORS.length),
        )

        getState().engine.pendingSpawns.push({
          id: `falling-${getState().engine.objCounter++}`,
          x: startX,
          y: -100 - Math.random() * 50,
          width: size,
          height: size,
          hp: (40 + wave * 5) * hpMult,
          maxHp: (40 + wave * 5) * hpMult,
          isMeteor: !isFallingChickenZone,
          isFallingChicken: isFallingChickenZone,
          shirtColor: isFallingChickenZone
            ? availableColors[Math.floor(Math.random() * availableColors.length)]
            : undefined,
          dx,
          dy,
        })
      }
      return
    }

    getState().gamePhase = 'minions'
    getState().engine.enemyDirection = 1
    const minionHp = (wave === 1 ? 10 : 15 + wave * 10) * hpMult
    const generatedMinions: Enemy[] = []

    if (wave % 10 === 6) {
      for (let i = 0; i < 15; i++)
        generatedMinions.push({
          id: `dyn-${getState().engine.objCounter++}`,
          x: getState().activeWidth / 2,
          y: -200,
          width: 40,
          height: 40,
          hp: minionHp,
          maxHp: minionHp,
          isStash: i === 0,
          shirtColor: getRandomColor(),
          targetOffsetX: 0,
          targetOffsetY: 0,
        })
      getState().engine.formationType = 0
      getState().engine.formationTimer = 200
      getState().engine.formationCenter.x = getState().activeWidth / 2
      getState().engine.formationCenter.y = 150
      getState().engine.formationCenter.dx = 1
      arrangeFormation(generatedMinions, getState().engine.formationType)
    } else if (wave % 10 === 4 || wave % 10 === 9) {
      const isX = wave % 10 === 4
      const size = 5
      const startX = getState().activeWidth / 2
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (isX) {
            if (r === c || r + c === size - 1)
              generatedMinions.push({
                id: `enemy-${getState().engine.objCounter++}`,
                x: startX + (c - size / 2) * 60,
                y: -200 - r * 60,
                targetY: 80 + r * 50,
                width: 40,
                height: 40,
                hp: minionHp,
                maxHp: minionHp,
                shirtColor: getRandomColor(),
              })
          } else {
            if (
              Math.abs(r - Math.floor(size / 2)) + Math.abs(c - Math.floor(size / 2)) <=
              Math.floor(size / 2) + 1
            )
              generatedMinions.push({
                id: `enemy-${getState().engine.objCounter++}`,
                x: startX + (c - size / 2) * 60,
                y: -200 - r * 60,
                targetY: 80 + r * 50,
                width: 40,
                height: 40,
                hp: minionHp,
                maxHp: minionHp,
                shirtColor: getRandomColor(),
              })
          }
        }
      }
      if (generatedMinions[0]) {
        if (wave % 10 === 4) generatedMinions[0].isStash = true
        else if (wave % 10 === 9) {
          if (getState().difficulty === 'easy') generatedMinions[0].isStash = true
          else if (getState().weaponLevel <= Math.floor(wave / 10) + 1)
            generatedMinions[0].isStash = true
        }
      }
    } else if (wave % 10 === 3) {
      if (Math.random() > 0.5) {
        const radius = getState().activeWidth < 800 ? 120 : 160
        for (let i = 0; i < 14; i++)
          generatedMinions.push({
            id: `enemy-${getState().engine.objCounter++}`,
            x: getState().activeWidth / 2 - 20 + radius * Math.cos((Math.PI * 2 * i) / 14),
            y: -200 - i * 30,
            targetY: 240 + radius * Math.sin((Math.PI * 2 * i) / 14),
            width: 40,
            height: 40,
            hp: minionHp,
            maxHp: minionHp,
            shirtColor: getRandomColor(),
          })
      } else {
        const spacingX = getState().activeWidth < 800 ? 45 : 65
        for (let i = 0; i < 11; i++)
          generatedMinions.push({
            id: `enemy-${getState().engine.objCounter++}`,
            x: getState().activeWidth / 2 - 20 + (i - 5) * spacingX,
            y: -100 - Math.abs(i - 5) * 60,
            targetY: 80 + Math.abs(i - 5) * 55,
            width: 40,
            height: 40,
            hp: minionHp,
            maxHp: minionHp,
            shirtColor: getRandomColor(),
          })
      }
    } else {
      const rows = Math.min(3 + Math.floor(wave / 4), 5)
      const maxCols = getState().activeWidth < 800 ? 10 : 12
      const cols = Math.min(8 + Math.floor(wave / 3), maxCols)
      const spacingX = getState().activeWidth < 800 ? 45 : 50

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (wave % 10 === 7 && row === Math.floor(rows / 2) && col === Math.floor(cols / 2)) {
            generatedMinions.push({
              id: `stash-${getState().engine.objCounter++}`,
              x: (getState().activeWidth - cols * spacingX) / 2 + col * spacingX,
              y: -100 - (rows - row) * 80,
              targetY: 60 + row * 45,
              width: 90,
              height: 85,
              hp: minionHp * 15,
              maxHp: minionHp * 15,
              isStash: true,
            })
            continue
          }
          if (
            wave % 10 === 7 &&
            (row === Math.floor(rows / 2) || row === Math.floor(rows / 2) + 1) &&
            (col === Math.floor(cols / 2) || col === Math.floor(cols / 2) + 1)
          )
            continue
          generatedMinions.push({
            id: `enemy-${getState().engine.objCounter++}`,
            x: (getState().activeWidth - cols * spacingX) / 2 + col * spacingX,
            y: -100 - (rows - row) * 80,
            targetY: 60 + row * 45,
            width: 40,
            height: 40,
            hp: minionHp,
            maxHp: minionHp,
            isStash: false,
            shirtColor: getRandomColor(),
          })
        }
      }
    }
    getState().engine.pendingSpawns = generatedMinions

    function getRandomColor() {
      const SHIRT_COLORS = [
        '#ef4444',
        '#3b82f6',
        '#22c55e',
        '#a855f7',
        '#facc15',
        '#ec4899',
        '#06b6d4',
      ]
      const availableColors = SHIRT_COLORS.slice(
        0,
        Math.min(1 + Math.floor((wave - 1) / 10), SHIRT_COLORS.length),
      )
      return availableColors[Math.floor(Math.random() * availableColors.length)]
    }
  }

  const startGame = () => {
    sfx.init()
    getState().gameState = 'starting'
    getState().engine.isTransitioningWave = true
    getState().waveAnnouncement = 'WAVE 1'
    setTimeout(() => {
      getState().gameState = 'playing'
      startWave(1)
      getState().waveAnnouncement = ''
      getState().engine.isTransitioningWave = false
    }, 2000)
  }

  const initGame = (isLoading = false) => {
    if (!isLoading) {
      getState().currentWave = 1
      getState().weaponType = 0
      getState().weaponLevel = 1
      getState().score = 0
      getState().currentSaveId = null

      if (getState().difficulty === 'hardcore') getState().lives = 1
      else getState().lives = 3
    }

    getState().bullets = []
    getState().enemyBullets = []
    getState().powerUps = []
    getState().engine.pendingSpawns = []
    getState().activeDots = []
    getState().enemies = []
    getState().bosses = []

    getState().isRotating = false
    getState().boardRotation = getRotationForWave(getState().currentWave)
    if (Math.abs(getState().boardRotation % 180) === 90) {
      getState().activeWidth = GAME_HEIGHT
      getState().activeHeight = GAME_WIDTH
    } else {
      getState().activeWidth = GAME_WIDTH
      getState().activeHeight = GAME_HEIGHT
    }
    getState().player.x = getState().activeWidth / 2 - 30
    getState().player.y = getState().activeHeight - 90
    getState().player.invulnerable = 0
    getState().engine.isTransitioningWave = false
    getState().engine.hasSpawnedBoss = false
    getState().waveAnnouncement = ''
    getState().hiddenEventWavesLeft = 0

    if (!isLoading) startGame()
  }

  const saveCurrentGame = () => {
    const newSave: SaveSlot = {
      id: getState().currentSaveId || Date.now().toString(),
      name: `Wave ${getState().currentWave} - ${getState().difficulty.toUpperCase()} [${getState().gameMode === 'campaign' ? 'CD' : 'VT'}]`,
      date: Date.now(),
      score: getState().score,
      lives: getState().lives,
      currentWave: getState().currentWave,
      weaponType: getState().weaponType,
      weaponLevel: getState().weaponLevel,
      difficulty: getState().difficulty,
      gameMode: getState().gameMode, // LƯU MODE
    }
    const idx = getState().saves.findIndex((s) => s.id === newSave.id)
    if (idx !== -1) getState().saves[idx] = newSave
    else {
      if (getState().saves.length >= 10) {
        getState().saves.sort((a, b) => a.date - b.date)
        getState().saves.shift()
      }
      getState().saves.push(newSave)
    }
    getState().currentSaveId = newSave.id
    localStorage.setItem('chicken_invaders_saves', JSON.stringify(getState().saves))
    getState().showNotification('✅ ĐÃ LƯU GAME THÀNH CÔNG!')
  }

  const surrenderGame = () => {
    getState().lives = 0
    getState().gameState = 'gameover'

    getState().leaderboard.push({
      score: getState().score,
      wave: getState().currentWave,
      difficulty: getState().difficulty,
      mode: getState().gameMode,
      date: Date.now(),
    })
    getState().leaderboard.sort((a, b) => b.score - a.score)
    getState().leaderboard = getState().leaderboard.slice(0, 100)

    localStorage.setItem('chicken_invaders_leaderboard', JSON.stringify(getState().leaderboard))

    if (getState().currentSaveId) {
      getState().saves = getState().saves.filter((s) => s.id !== getState().currentSaveId)
      localStorage.setItem('chicken_invaders_saves', JSON.stringify(getState().saves))
      getState().currentSaveId = null
    }

    if (getState().gameMode === 'campaign') {
      getState().showNotification('🏳️ BẠN ĐÃ ĐẦU HÀNG!')
    } else {
      getState().showNotification('🛑 ĐÃ KẾT THÚC LƯỢT CHƠI!')
    }
  }

  const loadGame = (save: SaveSlot) => {
    getState().currentSaveId = save.id
    getState().difficulty = save.difficulty
    getState().currentWave = save.currentWave
    getState().gameMode = save.gameMode || 'endless'

    initGame(true)
    getState().score = save.score
    getState().lives = save.lives
    getState().weaponType = save.weaponType
    getState().weaponLevel = save.weaponLevel

    sfx.init()
    getState().gameState = 'starting'
    getState().engine.isTransitioningWave = true
    getState().waveAnnouncement = `WAVE ${getState().currentWave}`
    getState().showNotification('✅ ĐÃ TẢI GAME THÀNH CÔNG!')

    setTimeout(() => {
      getState().gameState = 'playing'
      startWave(getState().currentWave)
      getState().waveAnnouncement = ''
      getState().engine.isTransitioningWave = false
      getState().engine.lastFireTime = Date.now()
    }, 2000)
  }

  const deleteSave = (id: string) => {
    getState().saves = getState().saves.filter((s) => s.id !== id)
    localStorage.setItem('chicken_invaders_saves', JSON.stringify(getState().saves))
    if (getState().currentSaveId === id) getState().currentSaveId = null
    getState().showNotification('🗑️ ĐÃ XOÁ BẢN LƯU VĨNH VIỄN!')
  }

  const exportSaves = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(getState().saves))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', 'chicken_invaders_saves.json')
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const importSaves = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (file.size > 100 * 1024) {
      getState().showNotification('❌ FILE QUÁ LỚN! TỐI ĐA 100KB.')
      target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedSaves = JSON.parse(content)

        if (Array.isArray(importedSaves)) {
          let merged = [...getState().saves]

          importedSaves.forEach((imported) => {
            if (
              imported &&
              typeof imported.id === 'string' &&
              typeof imported.name === 'string' &&
              typeof imported.date === 'number' &&
              typeof imported.score === 'number' &&
              typeof imported.lives === 'number' &&
              typeof imported.currentWave === 'number' &&
              typeof imported.weaponType === 'number' &&
              typeof imported.weaponLevel === 'number' &&
              ['easy', 'normal', 'hard', 'hardcore'].includes(imported.difficulty)
            ) {
              const safeName = imported.name
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .substring(0, 40)
              const safeSave: SaveSlot = {
                id: imported.id,
                name: safeName,
                date: imported.date,
                score: Math.max(0, imported.score),
                lives: Math.max(1, imported.lives),
                currentWave: Math.max(1, imported.currentWave),
                weaponType: Math.min(Math.max(0, imported.weaponType), WEAPON_TYPES.length - 1),
                weaponLevel: Math.max(1, imported.weaponLevel),
                difficulty: imported.difficulty as 'easy' | 'normal' | 'hard' | 'hardcore',
                gameMode: imported.gameMode === 'campaign' ? 'campaign' : 'endless', // Giữ mode
              }
              const idx = merged.findIndex((s) => s.id === safeSave.id)
              if (idx !== -1) merged[idx] = safeSave
              else merged.push(safeSave)
            }
          })

          merged.sort((a, b) => b.date - a.date)
          merged = merged.slice(0, 10)
          getState().saves = merged
          localStorage.setItem('chicken_invaders_saves', JSON.stringify(getState().saves))
          getState().showNotification('✅ ĐÃ NẠP DỮ LIỆU LƯU TRỮ THÀNH CÔNG!')
        } else {
          getState().showNotification('❌ FILE KHÔNG ĐÚNG ĐỊNH DẠNG!')
        }
      } catch {
        getState().showNotification('❌ LỖI ĐỌC FILE DỮ LIỆU!')
      }
      target.value = ''
    }
    reader.readAsText(file)
  }

  const fireBullets = () => {
    const isFiring =
      getKeys().space === true ||
      mobileKeys.current.fire ||
      pointerState.current.isDown ||
      mousePressed.current
    if (!isFiring) return
    sfx.init()

    const isTap = isFiring && !getState().engine.wasSpaceDown
    const wType = getState().weaponType
    if (wType === 6 || wType === 5) return

    let currentFireRate = FIRE_RATE
    if (wType === 0 || wType === 3) currentFireRate = isTap ? 80 : 350
    if (wType === 8) currentFireRate = 800
    if (wType === 9) currentFireRate = isTap ? 250 : 500

    // Reduce shooting speed when holding button to 60%
    if (isTap) {
      currentFireRate = 1
    } else {
      currentFireRate = Math.floor(currentFireRate / 0.6)
    }

    if (Date.now() - getState().engine.lastFireTime < currentFireRate) return
    sfx.shoot()

    const cx = getState().player.x + getState().player.width / 2
    const cy = getState().player.y
    const wConfig = WEAPON_TYPES[wType]
    if (!wConfig) return

    const { rays, damage } = getWeaponStats(wType, getState().weaponLevel)

    for (let i = 0; i < rays; i++) {
      const offsetIndex = i - (rays - 1) / 2
      let dx = 0,
        dy = -(wConfig.speed || 10),
        offsetX = 0,
        bulletWidth = wConfig.size || 10,
        bulletHeight = 20,
        bulletY = cy,
        rotation = 0

      switch (wConfig.type) {
        case 'yellow':
          dx = 0
          offsetX = 0
          bulletWidth = 10 + Math.min(getState().weaponLevel, 20) * 2
          bulletHeight = getState().activeHeight
          bulletY = cy - getState().activeHeight + 20
          break
        case 'blue':
          dx = 0
          offsetX = offsetIndex * 8
          bulletHeight = 35
          break
        case 'red':
          rotation = offsetIndex * 6
          dx = offsetIndex * 1.5
          offsetX = offsetIndex * 6
          bulletHeight = (wConfig.size || 10) * 2
          break
        case 'green':
          dx = 0
          offsetX = offsetIndex * 15
          bulletHeight = 35
          break
        case 'purple':
          dx = offsetIndex * 0.5
          offsetX = offsetIndex * 4
          bulletHeight = 30
          break
        case 'lightning':
          dx = offsetIndex * 0.5
          offsetX = offsetIndex * 25
          bulletHeight = 70
          break
        case 'lime':
          dx = (Math.random() - 0.5) * 1.5
          offsetX = offsetIndex * 15
          bulletHeight = 18
          break
        case 'orange':
          dx = 0
          offsetX = 0
          bulletWidth = 50 + Math.min(getState().weaponLevel, 20) * 5
          bulletHeight = bulletWidth
          bulletY = cy - bulletHeight / 2
          dy = -3
          break
        case 'gray':
          rotation = offsetIndex * 4 + (Math.random() - 0.5) * 10
          dx = offsetIndex * 1.5 + (Math.random() - 0.5) * 2
          dy = -(wConfig.speed || 15) + Math.random() * 4
          offsetX = offsetIndex * 8
          bulletHeight = 16
          bulletWidth = wConfig.size || 8
          break
      }
      getState().bullets.push({
        id: `b-${getState().engine.objCounter++}-${Math.random()}`,
        x: cx + offsetX - bulletWidth / 2,
        y: bulletY,
        width: bulletWidth,
        height: bulletHeight,
        dx,
        dy,
        color: wConfig.color || '',
        shape: wConfig.shape || '',
        damage,
        rotation,
        hitTargets: new Set(),
      })
      if (wConfig.type === 'yellow' || wConfig.type === 'orange') break
    }
    getState().engine.lastFireTime = Date.now()
  }

  const handleEnemyDeath = (enemy: Enemy, ptMult: number) => {
    const cx = enemy.x + enemy.width / 2
    const cy = enemy.y + enemy.height / 2
    if (enemy.isMeteor) vfx.spawnDebris(cx, cy, '#ea580c')
    else if (enemy.isStash) vfx.spawnExplosion(cx, cy, '#cbd5e1')
    else vfx.spawnFeathers(cx, cy, enemy.shirtColor || '#ef4444')

    sfx.explode()

    let dropRate = enemy.isMeteor ? 0.012 : 0.12
    if (getState().difficulty === 'normal') dropRate *= 0.4
    else if (getState().difficulty === 'hard' || getState().difficulty === 'hardcore') dropRate *= 0.2

    if (enemy.isStash)
      getState().powerUps.push({
        id: getState().engine.objCounter++,
        x: enemy.x + enemy.width / 2 - 18,
        y: enemy.y + enemy.height / 2 - 18,
        width: 36,
        height: 36,
        wType: -1,
      })
    else if (!enemy.isHazard) {
      if (Math.random() < dropRate)
        getState().powerUps.push({
          id: getState().engine.objCounter++,
          x: enemy.x + enemy.width / 2 - 18,
          y: enemy.y + enemy.height / 2 - 18,
          width: 36,
          height: 36,
          wType: Math.random() < 0.4 ? -1 : Math.floor(Math.random() * WEAPON_TYPES.length),
        })
    }

    const idx = getState().enemies.findIndex((e) => e.id === enemy.id)
    if (idx !== -1) getState().enemies.splice(idx, 1)

    addScore((enemy.isStash ? 100 : enemy.isMeteor ? 20 : 10) * ptMult)
  }

  return {
    togglePause,
    toggleMute,
    resumeGame,
    addScore,
    takeDamage,
    startWave,
    startGame,
    initGame,
    fireBullets,
    handleEnemyDeath,
    saveCurrentGame,
    loadGame,
    deleteSave,
    exportSaves,
    importSaves,
    surrenderGame,
  }
}

export type GameActions = ReturnType<typeof useGameActions>
