'use client'

import { useEffect, useRef } from 'react'
import type { Move } from '@/lib/types'

interface MoveHistoryProps {
  history: Move[]
}

export function MoveHistory({ history }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [history])

  if (history.length === 0) {
    return (
      <div className="text-sm italic text-amber-700/50">No moves yet</div>
    )
  }

  const movePairs: Array<[Move, Move | undefined]> = []
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push([history[i], history[i + 1]])
  }

  return (
    <div className="h-full overflow-y-auto font-mono text-sm">
      <div className="space-y-0.5">
        {movePairs.map(([white, black], idx) => (
          <div
            key={white.san + idx}
            className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-amber-50"
          >
            <span className="w-6 text-xs text-amber-600/60">{idx + 1}.</span>
            <span className="w-16 font-medium text-amber-950">{white.san}</span>
            <span className="w-16 text-amber-800">{black?.san ?? ''}</span>
          </div>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
