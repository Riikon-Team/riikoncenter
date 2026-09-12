import React from 'react'
import { WEAPON_TYPES } from '../utils/config'
import { SPRITES } from '../utils/sprites'
import { useGameStore } from '../store/useGameStore'

export default function GameEntities() {
  const {
    boardRotation,
    activeWidth,
    activeHeight,
    isRotating,
    powerUps,
    bullets,
    enemyBullets,
    enemies,
    bosses,
    player,
    gamePhase,
    currentWave,
    activeDots,
  } = useGameStore()

  const tick = useGameStore((s) => s.tick)
  return (
    <>
      <div
      className={`absolute top-1/2 left-1/2 pointer-events-none ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
      style={{
        width: `${activeWidth}px`,
        height: `${activeHeight}px`,
        transform: `translate(-50%, -50%) rotate(${boardRotation}deg)`,
      }}
    >
      {powerUps.map((pu) => (
        <div
          key={'pu' + pu.id}
          className="absolute top-0 left-0 flex items-center justify-center will-change-transform z-20 pointer-events-none"
          style={{
            transform: `translate3d(${pu.x}px, ${pu.y}px, 0)`,
            width: `${pu.width}px`,
            height: `${pu.height}px`,
          }}
        >
          <div
            className={`w-full h-full flex items-center justify-center ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
            style={{ transform: `rotate(${-boardRotation}deg)` }}
          >
            {pu.wType === -1 ? (
              <div
                className="w-10 h-10 animate-pulse drop-shadow-md"
                dangerouslySetInnerHTML={{ __html: SPRITES.stash }}
              ></div>
            ) : (
              <div
                className={`relative flex items-center justify-center w-10 h-10 animate-bounce ${WEAPON_TYPES[pu.wType]?.color || ''}`}
              >
                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: SPRITES.giftBox }}></div>
                <div
                  className="absolute inset-0 m-auto w-1/3 h-1/3 text-white drop-shadow-sm"
                  dangerouslySetInnerHTML={{ __html: WEAPON_TYPES[pu.wType]?.icon || '' }}
                ></div>
              </div>
            )}
          </div>
        </div>
      ))}

      {bullets.map((bullet) => (
        <div
          key={'b' + bullet.id}
          className={`absolute top-0 left-0 opacity-90 will-change-transform pointer-events-none ${
            bullet.shape === 'beam' ? 'bullet-ion-laser z-0' : ''
          } ${bullet.shape === 'wavy-beam' ? 'bullet-wavy z-0' : ''} ${
            bullet.shape === 'plasma-fan' ? 'bg-gradient-to-t from-transparent via-accent-coral to-accent-coral rounded-t-full shadow-[0_-5px_10px_#FF6B4A] z-10' : ''
          } ${bullet.shape === 'dash' ? 'bg-accent-sky rounded-sm shadow-[0_0_8px_#38BDF8] z-10' : ''} ${
            bullet.shape === 'sphere' ? 'bg-red-500 rounded-full z-10' : ''
          } ${bullet.shape === 'wave' ? 'bg-gradient-to-b from-green-400 to-transparent rounded-t-full z-10' : ''} ${
            bullet.shape === 'bolt' ? 'bullet-bolt z-10' : ''
          } ${bullet.shape === 'blob' ? 'bg-lime-400 rounded-full shadow-[0_0_10px_#a3e635] z-10' : ''} ${
            bullet.shape === 'shard' ? 'bullet-shard z-10' : ''
          } ${bullet.shape === 'needle' ? 'bg-purple-500 rounded-[50%] z-10' : ''} ${
            bullet.shape === 'pellet' ? 'bullet-pellet z-10' : ''
          }`}
          style={{
            transform: `translate3d(${bullet.x}px, ${bullet.y}px, 0) rotate(${bullet.rotation}deg)`,
            width: `${bullet.width}px`,
            height: `${bullet.height}px`,
          }}
        ></div>
      ))}

      {enemyBullets.map((egg) => (
        <div
          key={'egg' + egg.id}
          className="absolute top-0 left-0 z-20 will-change-transform flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate3d(${egg.x}px, ${egg.y}px, 0)`,
            width: `${egg.width}px`,
            height: `${egg.height}px`,
          }}
        >
          <div
            className={`w-full h-full flex items-center justify-center ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
            style={{ transform: `rotate(${-boardRotation}deg)` }}
          >
            <div
              className={`w-full h-full ${egg.isMeteor ? 'animate-[spin_3s_linear_infinite]' : ''}`}
              dangerouslySetInnerHTML={{ __html: egg.isMeteor ? SPRITES.meteor : SPRITES.egg }}
            ></div>
          </div>
        </div>
      ))}

      {(gamePhase === 'minions' || gamePhase === 'meteors') &&
        enemies.map((enemy) => (
          <div
            key={'e' + enemy.id}
            className="absolute top-0 left-0 flex flex-col items-center justify-center z-10 will-change-transform pointer-events-none"
            style={{
              transform: `translate3d(${enemy.x}px, ${enemy.y}px, 0)`,
              width: `${enemy.width}px`,
              height: `${enemy.height}px`,
            }}
          >
            {enemy.hp < enemy.maxHp && (
              <div
                className={`absolute -top-3 w-[80%] h-1 bg-bg-deep border border-border-default overflow-hidden z-20 ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
                style={{ transform: `rotate(${-boardRotation}deg)` }}
              >
                <div
                  className="h-full bg-accent-sky transition-all duration-75"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                ></div>
              </div>
            )}
            <div
              className={`w-[90%] h-[90%] flex items-center justify-center ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
              style={{ transform: `rotate(${-boardRotation}deg)` }}
            >
              <div
                className={`w-full h-full ${enemy.isMeteor ? 'animate-[spin_6s_linear_infinite]' : ''}`}
                style={
                  !enemy.isMeteor && !enemy.isStash
                    ? {
                        color: (enemy as any).shirtColor || '#ef4444',
                        filter: `drop-shadow(0 0 10px ${(enemy as any).shirtColor || '#ef4444'})`,
                      }
                    : {}
                }
                dangerouslySetInnerHTML={{
                  __html: enemy.isMeteor ? SPRITES.meteor : enemy.isStash ? SPRITES.safe : SPRITES.chicken,
                }}
              ></div>
            </div>
          </div>
        ))}

      {gamePhase === 'boss' &&
        bosses.map((b) => {
          if (b.hp <= 0) return null;
          return (
            <React.Fragment key={'b' + b.id}>
              {(b.bossType === 0 || b.bossType === 2 || b.bossType === 3) && (
                <>
                  {b.state === 'laser_warning' &&
                    (b.laserXs || (b.laserX !== undefined ? [b.laserX] : [b.x + b.width / 2 - 40])).map((lx, i) => (
                      <div
                        key={'warn' + b.id + i}
                        className="absolute top-0 left-0 bg-accent-coral/20 border-x-2 border-dashed border-accent-coral z-0 animate-pulse will-change-transform pointer-events-none"
                        style={{
                          transform: `translate3d(${lx}px, ${b.y + b.height}px, 0)`,
                          width: `80px`,
                          height: `${activeHeight}px`,
                        }}
                      >
                        <div
                          className={`w-full h-full flex flex-col items-center pt-20 ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
                          style={{ transform: `rotate(${-boardRotation}deg)` }}
                        >
                          <div className="text-center text-accent-coral font-display font-bold drop-shadow-md text-2xl">
                            ⚠️ DANGER ⚠️
                          </div>
                        </div>
                      </div>
                    ))}
                  {b.state === 'laser_firing' &&
                    (b.laserXs || (b.laserX !== undefined ? [b.laserX] : [b.x + b.width / 2 - 40])).map((lx, i) => (
                      <div
                        key={'fire' + b.id + i}
                        className="absolute top-0 left-0 z-20 shadow-[0_0_40px_#FF6B4A] bg-gradient-to-r from-accent-coral via-white to-accent-coral will-change-transform pointer-events-none"
                        style={{
                          transform: `translate3d(${lx}px, ${b.y + b.height}px, 0)`,
                          width: `80px`,
                          height: `${activeHeight}px`,
                        }}
                      ></div>
                    ))}
                </>
              )}

              <div
                className="absolute top-0 left-0 flex flex-col items-center justify-center z-10 will-change-transform pointer-events-none"
                style={{
                  transform: `translate3d(${b.x}px, ${b.y}px, 0)`,
                  width: `${b.width}px`,
                  height: `${b.height}px`,
                }}
              >
                <div
                  className={`absolute -top-6 w-[80%] h-3 bg-bg-deep border border-border-default overflow-hidden shadow-lg z-10 ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
                  style={{ transform: `rotate(${-boardRotation}deg)` }}
                >
                  <div
                    className={`h-full transition-all duration-100 ${
                      b.bossType === 1 || b.bossType === 4
                        ? 'bg-yellow-400'
                        : b.bossType === 2
                        ? 'bg-accent-sky'
                        : 'bg-gradient-to-r from-accent-coral to-accent-amber'
                    }`}
                    style={{ width: `${(b.hp / b.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div
                  className={`w-full h-full flex items-center justify-center ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
                  style={{ transform: `rotate(${-boardRotation}deg)` }}
                >
                  <div
                    className="w-full h-full"
                    style={
                      b.bossType === 0
                        ? { color: '#ef4444', filter: 'drop-shadow(0 0 15px #ef4444)' }
                        : b.bossType === 1 || b.bossType === 4
                        ? { color: '#eab308', filter: 'drop-shadow(0 0 15px #eab308)' }
                        : {}
                    }
                    dangerouslySetInnerHTML={{
                      __html:
                        b.bossType === 5 && currentWave >= 100
                          ? SPRITES.finalBoss
                          : b.bossType === 5
                          ? SPRITES.megaBoss
                          : b.bossType === 4
                          ? SPRITES.bossRooster
                          : b.bossType === 3
                          ? SPRITES.bossMecha
                          : b.bossType === 2
                          ? SPRITES.ufo
                          : SPRITES.bossGiantChicken,
                    }}
                  ></div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

      <div
        className="absolute top-0 left-0 z-30 will-change-transform pointer-events-none"
        style={{
          transform: `translate3d(${player.x}px, ${player.y}px, 0)`,
          width: `${player.width}px`,
          height: `${player.height}px`,
        }}
      >
        <div
          className={`w-full h-full flex items-center justify-center ${player.invulnerable > 0 ? 'opacity-50 animate-pulse' : ''} ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
        >
          <div
            className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform duration-75"
            dangerouslySetInnerHTML={{ __html: SPRITES.player }}
          ></div>
          {player.invulnerable > 0 && (
            <div className="absolute inset-0 rounded-full border-2 border-accent-sky/50 shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-125 animate-ping"></div>
          )}
        </div>
      </div>

      {activeDots.map((dot, i) => {
        let tX = 0, tY = 0;
        let found = false;
        if (dot.targetId === 'player') {
          tX = player.x + player.width / 2;
          tY = player.y + player.height / 2;
          found = true;
        } else {
          for (let e of enemies) {
            if (e.id === dot.targetId) {
              tX = e.x + e.width / 2;
              tY = e.y + e.height / 2;
              found = true;
              break;
            }
          }
          if (!found) {
            for (let b of bosses) {
              if (b.id === dot.targetId) {
                tX = b.x + b.width / 2;
                tY = b.y + b.height / 2;
                found = true;
                break;
              }
            }
          }
        }
        if (!found) return null;
        return (
          <div
            key={'dot' + dot.targetId + i}
            className="absolute top-0 left-0 w-8 h-8 pointer-events-none z-30 opacity-70"
            style={{
              transform: `translate3d(${tX - 16}px, ${tY - 16}px, 0)`,
            }}
          >
            <div
              className={`w-full h-full animate-[spin_1s_linear_infinite] ${isRotating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
              style={{ transform: `rotate(${-boardRotation}deg)` }}
              dangerouslySetInnerHTML={{ __html: SPRITES.meteor }}
            ></div>
          </div>
        );
      })}
    </div>
    </>
  )
}
