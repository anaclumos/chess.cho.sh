'use client'

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
  { key: 'q', label: 'Queen', white: '♕', black: '♛' },
  { key: 'r', label: 'Rook', white: '♖', black: '♜' },
  { key: 'b', label: 'Bishop', white: '♗', black: '♝' },
  { key: 'n', label: 'Knight', white: '♘', black: '♞' },
] as const

export function PromotionDialog({ isOpen, color, onSelect }: PromotionDialogProps) {
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
            Promote to
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose a piece to promote your pawn to
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          {PIECES.map(({ key, label, white, black }) => (
            <Button
              key={key}
              variant="outline"
              onClick={() => onSelect(key)}
              aria-label={label}
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
