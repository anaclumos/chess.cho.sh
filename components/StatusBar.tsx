'use client'

import { GameDrawer } from '@/components/GameDrawer'
import { Progress } from '@/components/ui/progress'
import type { Evaluation, GameOverReason, Move } from '@/lib/types'
import { evalToWhitePercent } from '@/lib/winProbability'

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
}

function getGameOverLabel(reason: GameOverReason, turn: 'w' | 'b'): string {
  const winner = turn === 'w' ? 'Black' : 'White'
  switch (reason) {
    case 'checkmate':
      return `Checkmate — ${winner} wins`
    case 'stalemate':
      return 'Stalemate'
    case 'threefold-repetition':
      return 'Threefold Repetition'
    case '50-move-rule':
      return '50-Move Rule'
    case 'insufficient-material':
      return 'Insufficient Material'
    default:
      return 'Game Over'
  }
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
}: StatusBarProps) {
  const moveNumber = getMoveNumber(history)
  const lastMove = getLastMove(history)

  const whitePercent = evaluation ? evalToWhitePercent(evaluation) : null
  return (
    <div className="status-bar">
      <div className="status-bar-section">
        {isGameOver && gameOverReason ? (
          <span className="status-bar-item status-bar-game-over">
            {getGameOverLabel(gameOverReason, turn)}
          </span>
        ) : (
          <>
            <span className="status-bar-item">
              <span
                className={`status-bar-dot ${
                  turn === 'w' ? 'status-bar-dot-white' : 'status-bar-dot-black'
                }`}
              />
              {turn === 'w' ? 'White' : 'Black'}
            </span>
            {isInCheck && (
              <span className="status-bar-item status-bar-check">Check</span>
            )}
            {isAiThinking && (
              <span className="status-bar-item status-bar-thinking">
                <span className="status-bar-dot status-bar-dot-pulse" />
                Thinking…
              </span>
            )}
          </>
        )}
      </div>

      <div className="status-bar-section">
        {whitePercent !== null && !isGameOver && (
          <span className="status-bar-item tabular-nums text-muted-foreground">
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
          Move {moveNumber}
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
