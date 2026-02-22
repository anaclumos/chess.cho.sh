'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Kbd } from '@/components/ui/kbd'
import type { Locale } from '@/i18n/config'
import { locales } from '@/i18n/config'
import type { Move } from '@/lib/types'
import { cn } from '@/lib/utils'

interface GameDrawerProps {
  canUndo: boolean
  history: Move[]
  isAiThinking: boolean
  onNewGame: () => void
  onUndo: () => void
}

function switchLocale(current: Locale) {
  const next = locales.find((l) => l !== current) ?? locales[0]
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not universally supported
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
        className={cn(
          'h-auto w-full justify-between px-3 py-2.5',
          destructive &&
            'text-destructive hover:bg-destructive/10 hover:text-destructive'
        )}
        disabled={disabled}
        onClick={onClick}
        variant="ghost"
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
          aria-label="Options"
          className="inline-flex cursor-pointer items-center gap-[5px] whitespace-nowrap rounded-[4px] px-2 py-0.5 text-muted-foreground transition-[background,color] duration-[120ms] hover:bg-white/6 hover:text-foreground disabled:cursor-default disabled:opacity-30"
          type="button"
        >
          ⋯
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{t('title')}</DrawerTitle>
            {hasHistory && (
              <p className="text-muted-foreground text-sm">
                {t('movesPlayed', { count: moveCount })}
              </p>
            )}
          </DrawerHeader>
          <div className="flex flex-col gap-0.5 px-4 pb-6">
            <DrawerAction
              destructive={hasHistory}
              disabled={isAiThinking}
              label={t('newGame')}
              onClick={onNewGame}
            />
            <DrawerAction
              disabled={!canUndo}
              kbd="⌘Z"
              label={t('undo')}
              onClick={onUndo}
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
