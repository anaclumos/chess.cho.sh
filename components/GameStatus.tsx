'use client'

import { useTranslations } from 'next-intl'
import type { GameOverReason } from '@/lib/types'

interface GameStatusProps {
  isGameOver: boolean
  gameOverReason: GameOverReason | null
  turn: 'w' | 'b'
  isInCheck: boolean
}

export function GameStatus({
  isGameOver,
  gameOverReason,
  turn,
  isInCheck,
}: GameStatusProps) {
  const t = useTranslations('GameStatus')

  if (isGameOver && gameOverReason) {
    const isCheckmate = gameOverReason === 'checkmate'
    const winner = turn === 'w' ? t('black') : t('white')

    const reasonMap: Record<GameOverReason, string> = {
      'checkmate': t('checkmate', { winner }),
      'stalemate': t('stalemate'),
      'threefold-repetition': t('threefoldRepetition'),
      '50-move-rule': t('fiftyMoveRule'),
      'insufficient-material': t('insufficientMaterial'),
    }
    const message = reasonMap[gameOverReason] ?? t('default')

    return (
      <output
        className={`block rounded-xl px-3 py-2 text-center text-sm font-semibold shadow-lg backdrop-blur-sm ${
          isCheckmate
            ? 'bg-red-100/90 text-red-800'
            : 'bg-amber-100/90 text-amber-800'
        }`}
      >
        {message}
      </output>
    )
  }

  if (isInCheck) {
    return (
      <output
        className="block rounded-xl bg-orange-100/90 px-3 py-2 text-center text-sm font-semibold text-orange-700 shadow-lg backdrop-blur-sm"
      >
        {t('check')}
      </output>
    )
  }

  return null
}
