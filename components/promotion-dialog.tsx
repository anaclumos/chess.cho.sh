'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PromotionDialogProps {
  color: 'w' | 'b'
  isOpen: boolean
  onSelect: (piece: string) => void
}

const PIECES = [
  { key: 'q', labelKey: 'queen' as const, white: '♕', black: '♛' },
  { key: 'r', labelKey: 'rook' as const, white: '♖', black: '♜' },
  { key: 'b', labelKey: 'bishop' as const, white: '♗', black: '♝' },
  { key: 'n', labelKey: 'knight' as const, white: '♘', black: '♞' },
]

export function PromotionDialog({
  isOpen,
  color,
  onSelect,
}: PromotionDialogProps) {
  const t = useTranslations('PromotionDialog')

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="w-auto max-w-fit gap-2 p-4"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-center font-medium text-[11px] text-muted-foreground uppercase tracking-widest">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          {PIECES.map(({ key, labelKey, white, black }) => (
            <Button
              aria-label={t(labelKey)}
              className="h-14 w-14 text-3xl"
              key={key}
              onClick={() => onSelect(key)}
              variant="outline"
            >
              {color === 'w' ? white : black}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
