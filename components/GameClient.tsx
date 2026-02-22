'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useQueryState, parseAsString } from 'nuqs'
import { useTranslations } from 'next-intl'
import { StatusBar } from '@/components/StatusBar'
import { PromotionDialog } from '@/components/PromotionDialog'
import { useChessGame } from '@/hooks/useChessGame'
import { WelcomeDialog } from '@/components/WelcomeDialog'
import type { Evaluation } from '@/lib/types'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const Board3D = dynamic(
  () => import('@/components/Board3D').then((m) => m.Board3D),
  { ssr: false }
)

export function GameClient() {
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
    loadFen,
  } = useChessGame()
  const pendingAiMove = useRef(false)
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string
    to: string
  } | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [playerName, setPlayerName] = useQueryState('name', parseAsString.withDefault(''))
  const [urlFen, setUrlFen] = useQueryState(
    'fen',
    parseAsString.withDefault(STARTING_FEN).withOptions({ history: 'replace' })
  )
  const tPlayers = useTranslations('Players')

  useEffect(() => {
    if (urlFen !== STARTING_FEN) {
      loadFen(urlFen)
      if (urlFen.split(' ')[1] === 'b') {
        pendingAiMove.current = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const skipFenSync = useRef(true)
  useEffect(() => {
    if (skipFenSync.current) {
      skipFenSync.current = false
      return
    }
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
    if (isGameOver) {
      pendingAiMove.current = false
      return
    }
    if (turn !== 'b') return
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
        whiteName={playerName}
        blackName={tPlayers('black')}
      />
      <PromotionDialog
        isOpen={pendingPromotion !== null}
        color={turn}
        onSelect={handlePromotionSelect}
      />
      <WelcomeDialog
        isOpen={!playerName}
        defaultName={playerName}
        onSubmit={handleNameSubmit}
      />
    </div>
  )
}
