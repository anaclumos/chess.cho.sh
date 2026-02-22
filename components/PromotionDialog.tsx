'use client'

import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PromotionDialogProps {
  isOpen: boolean
  color: 'w' | 'b'
  onSelect: (piece: string) => void
}

const PIECES = [
  { key: 'q', labelKey: 'queen' as const, white: '♕', black: '♛' },
  { key: 'r', labelKey: 'rook' as const, white: '♖', black: '♜' },
  { key: 'b', labelKey: 'bishop' as const, white: '♗', black: '♝' },
  { key: 'n', labelKey: 'knight' as const, white: '♘', black: '♞' },
]

export function PromotionDialog({ isOpen, color, onSelect }: PromotionDialogProps) {
  const t = useTranslations('PromotionDialog')

  return (
    <Dialog open={isOpen}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="w-auto max-w-fit gap-2 p-4"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          {PIECES.map(({ key, labelKey, white, black }) => (
            <Button
              key={key}
              variant="outline"
              onClick={() => onSelect(key)}
              aria-label={t(labelKey)}
              className="h-14 w-14 text-3xl"
            >
              {color === 'w' ? white : black}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
