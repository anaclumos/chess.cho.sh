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
        className={`block rounded-lg px-4 py-3 text-center font-semibold ${
          isCheckmate
            ? 'bg-red-100 text-red-800'
            : 'bg-amber-100 text-amber-800'
        }`}
      >
        {getGameOverMessage(gameOverReason, turn)}
      </output>
    )
  }

  if (isInCheck) {
    return (
      <output
        className="block rounded-lg bg-orange-100 px-4 py-2 text-center font-semibold text-orange-700"
      >
        Check!
      </output>
    )
  }

  return null
}
