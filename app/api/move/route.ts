import { NextRequest, NextResponse } from 'next/server'
import { Chess } from 'chess.js'
import { getBestMove } from '@/lib/engine/stockfish'
import { getPreset } from '@/lib/engine/difficulty'

export async function POST(request: NextRequest) {
  let body: { fen?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { fen } = body

  if (!fen || typeof fen !== 'string') {
    return NextResponse.json(
      { error: 'Missing required field: fen' },
      { status: 400 }
    )
  }

  try {
    new Chess(fen)
  } catch {
    return NextResponse.json(
      { error: `Invalid FEN: "${fen}"` },
      { status: 400 }
    )
  }

  const preset = getPreset()

  try {
    const result = await getBestMove(fen, preset)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Engine error: failed to compute move' },
      { status: 500 }
    )
  }
}
