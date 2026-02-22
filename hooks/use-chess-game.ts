'use client'

import { Chess, type Square } from 'chess.js'
import { useCallback, useReducer, useRef, useState } from 'react'
import type { GameOverReason, Move } from '@/lib/types'

function detectGameOver(chess: Chess): {
  isGameOver: boolean
  gameOverReason: GameOverReason | null
} {
  if (!chess.isGameOver()) {
    return { isGameOver: false, gameOverReason: null }
  }

  if (chess.isCheckmate()) {
    return { isGameOver: true, gameOverReason: 'checkmate' }
  }
  if (chess.isStalemate()) {
    return { isGameOver: true, gameOverReason: 'stalemate' }
  }
  if (chess.isThreefoldRepetition()) {
    return { isGameOver: true, gameOverReason: 'threefold-repetition' }
  }
  if (chess.isInsufficientMaterial()) {
    return { isGameOver: true, gameOverReason: 'insufficient-material' }
  }
  if (chess.isDraw()) {
    return { isGameOver: true, gameOverReason: '50-move-rule' }
  }

  return { isGameOver: true, gameOverReason: 'stalemate' }
}

export interface UseChessGameReturn {
  applyAiMove: (from: string, to: string, promotion?: string) => boolean
  clearSelection: () => void
  fen: string
  gameOverReason: GameOverReason | null
  history: Move[]
  isAiThinking: boolean
  isGameOver: boolean
  isInCheck: boolean
  isPromotion: (from: string, to: string) => boolean
  legalMoves: string[]
  loadFen: (fen: string) => void
  makeMove: (from: string, to: string, promotion?: string) => boolean
  newGame: () => void
  selectedSquare: string | null
  selectSquare: (square: string) => void
  setAiThinking: (thinking: boolean) => void
  turn: 'w' | 'b'
  undoMove: () => boolean
}

export function useChessGame(initialFen?: string): UseChessGameReturn {
  const gameRef = useRef(new Chess(initialFen))
  const [, forceRender] = useReducer((x: number) => x + 1, 0)
  const [isAiThinking, setIsAiThinkingState] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])

  const clearSelection = useCallback(() => {
    setSelectedSquare(null)
    setLegalMoves([])
  }, [])

  const selectSquare = useCallback(
    (square: string) => {
      const chess = gameRef.current
      const piece = chess.get(square as Square)
      if (!piece || piece.color !== chess.turn()) {
        clearSelection()
        return
      }

      try {
        const moves = chess.moves({ square: square as Square, verbose: true })
        setSelectedSquare(square)
        setLegalMoves(moves.map((m) => m.to))
      } catch {
        clearSelection()
      }
    },
    [clearSelection]
  )

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      try {
        gameRef.current.move({
          from: from as Square,
          to: to as Square,
          promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
        })
        setSelectedSquare(null)
        setLegalMoves([])
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
    if (gameRef.current.history().length < 2) {
      return false
    }

    gameRef.current.undo()
    gameRef.current.undo()
    setSelectedSquare(null)
    setLegalMoves([])
    forceRender()
    return true
  }, [])

  const newGame = useCallback(() => {
    gameRef.current = new Chess()
    setSelectedSquare(null)
    setLegalMoves([])
    forceRender()
  }, [])

  const setAiThinking = useCallback((thinking: boolean) => {
    setIsAiThinkingState(thinking)
  }, [])

  const isPromotionCheck = useCallback((from: string, to: string): boolean => {
    try {
      const moves = gameRef.current.moves({
        square: from as Square,
        verbose: true,
      })
      return moves.some((m) => m.to === to && m.isPromotion())
    } catch {
      return false
    }
  }, [])

  const loadFen = useCallback((fen: string) => {
    try {
      gameRef.current = new Chess(fen)
      setSelectedSquare(null)
      setLegalMoves([])
      forceRender()
    } catch {
      /* invalid FEN, silently ignore */
    }
  }, [])

  // eslint-disable-next-line react-hooks/refs -- intentional: ref is kept in sync via forceRender()
  const chess = gameRef.current
  const { isGameOver, gameOverReason } = detectGameOver(chess)
  // eslint-disable-next-line react-hooks/refs -- intentional: ref is kept in sync via forceRender()
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
    // eslint-disable-next-line react-hooks/refs -- intentional: ref is kept in sync via forceRender()
    fen: chess.fen(),
    history,
    isGameOver,
    gameOverReason,
    // eslint-disable-next-line react-hooks/refs -- intentional: ref is kept in sync via forceRender()
    turn: chess.turn(),
    isAiThinking,
    // eslint-disable-next-line react-hooks/refs -- intentional: ref is kept in sync via forceRender()
    isInCheck: chess.inCheck(),
    selectedSquare,
    legalMoves,
    makeMove,
    undoMove,
    newGame,
    selectSquare,
    clearSelection,
    setAiThinking,
    isPromotion: isPromotionCheck,
    applyAiMove,
    loadFen,
  }
}
