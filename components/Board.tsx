'use client'

import { useState, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { PromotionDialog } from './PromotionDialog'

interface BoardProps {
  fen: string
  turn: 'w' | 'b'
  boardOrientation: 'white' | 'black'
  isAiThinking: boolean
  isGameOver: boolean
  makeMove: (from: string, to: string, promotion?: string) => boolean
  isPromotion: (from: string, to: string) => boolean
}

export function Board({
  fen,
  turn,
  boardOrientation,
  isAiThinking,
  isGameOver,
  makeMove,
  isPromotion,
}: BoardProps) {
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string
    to: string
  } | null>(null)

  const handlePieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: unknown
      sourceSquare: string
      targetSquare: string | null
    }): boolean => {
      if (!targetSquare) return false
      if (isPromotion(sourceSquare, targetSquare)) {
        setPendingPromotion({ from: sourceSquare, to: targetSquare })
        return false
      }
      return makeMove(sourceSquare, targetSquare)
    },
    [isPromotion, makeMove]
  )

  const handlePromotionSelect = useCallback(
    (piece: string) => {
      if (pendingPromotion) {
        makeMove(pendingPromotion.from, pendingPromotion.to, piece)
        setPendingPromotion(null)
      }
    },
    [pendingPromotion, makeMove]
  )

  const canDragPiece = useCallback(
    ({ piece }: { isSparePiece: boolean; piece: { pieceType: string }; square: string | null }): boolean => {
      if (isAiThinking || isGameOver) return false
      return piece.pieceType[0] === turn
    },
    [isAiThinking, isGameOver, turn]
  )

  return (
    <>
      <Chessboard
        options={{
          position: fen,
          onPieceDrop: handlePieceDrop,
          boardOrientation,
          canDragPiece,
          animationDurationInMs: 200,
        }}
      />
      <PromotionDialog
        isOpen={pendingPromotion !== null}
        color={turn}
        onSelect={handlePromotionSelect}
      />
    </>
  )
}
