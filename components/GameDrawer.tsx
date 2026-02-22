'use client'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import type { Move } from '@/lib/types'

interface GameDrawerProps {
  canUndo: boolean
  isAiThinking: boolean
  history: Move[]
  onUndo: () => void
  onNewGame: () => void
}

function DrawerAction({
  label,
  kbd,
  disabled,
  destructive,
  onClick,
}: {
  label: string
  kbd?: string
  disabled?: boolean
  destructive?: boolean
  onClick: () => void
}) {
  return (
    <DrawerClose asChild>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-120
          ${destructive ? 'text-destructive hover:bg-destructive/10' : 'text-foreground hover:bg-accent'}
          disabled:pointer-events-none disabled:opacity-30`}
      >
        {label}
        {kbd && (
          <span className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {kbd}
          </span>
        )}
      </button>
    </DrawerClose>
  )
}

export function GameDrawer({
  canUndo,
  isAiThinking,
  history,
  onUndo,
  onNewGame,
}: GameDrawerProps) {
  const moveCount = Math.floor(history.length / 2) + (history.length % 2)
  const hasHistory = history.length > 0

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="status-bar-action"
          aria-label="Options"
        >
          ⋯
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Game</DrawerTitle>
            {hasHistory && (
              <p className="text-sm text-muted-foreground">
                {moveCount} move{moveCount !== 1 ? 's' : ''} played
              </p>
            )}
          </DrawerHeader>
          <div className="flex flex-col gap-0.5 px-4 pb-6">
            <DrawerAction
              label="New Game"
              onClick={onNewGame}
              disabled={isAiThinking}
              destructive={hasHistory}
            />
            <DrawerAction
              label="Undo"
              kbd="⌘Z"
              onClick={onUndo}
              disabled={!canUndo}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
