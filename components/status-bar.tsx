'use client'

import { josa } from 'es-hangul'
import { useLocale, useTranslations } from 'next-intl'
import { GameDrawer } from '@/components/game-drawer'
import { Progress } from '@/components/ui/progress'
import type { Evaluation, GameOverReason, Move } from '@/lib/types'
import { evalToWhitePercent } from '@/lib/win-probability'

interface StatusBarProps {
  blackName: string
  canUndo: boolean
  evaluation: Evaluation | null
  gameOverReason: GameOverReason | null
  history: Move[]
  isAiThinking: boolean
  isGameOver: boolean
  isInCheck: boolean
  onNewGame: () => void
  onUndo: () => void
  turn: 'w' | 'b'
  whiteName: string
}

const ITEM =
  'inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 whitespace-nowrap transition-colors hover:bg-white/6'

function getMoveNumber(history: Move[]): number {
  return Math.floor(history.length / 2) + 1
}

function getLastMove(history: Move[]): string | null {
  if (history.length === 0) {
    return null
  }
  const last = history.at(-1)
  return last?.san ?? null
}

function dotClassName(turn: 'w' | 'b', isAiThinking: boolean): string {
  if (isAiThinking) {
    return 'bg-primary animate-pulse'
  }
  if (turn === 'w') {
    return 'bg-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.15)]'
  }
  return 'bg-muted-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.1)]'
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
      checkmate: t('gameOver.checkmate', { winner }),
      stalemate: t('gameOver.stalemate'),
      'threefold-repetition': t('gameOver.threefoldRepetition'),
      '50-move-rule': t('gameOver.fiftyMoveRule'),
      'insufficient-material': t('gameOver.insufficientMaterial'),
    }
    return reasonMap[reason] ?? t('gameOver.default')
  }

  return (
    <div className="absolute bottom-[max(12px,env(safe-area-inset-bottom,12px))] left-1/2 z-20 flex h-8 -translate-x-1/2 select-none items-center justify-between gap-1 rounded-full border border-border bg-white/6 px-3.5 font-sans text-muted-foreground text-xs shadow-[0_2px_8px_rgba(0,0,0,0.3)] backdrop-blur-[16px]">
      <div className="flex items-center gap-0.5">
        {isGameOver && gameOverReason ? (
          <span className={`${ITEM} font-medium text-foreground`}>
            {getGameOverLabel(gameOverReason)}
          </span>
        ) : (
          <>
            <span className={ITEM}>
              <span
                className={`size-[7px] shrink-0 rounded-full ${dotClassName(turn, isAiThinking)}`}
              />
              {t('turn', { name: turn === 'w' ? whiteName : blackName })}
            </span>
            {isInCheck && (
              <span className={`${ITEM} text-warning`}>{t('check')}</span>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        {whitePercent !== null && !isGameOver && (
          <span className={`${ITEM} text-muted-foreground tabular-nums`}>
            {t('winProbability', { name: winProbName })}
            <Progress
              className="inline-block h-1.5 w-8 bg-muted-foreground/40 align-middle"
              indicatorClassName="bg-foreground"
              value={whitePercent}
            />
            {whitePercent}%
          </span>
        )}
        {lastMove && (
          <span className={`${ITEM} text-muted-foreground`}>{lastMove}</span>
        )}
        <span className={`${ITEM} text-muted-foreground`}>
          {t('move', { moveNumber })}
        </span>
        <GameDrawer
          canUndo={canUndo}
          history={history}
          isAiThinking={isAiThinking}
          onNewGame={onNewGame}
          onUndo={onUndo}
        />
      </div>
    </div>
  )
}
