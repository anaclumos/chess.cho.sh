'use client'

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
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="Choose promotion piece"
    >
      <div className="flex flex-col gap-2 rounded-lg border border-white/[0.06] bg-[#1b1b1f] p-4 shadow-2xl shadow-black/50">
        <p className="mb-1 text-center text-[11px] font-medium uppercase tracking-widest text-[#7d7d85]">
          Promote to
        </p>
        <div className="flex gap-2">
          {PIECES.map(({ key, label, white, black }) => (
            <button
              type="button"
              key={key}
              onClick={() => onSelect(key)}
              aria-label={label}
              className="flex h-14 w-14 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-3xl transition-all duration-120 hover:border-white/[0.12] hover:bg-white/[0.06] active:scale-95"
            >
              <span>
                {color === 'w' ? white : black}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
