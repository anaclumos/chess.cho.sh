'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Board } from '@/components/Board'
import { GameControls } from '@/components/GameControls'
import { MoveHistory } from '@/components/MoveHistory'
import { GameStatus } from '@/components/GameStatus'
import { useChessGame } from '@/hooks/useChessGame'

export default function Home() {
  const {
    fen,
    turn,
    boardOrientation,
    isAiThinking,
    isGameOver,
    gameOverReason,
    isInCheck,
    history,
    makeMove,
    undoMove,
    newGame,
    flipBoard,
    setAiThinking,
    isPromotion,
    applyAiMove,
  } = useChessGame()

  const [currentDifficulty, setCurrentDifficulty] = useState('intermediate')
  const pendingAiMove = useRef(false)

  const handlePlayerMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      const success = makeMove(from, to, promotion)
      if (success) {
        pendingAiMove.current = true
      }
      return success
    },
    [makeMove]
  )

  useEffect(() => {
    if (!pendingAiMove.current) return
    if (turn !== 'b' || isGameOver) {
      pendingAiMove.current = false
      return
    }
    pendingAiMove.current = false

    let cancelled = false
    const fetchAiMove = async () => {
      setAiThinking(true)
      try {
        const res = await fetch('/api/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fen, difficulty: currentDifficulty }),
        })
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (!cancelled) {
          applyAiMove(data.from, data.to, data.promotion)
        }
      } finally {
        if (!cancelled) setAiThinking(false)
      }
    }

    fetchAiMove()
    return () => {
      cancelled = true
    }
  }, [fen, turn, isGameOver, currentDifficulty, setAiThinking, applyAiMove])

  const handleNewGame = useCallback(() => {
    newGame()
    fetch('/api/newgame', { method: 'POST' }).catch(() => {})
  }, [newGame])

  const canUndo = history.length >= 2 && !isAiThinking && !isGameOver

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50/40 p-4">
      <div className="flex gap-6">
        <div className="w-[560px] shrink-0">
          <Board
            fen={fen}
            turn={turn}
            boardOrientation={boardOrientation}
            isAiThinking={isAiThinking}
            isGameOver={isGameOver}
            makeMove={handlePlayerMove}
            isPromotion={isPromotion}
          />
        </div>

        <div className="flex w-64 flex-col gap-3">
          <GameControls
            onNewGame={handleNewGame}
            onUndo={undoMove}
            onFlipBoard={flipBoard}
            onDifficultyChange={setCurrentDifficulty}
            currentDifficulty={currentDifficulty}
            canUndo={canUndo}
            isAiThinking={isAiThinking}
          />

          <GameStatus
            isGameOver={isGameOver}
            gameOverReason={gameOverReason}
            turn={turn}
            isInCheck={isInCheck}
          />

          {isAiThinking && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-100/80 px-3 py-2 text-sm font-medium text-amber-800">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-600" />
              AI is thinking&hellip;
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-amber-900/10 bg-white/70 p-3">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-700/60">
              Moves
            </h2>
            <MoveHistory history={history} />
          </div>
        </div>
      </div>
    </div>
  )
}
