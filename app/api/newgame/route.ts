import { NextResponse } from 'next/server'
import { newGame } from '@/lib/engine/stockfish'

export async function POST() {
  try {
    await newGame()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Engine error: failed to start new game' },
      { status: 500 }
    )
  }
}
