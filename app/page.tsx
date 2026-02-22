'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
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

  const canUndo = history.length >= 2 && !isAiThinking && !isGameOver

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden">
      <div className="absolute inset-0">
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


      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={undoMove}
          disabled={!canUndo}
          aria-label="Undo"
          className="pointer-events-auto rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow-lg backdrop-blur-sm transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        >
          ↩ Undo
        </button>

        <div className="pointer-events-auto">
          <GameStatus
            isGameOver={isGameOver}
            gameOverReason={gameOverReason}
            turn={turn}
            isInCheck={isInCheck}
          />
        </div>
      </div>


      {isAiThinking && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            AI is thinking&hellip;
          </div>
        </div>
      )}

      <PromotionDialog
        isOpen={pendingPromotion !== null}
        color={turn}
        onSelect={handlePromotionSelect}
      />
    </div>
  )
}
