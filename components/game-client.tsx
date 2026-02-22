'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PromotionDialog } from '@/components/promotion-dialog'
import { StatusBar } from '@/components/status-bar'
import { WelcomeDialog } from '@/components/welcome-dialog'
import { useChessGame } from '@/hooks/use-chess-game'
import type { Evaluation } from '@/lib/types'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const Board3D = dynamic(
  () => import('@/components/board-3d').then((m) => m.Board3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    ),
  }
)

export function GameClient() {
  const [playerName, setPlayerName] = useQueryState(
    'name',
    parseAsString.withDefault('')
  )
  const [urlFen, setUrlFen] = useQueryState(
    'fen',
    parseAsString.withDefault(STARTING_FEN).withOptions({ history: 'replace' })
  )
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
  } = useChessGame(urlFen)
  const pendingAiMove = useRef(urlFen.split(' ')[1] === 'b')
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string
    to: string
  } | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const tPlayers = useTranslations('Players')
  useEffect(() => {
    setUrlFen(fen)
  }, [fen, setUrlFen])

  const handleNameSubmit = useCallback(
    (name: string) => {
      setPlayerName(name)
    },
    [setPlayerName]
  )

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
    [
      selectedSquare,
      legalMoves,
      makeMove,
      selectSquare,
      clearSelection,
      isPromotion,
    ]
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
    if (!pendingAiMove.current) {
      return
    }
    if (isGameOver) {
      pendingAiMove.current = false
      return
    }
    if (turn !== 'b') {
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
        if (!res.ok || cancelled) {
          return
        }
        const data = await res.json()
        if (!cancelled) {
          applyAiMove(data.from, data.to, data.promotion)
          if (data.evaluation) {
            setEvaluation(data.evaluation)
          }
        }
      } finally {
        if (!cancelled) {
          setAiThinking(false)
        }
      }
    }

    fetchAiMove()
    return () => {
      cancelled = true
    }
  }, [fen, turn, isGameOver, setAiThinking, applyAiMove])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        undoMove()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoMove])

  const canUndo = history.length >= 2 && !isAiThinking && !isGameOver

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden">
      <div className="absolute inset-0">
        <Board3D
          fen={fen}
          isAiThinking={isAiThinking}
          isGameOver={isGameOver}
          legalMoves={legalMoves}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          turn={turn}
        />
      </div>

      <StatusBar
        blackName={tPlayers('black')}
        canUndo={canUndo}
        evaluation={evaluation}
        gameOverReason={gameOverReason}
        history={history}
        isAiThinking={isAiThinking}
        isGameOver={isGameOver}
        isInCheck={isInCheck}
        onNewGame={newGame}
        onUndo={undoMove}
        turn={turn}
        whiteName={playerName}
      />
      <PromotionDialog
        color={turn}
        isOpen={pendingPromotion !== null}
        onSelect={handlePromotionSelect}
      />
      <WelcomeDialog
        defaultName={playerName}
        isOpen={!playerName}
        onSubmit={handleNameSubmit}
      />
    </div>
  )
}
