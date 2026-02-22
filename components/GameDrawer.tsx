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
import { useTranslations, useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'
import { locales } from '@/i18n/config'
import type { Move } from '@/lib/types'

interface GameDrawerProps {
  canUndo: boolean
  isAiThinking: boolean
  history: Move[]
  onUndo: () => void
  onNewGame: () => void
}

function switchLocale(current: Locale) {
  const next = locales.find((l) => l !== current) ?? locales[0]
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
  const url = new URL(window.location.href)
  url.searchParams.set('lang', next)
  window.location.href = url.toString()
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
  const t = useTranslations('GameDrawer')
  const locale = useLocale() as Locale
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
            <DrawerTitle>{t('title')}</DrawerTitle>
            {hasHistory && (
              <p className="text-sm text-muted-foreground">
                {t('movesPlayed', { count: moveCount })}
              </p>
            )}
          </DrawerHeader>
          <div className="flex flex-col gap-0.5 px-4 pb-6">
            <DrawerAction
              label={t('newGame')}
              onClick={onNewGame}
              disabled={isAiThinking}
              destructive={hasHistory}
            />
            <DrawerAction
              label={t('undo')}
              kbd="⌘Z"
              onClick={onUndo}
              disabled={!canUndo}
            />
            <div className="my-1 h-px bg-border" />
            <DrawerAction
              label={t('language')}
              onClick={() => switchLocale(locale)}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
