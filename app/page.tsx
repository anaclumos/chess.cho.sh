'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { GameControls } from '@/components/GameControls'
import { MoveHistory } from '@/components/MoveHistory'
import { GameStatus } from '@/components/GameStatus'
import { PromotionDialog } from '@/components/PromotionDialog'
import { useChessGame } from '@/hooks/useChessGame'

const Board3D = dynamic(
  () => import('@/components/Board3D').then((m) => m.Board3D),
  { ssr: false }
)

export default function Home() {
  const {
    fen,
    turn,
    isAiThinking,
    isGameOver,
    gameOverReason,
    isInCheck,
    history,
    selectedSquare,
    legalMoves,
    makeMove,
    undoMove,
    newGame,
    selectSquare,
    clearSelection,
    setAiThinking,
    isPromotion,
    applyAiMove,
  } = useChessGame()

  const pendingAiMove = useRef(false)
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string
    to: string
  } | null>(null)

  const handleSquareClick = useCallback(
    (square: string) => {
      if (!square) {
        clearSelection()
        return
      }

      if (selectedSquare && legalMoves.includes(square)) {
        if (isPromotion(selectedSquare, square)) {
          setPendingPromotion({ from: selectedSquare, to: square })
          clearSelection()
          return
        }
        const success = makeMove(selectedSquare, square)
        if (success) {
          pendingAiMove.current = true
        }
        return
      }

      selectSquare(square)
    },
    [selectedSquare, legalMoves, makeMove, selectSquare, clearSelection, isPromotion]
  )

  const handlePromotionSelect = useCallback(
    (piece: string) => {
      if (pendingPromotion) {
        const { from, to } = pendingPromotion
        const success = makeMove(from, to, piece)
        setPendingPromotion(null)
        if (success) {
          pendingAiMove.current = true
        }
      }
    },
    [pendingPromotion, makeMove]
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
          body: JSON.stringify({ fen }),
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
  }, [fen, turn, isGameOver, setAiThinking, applyAiMove])

  const handleNewGame = useCallback(() => {
    setPendingPromotion(null)
    newGame()
    fetch('/api/newgame', { method: 'POST' }).catch(() => {})
  }, [newGame])

  const canUndo = history.length >= 2 && !isAiThinking && !isGameOver

  return (
    <div className="flex min-h-[100dvh] flex-col items-center bg-amber-50/40 px-3 py-4">
      <div className="w-full max-w-[min(100vw-24px,500px)]">
        <Board3D
          fen={fen}
          turn={turn}
          isAiThinking={isAiThinking}
          isGameOver={isGameOver}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          onSquareClick={handleSquareClick}
        />
      </div>

      <div className="mt-3 flex w-full max-w-[min(100vw-24px,500px)] flex-col gap-2.5">
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

        <GameControls
          onNewGame={handleNewGame}
          onUndo={undoMove}
          canUndo={canUndo}
          isAiThinking={isAiThinking}
        />

        <div className="min-h-0 max-h-[200px] overflow-hidden rounded-xl border border-amber-900/10 bg-white/70 p-3">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-700/60">
            Moves
          </h2>
          <MoveHistory history={history} />
        </div>
      </div>

      <PromotionDialog
        isOpen={pendingPromotion !== null}
        color={turn}
        onSelect={handlePromotionSelect}
      />
    </div>
  )
}
