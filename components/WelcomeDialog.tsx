'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WelcomeDialogProps {
  isOpen: boolean
  defaultName: string
  onSubmit: (name: string) => void
}

export function WelcomeDialog({ isOpen, defaultName, onSubmit }: WelcomeDialogProps) {
  const t = useTranslations('WelcomeDialog')
  const [name, setName] = useState(defaultName)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = name.trim()
      if (trimmed) {
        onSubmit(trimmed)
      }
    },
    [name, onSubmit]
  )

  return (
    <Dialog open={isOpen}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="w-full max-w-xs gap-3 p-5"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-base">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            autoFocus
            autoComplete="name"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full"
          >
            {t('play')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}