'use client'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'
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
      <Button
        variant="ghost"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'h-auto w-full justify-between px-3 py-2.5',
          destructive &&
            'text-destructive hover:bg-destructive/10 hover:text-destructive'
        )}
      >
        {label}
        {kbd && <Kbd>{kbd}</Kbd>}
      </Button>
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
