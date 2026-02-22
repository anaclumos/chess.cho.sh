'use client'

import type { GameOverReason } from '@/lib/types'

interface GameStatusProps {
  isGameOver: boolean
  gameOverReason: GameOverReason | null
  turn: 'w' | 'b'
  isInCheck: boolean
}

function getGameOverMessage(reason: GameOverReason, sideToMove: 'w' | 'b'): string {
  const winner = sideToMove === 'w' ? 'Black' : 'White'

  switch (reason) {
    case 'checkmate':
      return `Checkmate — ${winner} wins!`
    case 'stalemate':
      return 'Stalemate — Draw'
    case 'threefold-repetition':
      return 'Draw by Threefold Repetition'
    case '50-move-rule':
      return 'Draw by 50-Move Rule'
    case 'insufficient-material':
      return 'Draw by Insufficient Material'
    default:
      return 'Game Over'
  }
}

export function GameStatus({
  isGameOver,
  gameOverReason,
  turn,
  isInCheck,
}: GameStatusProps) {
  if (isGameOver && gameOverReason) {
    const isCheckmate = gameOverReason === 'checkmate'

    return (
      <output
        className={`block rounded-xl px-3 py-2 text-center text-sm font-semibold shadow-lg backdrop-blur-sm ${
          isCheckmate
            ? 'bg-red-100/90 text-red-800'
            : 'bg-amber-100/90 text-amber-800'
        }`}
      >
        {getGameOverMessage(gameOverReason, turn)}
      </output>
    )
  }

  if (isInCheck) {
    return (
      <output
        className="block rounded-xl bg-orange-100/90 px-3 py-2 text-center text-sm font-semibold text-orange-700 shadow-lg backdrop-blur-sm"
      >
        Check!
      </output>
    )
  }

  return null
}
