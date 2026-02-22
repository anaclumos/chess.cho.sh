import { spawn, type ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { Chess } from 'chess.js'
import type { DifficultyPreset, MoveResponse } from '@/lib/types'

const STOCKFISH_PATH =
  process.env.STOCKFISH_PATH ?? '/usr/local/bin/stockfish'
const TIMEOUT_MS = 10_000

let proc: ChildProcess | null = null
let lineEmitter = new EventEmitter()
let buffer = ''

function startProcess(): ChildProcess {
  const p = spawn(STOCKFISH_PATH, [], { stdio: ['pipe', 'pipe', 'pipe'] })
  buffer = ''
  lineEmitter = new EventEmitter()

  p.stdout?.on('data', (chunk: Buffer) => {
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed) lineEmitter.emit('line', trimmed)
    }
  })

  p.on('close', () => {
    proc = null
  })

  p.on('error', () => {
    proc = null
  })

  return p
}

function write(cmd: string): void {
  proc?.stdin?.write(cmd + '\n')
}

function waitForLine(target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      lineEmitter.removeListener('line', handler)
      reject(new Error(`Timeout waiting for "${target}"`))
    }, TIMEOUT_MS)

    function handler(line: string) {
      if (line === target) {
        clearTimeout(timer)
        lineEmitter.removeListener('line', handler)
        resolve()
      }
    }

    lineEmitter.on('line', handler)
  })
}

function waitForBestMove(): Promise<MoveResponse> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      lineEmitter.removeListener('line', handler)
      reject(new Error('Stockfish timeout: no bestmove within 10s'))
    }, TIMEOUT_MS)

    function handler(line: string) {
      if (!line.startsWith('bestmove')) return

      clearTimeout(timer)
      lineEmitter.removeListener('line', handler)

      const parts = line.split(' ')
      const move = parts[1]

      if (!move || move === '(none)') {
        resolve({ bestMove: null, from: '', to: '', isGameOver: true })
        return
      }

      const from = move.slice(0, 2)
      const to = move.slice(2, 4)
      const promotion = move.length === 5 ? move[4] : undefined
      resolve({ bestMove: move, from, to, promotion, isGameOver: false })
    }

    lineEmitter.on('line', handler)
  })
}

async function ensureReady(): Promise<void> {
  if (proc) return
  proc = startProcess()
  write('uci')
  await waitForLine('uciok')
  write('isready')
  await waitForLine('readyok')
}

export async function initEngine(): Promise<void> {
  await ensureReady()
}

export async function newGame(): Promise<void> {
  await ensureReady()
  write('ucinewgame')
  write('isready')
  await waitForLine('readyok')
}

export async function getBestMove(
  fen: string,
  preset: DifficultyPreset
): Promise<MoveResponse> {
  try {
    new Chess(fen)
  } catch {
    throw new Error(`Invalid FEN: ${fen}`)
  }

  await ensureReady()

  write(`setoption name Skill Level value ${preset.skillLevel}`)
  write(`position fen ${fen}`)
  write(`go movetime ${preset.movetime}`)

  return waitForBestMove()
}

export function _resetForTesting(): void {
  proc = null
  lineEmitter = new EventEmitter()
  buffer = ''
}
