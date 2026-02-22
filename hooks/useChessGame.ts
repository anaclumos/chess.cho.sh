'use client'

import { useState, useRef, useCallback, useReducer } from 'react'
import { Chess, type Square } from 'chess.js'
import type { GameOverReason, Move } from '@/lib/types'

function detectGameOver(chess: Chess): {
  isGameOver: boolean
  gameOverReason: GameOverReason | null
} {
  if (!chess.isGameOver()) {
    return { isGameOver: false, gameOverReason: null }
  }

  if (chess.isCheckmate()) return { isGameOver: true, gameOverReason: 'checkmate' }
  if (chess.isStalemate()) return { isGameOver: true, gameOverReason: 'stalemate' }
  if (chess.isThreefoldRepetition()) return { isGameOver: true, gameOverReason: 'threefold-repetition' }
  if (chess.isInsufficientMaterial()) return { isGameOver: true, gameOverReason: 'insufficient-material' }
  if (chess.isDraw()) return { isGameOver: true, gameOverReason: '50-move-rule' }

  return { isGameOver: true, gameOverReason: 'stalemate' }
}

export interface UseChessGameReturn {
  fen: string
  history: Move[]
  isGameOver: boolean
  gameOverReason: GameOverReason | null
  turn: 'w' | 'b'
  isAiThinking: boolean
  boardOrientation: 'white' | 'black'
  isInCheck: boolean
  makeMove: (from: string, to: string, promotion?: string) => boolean
  undoMove: () => boolean
  newGame: () => void
  flipBoard: () => void
  setAiThinking: (thinking: boolean) => void
  isPromotion: (from: string, to: string) => boolean
  applyAiMove: (from: string, to: string, promotion?: string) => boolean
  loadFen: (fen: string) => void
}

export function useChessGame(): UseChessGameReturn {
  const gameRef = useRef(new Chess())
  const [, forceRender] = useReducer((x: number) => x + 1, 0)
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [isAiThinking, setIsAiThinkingState] = useState(false)

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      try {
        gameRef.current.move({
          from: from as Square,
          to: to as Square,
          promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
        })
        forceRender()
        return true
      } catch {
        return false
      }
    },
    []
  )

  const applyAiMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      return makeMove(from, to, promotion)
    },
    [makeMove]
  )

  const undoMove = useCallback((): boolean => {
    if (gameRef.current.history().length < 2) return false

    gameRef.current.undo()
    gameRef.current.undo()
    forceRender()
    return true
  }, [])

  const newGame = useCallback(() => {
    gameRef.current = new Chess()
    forceRender()
  }, [])

  const flipBoard = useCallback(() => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'))
  }, [])

  const setAiThinking = useCallback((thinking: boolean) => {
    setIsAiThinkingState(thinking)
  }, [])

  const isPromotionCheck = useCallback((from: string, to: string): boolean => {
    try {
      const moves = gameRef.current.moves({ square: from as Square, verbose: true })
      return moves.some((m) => m.to === to && m.isPromotion())
    } catch {
      return false
    }
  }, [])

  const loadFen = useCallback((fen: string) => {
    try {
      gameRef.current = new Chess(fen)
      forceRender()
    } catch {}
  }, [])

  const chess = gameRef.current
  const { isGameOver, gameOverReason } = detectGameOver(chess)

  const rawHistory = chess.history({ verbose: true })
  const history: Move[] = rawHistory.map((m) => ({
    from: m.from,
    to: m.to,
    san: m.san,
    color: m.color,
    piece: m.piece,
    captured: m.captured,
    promotion: m.promotion,
  }))

  return {
    fen: chess.fen(),
    history,
    isGameOver,
    gameOverReason,
    turn: chess.turn(),
    isAiThinking,
    boardOrientation,
    isInCheck: chess.inCheck(),
    makeMove,
    undoMove,
    newGame,
    flipBoard,
    setAiThinking,
    isPromotion: isPromotionCheck,
    applyAiMove,
    loadFen,
  }
}
