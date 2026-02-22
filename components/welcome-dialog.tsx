'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface WelcomeDialogProps {
  defaultName: string
  isOpen: boolean
  onSubmit: (name: string) => void
}

export function WelcomeDialog({
  isOpen,
  defaultName,
  onSubmit,
}: WelcomeDialogProps) {
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
        className="w-full max-w-xs gap-3 p-5"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-base">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            autoComplete="name"
            autoFocus
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            type="text"
            value={name}
          />
          <Button className="w-full" disabled={!name.trim()} type="submit">
            {t('play')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
