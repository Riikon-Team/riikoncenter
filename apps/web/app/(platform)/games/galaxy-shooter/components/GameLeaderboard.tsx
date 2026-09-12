import React, { useState, useMemo } from 'react'
import { useGameStore } from '../store/useGameStore'

const diffMap: Record<string, { name: string; color: string }> = {
  easy: { name: 'DỄ', color: 'text-green-400' },
  normal: { name: 'VỪA', color: 'text-yellow-400' },
  hard: { name: 'KHÓ', color: 'text-orange-400' },
  hardcore: { name: 'HARDCORE', color: 'text-red-500 drop-shadow-[0_0_5px_currentColor]' },
}

export default function GameLeaderboard() {
  const { gameState, leaderboard, setGameState } = useGameStore()
  const [leaderboardTab, setLeaderboardTab] = useState<'campaign' | 'endless'>('campaign')
  const [leaderboardPage, setLeaderboardPage] = useState(1)
  const itemsPerPage = 5

  const filteredLeaderboard = useMemo(() => {
    if (!leaderboard) return []
    return leaderboard.filter(
      (entry) =>
        entry.mode === leaderboardTab || (!entry.mode && leaderboardTab === 'endless')
    )
  }, [leaderboard, leaderboardTab])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredLeaderboard.length / itemsPerPage))
  }, [filteredLeaderboard.length])

  const paginatedLeaderboard = useMemo(() => {
    const start = (leaderboardPage - 1) * itemsPerPage
    return filteredLeaderboard.slice(start, start + itemsPerPage)
  }, [filteredLeaderboard, leaderboardPage])

  const handleSetTab = (tab: 'campaign' | 'endless') => {
    setLeaderboardTab(tab)
    setLeaderboardPage(1)
  }

  if (gameState !== 'leaderboard') return null

  return (
    <div className="absolute inset-0 z-[600] bg-bg-deep/95 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto overflow-y-auto py-8">
      <div className="flex flex-col items-center w-full max-w-2xl bg-bg-surface border-2 border-border-default p-6 shadow-2xl">
        <div className="relative flex items-center justify-center w-full mb-6">
          <button
            onClick={() => setGameState({ gameState: 'menu' })}
            className="absolute left-0 text-text-secondary hover:text-white transition-colors active:scale-95 flex items-center p-2"
            title="Quay lại Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <h2 className="text-4xl font-display font-bold text-accent-amber tracking-widest uppercase drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] m-0">
            BẢNG THÀNH TÍCH
          </h2>
        </div>

        <div className="flex gap-4 mb-6 w-full justify-center">
          <button
            onClick={() => handleSetTab('campaign')}
            className={`px-8 py-3 font-display font-bold text-lg transition-all ${
              leaderboardTab === 'campaign'
                ? 'bg-accent-sky text-bg-deep shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                : 'bg-bg-elevated text-text-secondary hover:text-white'
            }`}
          >
            CHIẾN DỊCH
          </button>
          <button
            onClick={() => handleSetTab('endless')}
            className={`px-8 py-3 font-display font-bold text-lg transition-all ${
              leaderboardTab === 'endless'
                ? 'bg-accent-sky text-bg-deep shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                : 'bg-bg-elevated text-text-secondary hover:text-white'
            }`}
          >
            VÔ HẠN
          </button>
        </div>

        <div className="grid grid-cols-4 w-full text-text-secondary font-display font-bold border-b-2 border-border-default pb-2 mb-4 px-4 text-center">
          <div className="text-left">TOP</div>
          <div>ĐIỂM SỐ</div>
          <div>WAVE & ĐỘ KHÓ</div>
          <div className="text-right">NGÀY CHƠI</div>
        </div>

        <div className="flex flex-col w-full gap-2 min-h-[15.625rem]">
          {paginatedLeaderboard.map((entry, index) => (
            <div
              key={index}
              className="grid grid-cols-4 w-full bg-bg-elevated py-3 px-4 rounded text-center items-center font-display transition-colors hover:bg-border-default"
            >
              <div
                className={`text-left font-bold text-xl ${
                  leaderboardPage === 1 && index === 0
                    ? 'text-yellow-400'
                    : leaderboardPage === 1 && index === 1
                    ? 'text-gray-300'
                    : leaderboardPage === 1 && index === 2
                    ? 'text-amber-600'
                    : 'text-text-primary'
                }`}
              >
                #{(leaderboardPage - 1) * itemsPerPage + index + 1}
              </div>
              <div className="font-bold text-accent-coral">{entry.score.toLocaleString()}</div>

              <div className="text-accent-amber text-sm font-bold uppercase tracking-wider">
                Wave {entry.wave} <span className="text-text-secondary mx-1">-</span>
                <span className={diffMap[entry.difficulty]?.color || 'text-text-primary'}>
                  {diffMap[entry.difficulty]?.name || entry.difficulty}
                </span>
              </div>

              <div className="text-right text-text-secondary text-sm">
                {new Date(entry.date).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}

          {paginatedLeaderboard.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-text-secondary font-display italic border border-dashed border-border-default p-4">
              Chưa có chiến binh nào ghi danh tại đây...
            </div>
          )}
        </div>

        <div className="flex w-full justify-between items-center mt-6 pt-4 border-t border-border-default">
          <button
            onClick={() => setLeaderboardPage(p => p - 1)}
            disabled={leaderboardPage === 1}
            className="px-4 py-2 bg-bg-elevated font-display font-bold text-text-primary transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-border-default"
          >
            &lt; TRƯỚC
          </button>

          <span className="font-display font-bold text-accent-sky">
            TRANG {leaderboardPage} / {totalPages}
          </span>

          <button
            onClick={() => setLeaderboardPage(p => p + 1)}
            disabled={leaderboardPage === totalPages}
            className="px-4 py-2 bg-bg-elevated font-display font-bold text-text-primary transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-border-default"
          >
            SAU &gt;
          </button>
        </div>
      </div>
    </div>
  )
}
