'use client'

import { useTranslations, useLocale } from 'next-intl'
import { GameDrawer } from '@/components/GameDrawer'
import { Progress } from '@/components/ui/progress'
import type { Evaluation, GameOverReason, Move } from '@/lib/types'
import { evalToWhitePercent } from '@/lib/winProbability'
import { josa } from 'es-hangul'

interface StatusBarProps {
  turn: 'w' | 'b'
  isInCheck: boolean
  isGameOver: boolean
  gameOverReason: GameOverReason | null
  isAiThinking: boolean
  history: Move[]
  canUndo: boolean
  onUndo: () => void
  onNewGame: () => void
  evaluation: Evaluation | null
  whiteName: string
  blackName: string
}

function getMoveNumber(history: Move[]): number {
  return Math.floor(history.length / 2) + 1
}

function getLastMove(history: Move[]): string | null {
  if (history.length === 0) return null
  const last = history[history.length - 1]
  return last.san
}

export function StatusBar({
  turn,
  isInCheck,
  isGameOver,
  gameOverReason,
  isAiThinking,
  history,
  canUndo,
  onUndo,
  onNewGame,
  evaluation,
  whiteName,
  blackName,
}: StatusBarProps) {
  const t = useTranslations('StatusBar')
  const moveNumber = getMoveNumber(history)
  const lastMove = getLastMove(history)

  const whitePercent = evaluation ? evalToWhitePercent(evaluation) : null
  const locale = useLocale()

  const winProbName = locale === 'ko' ? josa(whiteName, '이/가') : whiteName

  function getGameOverLabel(reason: GameOverReason): string {
    const winner = turn === 'w' ? blackName : whiteName
    const reasonMap: Record<GameOverReason, string> = {
      'checkmate': t('gameOver.checkmate', { winner }),
      'stalemate': t('gameOver.stalemate'),
      'threefold-repetition': t('gameOver.threefoldRepetition'),
      '50-move-rule': t('gameOver.fiftyMoveRule'),
      'insufficient-material': t('gameOver.insufficientMaterial'),
    }
    return reasonMap[reason] ?? t('gameOver.default')
  }

  return (
    <div className="status-bar">
      <div className="status-bar-section">
        {isGameOver && gameOverReason ? (
          <span className="status-bar-item status-bar-game-over">
            {getGameOverLabel(gameOverReason)}
          </span>
        ) : (
          <>
            <span className="status-bar-item">
              <span
                className={`status-bar-dot ${
                  turn === 'w' ? 'status-bar-dot-white animate-pulse' : 'status-bar-dot-black'
                }`}
              />
              {t('turn', { name: turn === 'w' ? whiteName : blackName })}
            </span>
            {isInCheck && (
              <span className="status-bar-item status-bar-check">{t('check')}</span>
            )}
          </>
        )}
      </div>

      <div className="status-bar-section">
        {whitePercent !== null && !isGameOver && (
          <span className="status-bar-item tabular-nums text-muted-foreground">
            {t('winProbability', { name: winProbName })}
            <Progress
              value={whitePercent}
              className="inline-block w-8 h-1.5 align-middle bg-muted-foreground/40"
              indicatorClassName="bg-foreground"
            />
            {whitePercent}%
          </span>
        )}
        {lastMove && (
          <span className="status-bar-item status-bar-muted">
            {lastMove}
          </span>
        )}
        <span className="status-bar-item status-bar-muted">
          {t('move', { moveNumber })}
        </span>
        <GameDrawer
          canUndo={canUndo}
          isAiThinking={isAiThinking}
          history={history}
          onUndo={onUndo}
          onNewGame={onNewGame}
        />
      </div>
    </div>
  )
}
