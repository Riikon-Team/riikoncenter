import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'

import { SHIP_SPEED, GAME_WIDTH, GAME_HEIGHT, WEAPON_TYPES } from '../utils/config'
import {
  checkCollision,
  getWeaponStats,
  arrangeFormation,
  getRotationForWave,
} from '../utils/utils'
import { sfx } from '../utils/audio'
import { vfx } from '../utils/vfx'

import type { useControls } from './useControls'
import type { GameActions } from './useGameActions'
import type { Enemy, Boss } from '../utils/types'

export function useGameLoop(controls: ReturnType<typeof import('./useControls').useControls>, actions: any) {
  const getState = useGameStore.getState;
  

  const { getKeys, mousePressed, mobileKeys, pointerState } = controls
  const { fireBullets, handleEnemyDeath, takeDamage, addScore, startWave } = actions

  let animationFrameId: number
  const EGG_SPEED = 2.0 // Giữ nguyên tốc độ mặc định trong file gốc

  const gameLoop = () => {
    if (getState().gameState !== 'playing' && getState().gameState !== 'starting') {
      useGameStore.setState({ tick: Date.now() });
    animationFrameId = requestAnimationFrame(gameLoop)
      return
    }

    if (getState().player.invulnerable > 0) getState().player.invulnerable--

    let vvx = 0,
      vvy = 0
    if (getKeys().a || getKeys().ArrowLeft || mobileKeys.current.left) vvx -= SHIP_SPEED
    if (getKeys().d || getKeys().ArrowRight || mobileKeys.current.right) vvx += SHIP_SPEED
    if (getKeys().w || getKeys().ArrowUp) vvy -= SHIP_SPEED
    if (getKeys().s || getKeys().ArrowDown) vvy += SHIP_SPEED

    const theta = (getState().boardRotation * Math.PI) / 180
    const local_vx = vvx * Math.cos(-theta) - vvy * Math.sin(-theta)
    const local_vy = vvx * Math.sin(-theta) + vvy * Math.cos(-theta)

    getState().player.x = Math.max(
      0,
      Math.min(getState().player.x + local_vx, getState().activeWidth - getState().player.width),
    )
    getState().player.y = Math.max(
      0,
      Math.min(getState().player.y + local_vy, getState().activeHeight - getState().player.height),
    )

    const isFiring =
      getKeys().space === true ||
      mobileKeys.current.fire ||
      pointerState.current.isDown ||
      mousePressed.current
    const ptMult = getState().hiddenEventWavesLeft > 0 ? 2 : 1

    if (isFiring && (getState().weaponType === 6 || getState().weaponType === 5)) {
      sfx.init()
      if (!getState().engine.wasSpaceDown) sfx.shoot()
      const wp = WEAPON_TYPES[getState().weaponType]
      if (wp) {
        const { rays, damage } = getWeaponStats(getState().weaponType, getState().weaponLevel)
        const currentAttached = getState().bullets.filter((b) => b.isAttached)
        if (
          currentAttached.length > 0 &&
          (currentAttached.length !== rays || currentAttached[0]?.shape !== wp.shape)
        ) {
          getState().bullets = getState().bullets.filter((b) => !b.isAttached)
        }

        for (let i = 0; i < rays; i++) {
          const offsetIndex = i - (rays - 1) / 2
          const bw =
            (wp.size || 10) + Math.min(getState().weaponLevel, 20) * (wp.type === 'pink' ? 2 : 1)
          const offsetX = offsetIndex * (wp.type === 'lightning' ? 30 : 0)
          const rotation = offsetIndex * (wp.type === 'lightning' ? 8 : 0)

          const beamX = getState().player.x + getState().player.width / 2 + offsetX - bw / 2
          let targetY = -100

          if (wp.type === 'lightning') {
            const hitBoxX = beamX - Math.abs(rotation) * 2
            const hitBoxW = bw + Math.abs(rotation) * 4
            const checkBlock = (target: Enemy | Boss) => {
              if (
                target.hp > 0 &&
                target.y + target.height < getState().player.y &&
                target.x + target.width > hitBoxX &&
                target.x < hitBoxX + hitBoxW
              ) {
                if (target.y + target.height / 2 > targetY) targetY = target.y + target.height / 2
              }
            }
            getState().enemies.forEach(checkBlock)
            if (getState().gamePhase === 'boss') getState().bosses.forEach(checkBlock)
          } else {
            targetY = getState().player.y - getState().activeHeight + 20
          }

          const beamHeight = getState().player.y - targetY + 20
          const beamY = targetY

          const existingBeam = getState().bullets.find((b) => b.isAttached && b.attachedId === i)
          if (!existingBeam) {
            getState().bullets.push({
              id: `b-${getState().engine.objCounter++}-${Math.random()}`,
              attachedId: i,
              x: beamX,
              y: beamY,
              width: bw,
              height: beamHeight,
              dx: 0,
              dy: 0,
              color: wp.color || '',
              shape: wp.shape || '',
              damage,
              rotation,
              hitTargets: new Set(),
              isAttached: true,
              lastTick: Date.now(),
            })
          } else {
            existingBeam.x = beamX
            existingBeam.y = beamY
            existingBeam.width = bw
            existingBeam.height = beamHeight
            existingBeam.rotation = rotation
            if (Date.now() - (existingBeam.lastTick ?? 0) > 100) {
              existingBeam.hitTargets.clear()
              existingBeam.lastTick = Date.now()
            }
          }
        }
      }
    } else {
      for (let i = getState().bullets.length - 1; i >= 0; i--) {
        const b = getState().bullets[i]
        if (b && b.isAttached) {
          if (b.shape === 'bolt') getState().bullets.splice(i, 1)
          else {
            b.isAttached = false
            b.dy = -(WEAPON_TYPES[6]?.speed || 40)
          }
        }
      }
    }

    fireBullets()
    getState().engine.wasSpaceDown = isFiring

    const now = Date.now()
    for (let i = getState().activeDots.length - 1; i >= 0; i--) {
      const dot = getState().activeDots[i]
      if (!dot) continue
      if (now > dot.endTime) {
        getState().activeDots.splice(i, 1)
        continue
      }
      if (now - dot.lastTick > 150) {
        let target: Enemy | Boss | undefined | null = getState().enemies.find(
          (e) => e.id === dot.targetId,
        )
        if (!target && getState().gamePhase === 'boss')
          target = getState().bosses.find((b) => b.id === dot.targetId)

        if (target && target.hp > 0) {
          target.hp -= dot.damagePerTick
          dot.lastTick = now
          if (target.hp <= 0 && !getState().bosses.some((b) => b.id === target?.id))
            handleEnemyDeath(target as Enemy, ptMult)
        } else {
          getState().activeDots.splice(i, 1)
        }
      }
    }

    for (let i = getState().bullets.length - 1; i >= 0; i--) {
      const b = getState().bullets[i]
      if (!b) continue
      b.y += b.dy
      b.x += b.dx
      if (
        b.y + b.height < -500 ||
        b.y > getState().activeHeight + 100 ||
        b.x < -100 ||
        b.x > getState().activeWidth + 100
      )
        getState().bullets.splice(i, 1)
    }

    for (let i = getState().powerUps.length - 1; i >= 0; i--) {
      const pu = getState().powerUps[i]
      if (!pu) continue
      pu.y += 2.5
      if (checkCollision(pu, getState().player)) {
        sfx.powerup()
        if (pu.wType === -1) getState().weaponLevel++
        else {
          if (getState().weaponType === pu.wType) getState().weaponLevel++
          else getState().weaponType = pu.wType
        }
        addScore(50)
        getState().powerUps.splice(i, 1)
      } else if (pu.y > getState().activeHeight) {
        getState().powerUps.splice(i, 1)
      }
    }

    for (let i = getState().enemyBullets.length - 1; i >= 0; i--) {
      const egg = getState().enemyBullets[i]
      if (!egg) continue
      egg.y += egg.dy !== undefined ? egg.dy : EGG_SPEED
      egg.x += egg.dx || 0
      if (checkCollision(egg, getState().player)) {
        getState().enemyBullets.splice(i, 1)
        takeDamage()
      } else if (
        egg.y > getState().activeHeight ||
        egg.y < -100 ||
        egg.x < -100 ||
        egg.x > getState().activeWidth + 100
      ) {
        getState().enemyBullets.splice(i, 1)
      }
    }

    const isHorizontal = Math.abs(getState().boardRotation % 180) === 90

    if (getState().gamePhase === 'minions' || getState().gamePhase === 'meteors') {
      if (getState().engine.pendingSpawns.length > 0 && getState().gameState !== 'starting') {
        if (getState().gamePhase === 'minions') {
          const chunk = getState().engine.pendingSpawns.splice(0, 10)
          getState().enemies.push(...chunk)
        } else {
          if (getState().engine.hazardSpawnCooldown <= 0) {
            const isMeteorZ = getState().currentWave % 100 >= 71 && getState().currentWave % 100 <= 79
            const spawns = isMeteorZ && Math.random() < 0.4 ? 2 : 1
            for (let s = 0; s < spawns; s++) {
              const nextHazard = getState().engine.pendingSpawns.pop()
              if (nextHazard) getState().enemies.push(nextHazard)
            }
            if (isMeteorZ) {
              getState().engine.hazardSpawnCooldown = 15 + Math.random() * 10
            } else if (getState().currentWave % 10 === 8) {
              getState().engine.hazardSpawnCooldown = 35 + Math.random() * 25
            } else {
              getState().engine.hazardSpawnCooldown = 25 + Math.random() * 20
            }
          } else {
            getState().engine.hazardSpawnCooldown--
          }
        }
      }

      if (getState().gamePhase === 'minions') {
        const isDynamicWave = getState().currentWave % 10 === 6
        if (isDynamicWave) {
          getState().engine.formationCenter.x += getState().engine.formationCenter.dx * getState().engine.waveEnemySpeed
          if (getState().engine.formationCenter.x < 150 || getState().engine.formationCenter.x > getState().activeWidth - 150)
            getState().engine.formationCenter.dx *= -1
          getState().engine.formationTimer--
          if (getState().engine.formationTimer <= 0) {
            getState().engine.formationTimer = 250
            getState().engine.formationType = (getState().engine.formationType + 1) % 3
            arrangeFormation(getState().enemies, getState().engine.formationType)
            arrangeFormation(getState().engine.pendingSpawns, getState().engine.formationType)
          }

          getState().enemies.forEach((enemy) => {
            if (
              !enemy.isHazard &&
              enemy.targetOffsetX !== undefined &&
              enemy.targetOffsetY !== undefined
            ) {
              const tx = getState().engine.formationCenter.x + enemy.targetOffsetX
              const ty = getState().engine.formationCenter.y + enemy.targetOffsetY
              enemy.x += (tx - enemy.x) * 0.05
              enemy.y += (ty - enemy.y) * 0.05
            } else if (enemy.isHazard) {
              enemy.y += enemy.dy || 5
              if (enemy.dx) enemy.x += enemy.dx
            }
          })

          if (
            Math.random() < getState().engine.waveEggFireRate &&
            getState().enemies.length > 0 &&
            getState().gameState === 'playing'
          ) {
            const shootingEnemies = getState().enemies.filter(
              (e) => !e.isStash && !e.isHazard && e.y >= 0,
            )
            if (shootingEnemies.length > 0) {
              const randomEnemy =
                shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)]
              if (randomEnemy)
                getState().enemyBullets.push({
                  id: getState().engine.objCounter++,
                  x: randomEnemy.x + randomEnemy.width / 2 - 8,
                  y: randomEnemy.y + randomEnemy.height,
                  width: 20,
                  height: 25,
                  isBossEgg: false,
                })
            }
          }
        } else {
          let isSpawning = false
          getState().enemies.forEach((enemy) => {
            if (enemy.isHazard) {
              enemy.y += enemy.dy || 5
              if (enemy.dx) enemy.x += enemy.dx
            } else {
              if (enemy.targetY !== undefined && enemy.y < enemy.targetY) {
                enemy.y += 4
                isSpawning = true
                if (enemy.y > enemy.targetY) enemy.y = enemy.targetY
              }
            }
          })
          if (!isSpawning) {
            let hitWall = false
            getState().enemies.forEach((enemy) => {
              if (!enemy.isHazard) {
                let speed = getState().engine.waveEnemySpeed
                if (isHorizontal && getState().currentWave % 100 === 23) speed *= 1.5
                enemy.x += speed * getState().engine.enemyDirection
                if (enemy.x <= 0 || enemy.x + enemy.width >= getState().activeWidth) hitWall = true
              }
            })

            if (hitWall) {
              getState().engine.enemyDirection *= -1
            }

            if (isHorizontal) {
              getState().enemies.forEach((enemy) => {
                if (!enemy.isHazard) {
                  enemy.y += 0.2
                  if (enemy.targetY !== undefined) enemy.targetY += 0.2
                }
              })
            } else if (hitWall) {
              getState().enemies.forEach((enemy) => {
                if (!enemy.isHazard) {
                  enemy.y += 10
                  if (enemy.targetY !== undefined) enemy.targetY += 10
                }
              })
            }

            if (
              Math.random() < getState().engine.waveEggFireRate &&
              getState().enemies.length > 0 &&
              getState().gameState === 'playing'
            ) {
              const shootingEnemies = getState().enemies.filter(
                (e) => !e.isStash && !e.isHazard && e.y >= 0,
              )
              if (shootingEnemies.length > 0) {
                const randomEnemy =
                  shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)]
                if (randomEnemy)
                  getState().enemyBullets.push({
                    id: getState().engine.objCounter++,
                    x: randomEnemy.x + randomEnemy.width / 2 - 8,
                    y: randomEnemy.y + randomEnemy.height,
                    width: 20,
                    height: 25,
                    isBossEgg: false,
                  })
              }
            }
          }
        }

        if (
          getState().hiddenEventWavesLeft > 0 &&
          Math.random() < 0.02 &&
          getState().gameState === 'playing'
        ) {
          const size = 30 + Math.random() * 30
          getState().enemies.push({
            id: `hazard-${getState().engine.objCounter++}`,
            x: Math.random() * getState().activeWidth,
            y: -100,
            width: size,
            height: size,
            hp: 20 + getState().currentWave * 2,
            maxHp: 20 + getState().currentWave * 2,
            isMeteor: true,
            isHazard: true,
            dy: getState().engine.waveEnemySpeed * 2,
            dx: (Math.random() - 0.5) * 2,
          })
        }
      } else {
        getState().enemies.forEach((meteor) => {
          meteor.y += meteor.dy || getState().engine.waveEnemySpeed * 1.5
          if (meteor.dx) meteor.x += meteor.dx
        })
        if (
          Math.random() < getState().engine.waveEggFireRate * 1.5 &&
          getState().enemies.length > 0 &&
          getState().gameState === 'playing'
        ) {
          const fallingChickens = getState().enemies.filter(
            (e) => e.isFallingChicken && e.y >= 0 && e.y < getState().activeHeight - 100,
          )
          if (fallingChickens.length > 0) {
            const randomChicken =
              fallingChickens[Math.floor(Math.random() * fallingChickens.length)]
            if (randomChicken) {
              getState().enemyBullets.push({
                id: `falling-egg-${getState().engine.objCounter++}`,
                x: randomChicken.x + randomChicken.width / 2 - 8,
                y: randomChicken.y + randomChicken.height,
                width: 20,
                height: 25,
                isBossEgg: false,
                dy: EGG_SPEED,
              })
            }
          }
        }
      }

      for (let bIndex = getState().bullets.length - 1; bIndex >= 0; bIndex--) {
        let bulletHit = false
        const bullet = getState().bullets[bIndex]
        if (!bullet) continue
        for (let eIndex = getState().enemies.length - 1; eIndex >= 0; eIndex--) {
          const enemy = getState().enemies[eIndex]
          if (!enemy) continue
          if (checkCollision(bullet, enemy)) {
            if (bullet.hitTargets.has(enemy.id)) continue
            enemy.hp -= bullet.damage
            sfx.hit()

            if (bullet.shape === 'blob') {
              const existingDot = getState().activeDots.find((d) => d.targetId === enemy.id)
              const dotDamage = bullet.damage * 0.4
              if (existingDot) {
                existingDot.endTime = Date.now() + 2000
                existingDot.damagePerTick = dotDamage
              } else {
                getState().activeDots.push({
                  targetId: enemy.id,
                  damagePerTick: dotDamage,
                  endTime: Date.now() + 2000,
                  lastTick: Date.now(),
                })
              }
            }

            if (['beam', 'wavy-beam', 'shard', 'bolt'].includes(bullet.shape)) {
              bullet.hitTargets.add(enemy.id)
            } else {
              bulletHit = true
            }

            if (enemy.hp <= 0) {
              handleEnemyDeath(enemy, ptMult)
            }
            if (bulletHit) break
          }
        }
        if (bulletHit) getState().bullets.splice(bIndex, 1)
      }

      for (let i = getState().enemies.length - 1; i >= 0; i--) {
        const enemy = getState().enemies[i]
        if (!enemy) continue
        if (checkCollision(enemy, getState().player)) {
          takeDamage()
          getState().enemies.splice(i, 1)
        } else if (
          enemy.y > getState().activeHeight ||
          enemy.x < -200 ||
          enemy.x > getState().activeWidth + 200
        ) {
          getState().enemies.splice(i, 1)
        }
      }

      const activeEnemies = getState().enemies.filter((e) => !e.isHazard)

      if (
        activeEnemies.length === 0 &&
        getState().engine.pendingSpawns.length === 0 &&
        !getState().engine.isTransitioningWave
      ) {
        getState().engine.isTransitioningWave = true
        addScore(1000 * ptMult)
        const nextW = getState().currentWave + 1
        const nextRot = getRotationForWave(nextW)
        const willRotate = getState().boardRotation !== nextRot
        getState().waveAnnouncement = `WAVE ${nextW}${getState().hiddenEventWavesLeft > 0 ? '\n☄️ x2 ĐIỂM ☄️' : ''}`

        setTimeout(() => {
          if (willRotate) {
            getState().bullets = []
            getState().enemyBullets = []
            getState().powerUps = []
            getState().activeDots = []
            getState().enemies = []
            getState().isRotating = true
            getState().boardRotation = nextRot
            if (Math.abs(nextRot % 180) === 90) {
              getState().activeWidth = GAME_HEIGHT
              getState().activeHeight = GAME_WIDTH
            } else {
              getState().activeWidth = GAME_WIDTH
              getState().activeHeight = GAME_HEIGHT
            }
            getState().player.x = getState().activeWidth / 2 - getState().player.width / 2
            getState().player.y = getState().activeHeight - 90

            setTimeout(() => {
              getState().isRotating = false
              setTimeout(() => {
                getState().currentWave++
                startWave(getState().currentWave)
                getState().waveAnnouncement = ''
                getState().engine.isTransitioningWave = false
              }, 1000)
            }, 1000)
          } else {
            getState().currentWave++
            startWave(getState().currentWave)
            getState().waveAnnouncement = ''
            getState().engine.isTransitioningWave = false
          }
        }, 1000)
      }
    } else if (getState().gamePhase === 'boss') {
      for (let i = getState().bosses.length - 1; i >= 0; i--) {
        const b = getState().bosses[i]
        if (!b) continue

        if (b.hp <= 0) {
          if (!b.deathTimer) {
            b.deathTimer = 1
            vfx.spawnExplosion(b.x + b.width / 2, b.y + b.height / 2, '#FF6B4A', true)
            
            for (let j = 0; j < 3; j++) {
              getState().powerUps.push({
                id: getState().engine.objCounter++,
                x: b.x + b.width / 2 - 18 + (Math.random() - 0.5) * 80,
                y: b.y + b.height / 2 - 18 + (Math.random() - 0.5) * 80,
                width: 36,
                height: 36,
                wType: Math.floor(Math.random() * WEAPON_TYPES.length),
              })
            }
          } else {
            b.deathTimer++
          }
          if (b.deathTimer > 120) {
            getState().bosses.splice(i, 1)
          }
          continue
        }

        if (checkCollision(b, getState().player)) {
          takeDamage()
        }

        if (b.targetY !== undefined && b.y < b.targetY) {
          b.y += 4
        } else if (getState().gameState === 'playing') {
          if (b.bossType === 1) {
            b.x += (getState().engine.waveEnemySpeed + 2) * b.direction
            if (b.x <= 0 || b.x + b.width >= getState().activeWidth) b.direction *= -1
            b.y = b.targetY! + Math.sin(Date.now() / 300) * 30
            if (Math.random() < getState().engine.waveEggFireRate * 1.5) {
              if (Math.random() < 0.3) {
                ;[-4, 0, 4].forEach((dx) => {
                  getState().enemyBullets.push({
                    id: `boss-egg-${getState().engine.objCounter++}`,
                    x: b.x + b.width / 2 - 12,
                    y: b.y + b.height,
                    width: 30,
                    height: 35,
                    isBossEgg: true,
                    dx,
                    dy: EGG_SPEED,
                  })
                })
              } else {
                getState().enemyBullets.push({
                  id: `boss-egg-${getState().engine.objCounter++}`,
                  x: b.x + b.width / 2 - 12,
                  y: b.y + b.height,
                  width: 30,
                  height: 35,
                  isBossEgg: true,
                })
              }
            }
          } else if (b.bossType === 2) {
            b.x += getState().engine.waveEnemySpeed * b.direction
            if (b.x <= 0 || b.x + b.width >= getState().activeWidth) b.direction *= -1
            if (b.laserTimer !== undefined && b.laserTimer > 0) {
              b.laserTimer--
            } else {
              if (b.state === 'idle') {
                b.state = 'laser_warning'
                b.laserTimer = 50
                if (Math.random() < 0.35) {
                  const cx = b.x + b.width / 2 - 40
                  b.laserXs = [cx - 150, cx, cx + 150]
                  b.laserX = undefined
                } else {
                  b.laserX = b.x + b.width / 2 - 40
                  b.laserXs = undefined
                }
              } else if (b.state === 'laser_warning') {
                b.state = 'laser_firing'
                b.laserTimer = 15
              } else {
                b.state = 'idle'
                b.laserTimer = 100
                b.laserXs = undefined
              }
            }
            if (b.state === 'laser_firing') {
              const lxs = b.laserXs || (b.laserX !== undefined ? [b.laserX] : [])
              lxs.forEach((lx) => {
                const laserHitbox = {
                  x: lx,
                  y: b.y + b.height,
                  width: 80,
                  height: getState().activeHeight,
                }
                if (checkCollision(getState().player, laserHitbox)) takeDamage()
              })
            }
          } else if (b.bossType === 3) {
            if (b.stateTimer !== undefined && b.stateTimer > 0) {
              b.stateTimer--
            } else {
              if (b.state === 'idle' || b.state === 'dash') {
                const r = Math.random()
                if (r < 0.3) {
                  b.state = 'dash'
                  b.stateTimer = 80
                  b.direction *= -1
                } else if (r < 0.6) {
                  b.state = 'laser_warning'
                  b.stateTimer = 60
                  // FIX LỖI 1 GÓC MÀN BẰNG CÁCH CHỐT TOẠ ĐỘ TUYỆT ĐỐI NGAY LÚC GỒNG
                  b.laserXs = [
                    b.x + b.width * 0.15 - 40,
                    b.x + b.width * 0.5 - 40,
                    b.x + b.width * 0.85 - 40,
                  ]
                  b.laserX = undefined
                } else {
                  b.state = 'laser_warning'
                  b.stateTimer = 60
                  b.laserX = b.x + b.width * 0.5 - 40 // Chốt toạ độ tia giữa
                  b.laserXs = undefined
                }
              } else if (b.state === 'laser_warning') {
                b.state = 'laser_firing'
                b.stateTimer = 40 // Thời gian tia laser xả ra
              } else if (b.state === 'laser_firing') {
                b.state = 'idle'
                b.stateTimer = 60 // Nghỉ xả hơi
                b.laserX = undefined
                b.laserXs = undefined
              }
            }

            // GÀ VẪN DI CHUYỂN BÌNH THƯỜNG LIÊN TỤC
            let bSpeed = getState().engine.waveEnemySpeed * 0.8
            if (b.state === 'dash') bSpeed = getState().engine.waveEnemySpeed + 3

            b.x += bSpeed * b.direction
            if (b.x <= 0 || b.x + b.width >= getState().activeWidth) {
              b.direction *= -1
              b.x = Math.max(0, Math.min(b.x, getState().activeWidth - b.width))
            }

            // Xử lý sát thương Laser dựa trên toạ độ đã chốt (Laser đứng im, gà đi mất)
            if (b.state === 'laser_firing') {
              const lxs = b.laserXs || (b.laserX !== undefined ? [b.laserX] : [])
              lxs.forEach((absoluteX) => {
                const laserHitbox = {
                  x: absoluteX, // Đã trừ 40px lúc chốt để căn giữa tia 80px
                  y: b.y + b.height,
                  width: 80,
                  height: getState().activeHeight,
                }
                if (checkCollision(getState().player, laserHitbox)) takeDamage()
              })
            }
          } else if (b.bossType === 4) {
            b.x += (getState().engine.waveEnemySpeed + 1) * b.direction
            if (b.x <= 0 || b.x + b.width >= getState().activeWidth) b.direction *= -1
            if (Math.random() < getState().engine.waveEggFireRate * 1.5) {
              if (Math.random() < 0.3) {
                ;[-4, 0, 4].forEach((dx) => {
                  getState().enemyBullets.push({
                    id: `boss-meteor-${getState().engine.objCounter++}`,
                    x: b.x + b.width / 2 - 20,
                    y: b.y + b.height - 10,
                    width: 40,
                    height: 40,
                    isBossEgg: true,
                    isMeteor: true,
                    dy: EGG_SPEED + 1,
                    dx: dx + (Math.random() - 0.5) * 2,
                  })
                })
              } else {
                getState().enemyBullets.push({
                  id: `boss-meteor-${getState().engine.objCounter++}`,
                  x: b.x + b.width / 2 - 20,
                  y: b.y + b.height - 10,
                  width: 40,
                  height: 40,
                  isBossEgg: true,
                  isMeteor: true,
                  dy: EGG_SPEED + 1,
                  dx: (Math.random() - 0.5) * 2,
                })
              }
            }
          } else if (b.bossType === 5) {
            b.x += (getState().engine.waveEnemySpeed + 1) * b.direction
            if (b.x <= 0 || b.x + b.width >= getState().activeWidth) b.direction *= -1

            if (Math.random() < getState().engine.waveEggFireRate * 1.0 && b.state !== 'circle_burst') {
              getState().enemyBullets.push({
                id: `boss-egg-${getState().engine.objCounter++}`,
                x: b.x + b.width / 2 - 12,
                y: b.y + b.height - 20,
                width: 30,
                height: 35,
                isBossEgg: true,
              })
            }

            if (b.laserTimer !== undefined && b.laserTimer > 0) {
              b.laserTimer--
            } else {
              if (b.state === 'idle') {
                if (Math.random() < 0.5) {
                  b.state = 'laser_warning'
                  b.laserTimer = 60
                  b.laserX = b.x + b.width / 2 - 40
                } else {
                  b.state = 'circle_burst'
                  b.laserTimer = 40
                }
              } else if (b.state === 'laser_warning') {
                b.state = 'laser_firing'
                b.laserTimer = 15
              } else if (b.state === 'circle_burst') {
                const cx = b.x + b.width / 2 - 15
                const cy = b.y + b.height - 20
                for (let i = 0; i < 12; i++) {
                  const angle = (Math.PI * 2 * i) / 12
                  getState().enemyBullets.push({
                    id: `boss-egg-${getState().engine.objCounter++}`,
                    x: cx,
                    y: cy,
                    width: 30,
                    height: 35,
                    isBossEgg: true,
                    dx: Math.cos(angle) * 5,
                    dy: Math.sin(angle) * 5,
                  })
                }
                b.state = 'idle'
                b.laserTimer = 180
              } else {
                b.state = 'idle'
                b.laserTimer = 200
              }
            }
            if (b.state === 'laser_firing' && b.laserX !== undefined) {
              const laserHitbox = {
                x: b.laserX,
                y: b.y + b.height,
                width: 80,
                height: getState().activeHeight,
              }
              if (checkCollision(getState().player, laserHitbox)) takeDamage()
            }
          } else if (b.bossType === 6) {
            b.x += (getState().engine.waveEnemySpeed + 1) * b.direction
            if (b.x <= 0 || b.x + b.width >= getState().activeWidth) b.direction *= -1

            if (b.stateTimer !== undefined && b.stateTimer > 0) {
              b.stateTimer--
            } else {
              if (b.state === 'idle') {
                const r = Math.random()
                if (r < 0.33) {
                  b.state = 'burst'
                  b.stateTimer = 60 // Bắn 3 tia
                } else if (r < 0.66) {
                  b.state = 'circle_burst'
                  b.stateTimer = 40 // Bắn vòng tròn
                } else {
                  b.state = 'idle'
                  b.stateTimer = 100
                }
              } else if (b.state === 'circle_burst') {
                const cx = b.x + b.width / 2 - 15
                const cy = b.y + b.height - 20
                for (let i = 0; i < 12; i++) {
                  const angle = (Math.PI * 2 * i) / 12
                  getState().enemyBullets.push({
                    id: `boss-egg-${getState().engine.objCounter++}`,
                    x: cx,
                    y: cy,
                    width: 30,
                    height: 35,
                    isBossEgg: true,
                    dx: Math.cos(angle) * 5,
                    dy: Math.sin(angle) * 5,
                  })
                }
                b.state = 'idle'
                b.stateTimer = 120
              } else {
                b.state = 'idle'
                b.stateTimer = 100
              }
            }

            // Kỹ năng bắn 3 tia
            if (b.state === 'burst' && b.stateTimer % 20 === 0) {
              ;[-4, 0, 4].forEach((dx) => {
                getState().enemyBullets.push({
                  id: `boss-egg-${getState().engine.objCounter++}`,
                  x: b.x + b.width / 2 - 12,
                  y: b.y + b.height - 20,
                  width: 30,
                  height: 35,
                  isBossEgg: true,
                  dx,
                  dy: EGG_SPEED + 1,
                })
              })
            }

            // Bắn trứng bth khi đang bay
            if (b.state === 'idle' && Math.random() < getState().engine.waveEggFireRate * 2.0) {
              getState().enemyBullets.push({
                id: `boss-egg-${getState().engine.objCounter++}`,
                x: b.x + b.width / 2 - 12,
                y: b.y + b.height - 20,
                width: 30,
                height: 35,
                isBossEgg: true,
                dy: EGG_SPEED + 1,
              })
            }
          } else if (b.bossType === 99) {
            b.x += getState().engine.waveEnemySpeed * 0.8 * b.direction
            if (b.x <= 0 || b.x + b.width >= getState().activeWidth) b.direction *= -1

            if (b.targetY !== undefined) {
              b.y = b.targetY + Math.sin(Date.now() / 400) * 10
            }

            if (b.stateTimer !== undefined && b.stateTimer > 0) {
              b.stateTimer--
            } else {
              if (b.state === 'idle') {
                const r = Math.random()
                if (r < 0.2) {
                  b.state = 'laser_warning'
                  b.stateTimer = 60
                  b.laserXs = [b.width * 0.2, b.width * 0.5, b.width * 0.8]
                } else if (r < 0.4) {
                  b.state = 'circle_burst'
                  b.stateTimer = 50
                } else if (r < 0.6) {
                  b.state = 'meteor_shower'
                  b.stateTimer = 120
                } else if (r < 0.8) {
                  b.state = 'chicken_rain'
                  b.stateTimer = 120
                } else {
                  b.state = 'burst'
                  b.stateTimer = 60
                }
              } else if (b.state === 'laser_warning') {
                b.state = 'laser_firing'
                b.stateTimer = 40
              } else if (b.state === 'circle_burst') {
                const cy = b.y + b.height - 20
                ;[0.2, 0.5, 0.8].forEach((pos) => {
                  const cx = b.x + b.width * pos
                  for (let j = 0; j < 16; j++) {
                    const angle = (Math.PI * 2 * j) / 16
                    getState().enemyBullets.push({
                      id: `b99-${getState().engine.objCounter++}`,
                      x: cx,
                      y: cy,
                      width: 30,
                      height: 35,
                      isBossEgg: true,
                      dx: Math.cos(angle) * 7,
                      dy: Math.sin(angle) * 7,
                    })
                  }
                })
                b.state = 'idle'
                b.stateTimer = 80
              } else if (['meteor_shower', 'chicken_rain', 'burst'].includes(b.state as string)) {
                b.state = 'idle'
                b.stateTimer = 80
              } else {
                b.state = 'idle'
                b.stateTimer = 80
              }
            }
            if (b.state === 'meteor_shower' && b.stateTimer % 10 === 0) {
              getState().enemyBullets.push({
                id: `boss-meteor-${getState().engine.objCounter++}`,
                x: b.x + Math.random() * b.width,
                y: b.y + b.height - 20,
                width: 60,
                height: 60,
                isBossEgg: true,
                isMeteor: true,
                dy: EGG_SPEED + 4,
                dx: (Math.random() - 0.5) * 5,
              })
            }
            if (b.state === 'chicken_rain' && b.stateTimer % 15 === 0) {
              getState().engine.pendingSpawns.push({
                id: `boss-chicken-${getState().engine.objCounter++}`,
                x: b.x + Math.random() * b.width,
                y: b.y + b.height,
                width: 45,
                height: 45,
                hp: 150,
                maxHp: 150,
                isFallingChicken: true,
                shirtColor: '#ef4444',
                dx: (Math.random() - 0.5) * 3,
                dy: EGG_SPEED + 2,
              })
            }
            if (b.state === 'burst' && b.stateTimer % 20 === 0) {
              ;[0.2, 0.5, 0.8].forEach((pos) => {
                const cx = b.x + b.width * pos - 15
                ;[-4, 0, 4].forEach((dx) => {
                  getState().enemyBullets.push({
                    id: `boss-egg-${getState().engine.objCounter++}`,
                    x: cx,
                    y: b.y + b.height - 20,
                    width: 30,
                    height: 35,
                    isBossEgg: true,
                    dx,
                    dy: EGG_SPEED + 2,
                  })
                })
              })
            }
            if (b.state === 'laser_firing' && b.laserXs !== undefined) {
              b.laserXs.forEach((lxPos) => {
                const lx = b.x + lxPos
                const laserHitbox = {
                  x: lx - 50,
                  y: b.y + b.height,
                  width: 100,
                  height: getState().activeHeight,
                }
                if (checkCollision(getState().player, laserHitbox)) takeDamage()
              })
            }
            if (b.state === 'idle' && Math.random() < getState().engine.waveEggFireRate * 4.0) {
              getState().enemyBullets.push({
                id: `boss-egg-${getState().engine.objCounter++}`,
                x: b.x + Math.random() * b.width,
                y: b.y + b.height - 20,
                width: 30,
                height: 35,
                isBossEgg: true,
                dy: EGG_SPEED + 1,
              })
            }
          } else {
            // Fallback cho bất kỳ boss nào chưa được định nghĩa
            b.x += (getState().engine.waveEnemySpeed + 1) * b.direction
            if (b.x <= 0 || b.x + b.width >= getState().activeWidth) b.direction *= -1
            if (Math.random() < getState().engine.waveEggFireRate * 1.0) {
              getState().enemyBullets.push({
                id: `boss-egg-${getState().engine.objCounter++}`,
                x: b.x + b.width / 2 - 12,
                y: b.y + b.height - 20,
                width: 30,
                height: 35,
                isBossEgg: true,
              })
            }
          }
        }
      }

      for (let bIndex = getState().bullets.length - 1; bIndex >= 0; bIndex--) {
        const bullet = getState().bullets[bIndex]
        if (!bullet) continue
        for (let i = 0; i < getState().bosses.length; i++) {
          const b = getState().bosses[i]
          if ((b && b.hp <= 0) || !b) continue
          if (checkCollision(bullet, b)) {
            if (bullet.hitTargets.has(b.id)) continue
            b.hp -= bullet.damage
            sfx.hit()

            if (bullet.shape === 'blob') {
              const existingDot = getState().activeDots.find((d) => d.targetId === b.id)
              const dotDamage = bullet.damage * 0.4
              if (existingDot) {
                existingDot.endTime = Date.now() + 2000
                existingDot.damagePerTick = dotDamage
              } else {
                getState().activeDots.push({
                  targetId: b.id,
                  damagePerTick: dotDamage,
                  endTime: Date.now() + 2000,
                  lastTick: Date.now(),
                })
              }
            }

            if (['beam', 'wavy-beam', 'shard', 'bolt'].includes(bullet.shape)) {
              bullet.hitTargets.add(b.id)
            } else {
              getState().bullets.splice(bIndex, 1)
              break
            }
          }
        }
      }

      const allBossesDead =
        getState().gamePhase === 'boss' &&
        getState().engine.hasSpawnedBoss &&
        getState().bosses.length === 0 &&
        !getState().engine.isTransitioningWave

      if (allBossesDead) {
        sfx.explode()
        getState().engine.isTransitioningWave = true
        addScore(1000 * ptMult)

        // KIỂM TRA ĐIỀU KIỆN VICTORY MÀN 120
        if (getState().gameMode && getState().gameMode === 'campaign' && getState().currentWave === 120) {
          getState().waveAnnouncement = 'NHIỆM VỤ HOÀN THÀNH!'

          if (getState().currentSaveId) {
            getState().saves = getState().saves.filter((s) => s.id !== getState().currentSaveId)
            localStorage.setItem('chicken_invaders_saves', JSON.stringify(getState().saves))
            getState().currentSaveId = null
          }

          setTimeout(() => {
            getState().gameState = 'victory'
            getState().engine.isTransitioningWave = false
            getState().waveAnnouncement = ''
          }, 1500)
          return
        }

        const nextW = getState().currentWave + 1
        const nextRot = getRotationForWave(nextW)
        const willRotate = getState().boardRotation !== nextRot
        getState().waveAnnouncement = `WAVE ${nextW}${getState().hiddenEventWavesLeft > 0 ? '\n☄️ x2 ĐIỂM ☄️' : ''}`

        setTimeout(() => {
          if (willRotate) {
            getState().bullets = []
            getState().enemyBullets = []
            getState().powerUps = []
            getState().activeDots = []
            getState().enemies = []
            getState().isRotating = true
            getState().boardRotation = nextRot
            if (Math.abs(nextRot % 180) === 90) {
              getState().activeWidth = GAME_HEIGHT
              getState().activeHeight = GAME_WIDTH
            } else {
              getState().activeWidth = GAME_WIDTH
              getState().activeHeight = GAME_HEIGHT
            }
            getState().player.x = getState().activeWidth / 2 - getState().player.width / 2
            getState().player.y = getState().activeHeight - 90

            setTimeout(() => {
              getState().isRotating = false
              setTimeout(() => {
                getState().currentWave++
                startWave(getState().currentWave)
                getState().waveAnnouncement = ''
                getState().engine.isTransitioningWave = false
              }, 1000)
            }, 1000)
          } else {
            getState().currentWave++
            startWave(getState().currentWave)
            getState().waveAnnouncement = ''
            getState().engine.isTransitioningWave = false
          }
        }, 1000)
      }
    }
    useGameStore.setState({ tick: Date.now() });
    animationFrameId = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    gameLoop()
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])
}
