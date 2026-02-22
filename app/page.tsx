'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { StatusBar } from '@/components/StatusBar'
import { PromotionDialog } from '@/components/PromotionDialog'
import { useChessGame } from '@/hooks/useChessGame'
import type { Evaluation } from '@/lib/types'

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
    newGame,
  } = useChessGame()

  const pendingAiMove = useRef(false)
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string
    to: string
  } | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)

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
          if (data.evaluation) {
            setEvaluation(data.evaluation)
          }
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

      <StatusBar
        turn={turn}
        isInCheck={isInCheck}
        isGameOver={isGameOver}
        gameOverReason={gameOverReason}
        isAiThinking={isAiThinking}
        history={history}
        canUndo={canUndo}
        onUndo={undoMove}
        onNewGame={newGame}
        evaluation={evaluation}
      />
      <PromotionDialog
        isOpen={pendingPromotion !== null}
        color={turn}
        onSelect={handlePromotionSelect}
      />
    </div>
  )
}
