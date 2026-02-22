/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { EventEmitter } from 'events'
// child_process is mocked via vi.mock below
import {
  initEngine,
  getBestMove,
  newGame,
  _resetForTesting,
} from '../stockfish'
import { getPreset } from '../difficulty'

const { mockSpawn } = vi.hoisted(() => ({
  mockSpawn: vi.fn(),
}))

vi.mock('child_process', () => ({
  spawn: mockSpawn,
  default: { spawn: mockSpawn },
}))

const spawnMock = mockSpawn

function createMockStockfish() {
  const stdout = new EventEmitter() as NodeJS.ReadableStream & EventEmitter
  const stdin = { write: vi.fn() }
  const proc = new EventEmitter() as any
  proc.stdout = stdout
  proc.stdin = stdin
  proc.kill = vi.fn()
  return { proc, stdout, stdin }
}

function emitResponse(stdout: EventEmitter, data: string, delayMs = 10) {
  setTimeout(() => stdout.emit('data', Buffer.from(data + '\n')), delayMs)
}

describe('Stockfish Engine Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    _resetForTesting()
  })

  describe('initEngine', () => {
    test('sends uci command on init and waits for uciok', async () => {
      const { proc, stdout, stdin } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'Stockfish 17 by T. Romstad et al.')
      emitResponse(stdout, 'uciok', 20)
      emitResponse(stdout, 'readyok', 30)

      await initEngine()

      expect(stdin.write).toHaveBeenCalledWith('uci\n')
      expect(stdin.write).toHaveBeenCalledWith('isready\n')
    })
  })

  describe('getBestMove', () => {
    test('returns valid move for a starting position', async () => {
      const { proc, stdout } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      const preset = getPreset('intermediate')

      emitResponse(stdout, 'info depth 10 score cp 30')
      emitResponse(stdout, 'bestmove e2e4 ponder e7e5', 50)

      const result = await getBestMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        preset
      )

      expect(result.bestMove).toBe('e2e4')
      expect(result.from).toBe('e2')
      expect(result.to).toBe('e4')
      expect(result.isGameOver).toBe(false)
      expect(result.promotion).toBeUndefined()
      expect(result.evaluation).toEqual({ type: 'cp', value: 30 })
    })

    test('captures mate evaluation from info lines', async () => {
      const { proc, stdout } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      const preset = getPreset('intermediate')

      emitResponse(stdout, 'info depth 15 score mate 3')
      emitResponse(stdout, 'bestmove e2e4', 50)

      const result = await getBestMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        preset
      )

      expect(result.evaluation).toEqual({ type: 'mate', value: 3 })
    })

    test('uses last info line evaluation when multiple are emitted', async () => {
      const { proc, stdout } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      const preset = getPreset()

      emitResponse(stdout, 'info depth 5 score cp 10')
      emitResponse(stdout, 'info depth 10 score cp 25', 20)
      emitResponse(stdout, 'info depth 20 score cp 42', 30)
      emitResponse(stdout, 'bestmove d2d4', 50)

      const result = await getBestMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        preset
      )

      expect(result.evaluation).toEqual({ type: 'cp', value: 42 })
    })

    test('returns undefined evaluation when no info lines emitted', async () => {
      const { proc, stdout } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      const preset = getPreset('beginner')
      emitResponse(stdout, 'bestmove a7a8q', 50)

      const result = await getBestMove(
        '8/P7/8/8/8/8/8/k1K5 w - - 0 1',
        preset
      )

      expect(result.evaluation).toBeUndefined()
    })

    test('parses promotion moves correctly', async () => {
      const { proc, stdout } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      const preset = getPreset('beginner')
      emitResponse(stdout, 'bestmove a7a8q', 50)

      const result = await getBestMove(
        '8/P7/8/8/8/8/8/k1K5 w - - 0 1',
        preset
      )

      expect(result.bestMove).toBe('a7a8q')
      expect(result.from).toBe('a7')
      expect(result.to).toBe('a8')
      expect(result.promotion).toBe('q')
      expect(result.isGameOver).toBe(false)
    })

    test('handles bestmove (none) as game-over', async () => {
      const { proc, stdout } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      const preset = getPreset('beginner')
      emitResponse(stdout, 'bestmove (none)', 50)

      const result = await getBestMove(
        'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
        preset
      )

      expect(result.bestMove).toBeNull()
      expect(result.isGameOver).toBe(true)
    })

    test('rejects invalid FEN before sending to Stockfish', async () => {
      const { proc, stdout } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      const preset = getPreset('beginner')

      await expect(getBestMove('not-a-valid-fen', preset)).rejects.toThrow(
        /invalid fen/i
      )
    })

    test('sends correct UCI commands to Stockfish', async () => {
      const { proc, stdout, stdin } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      const preset = getPreset()
      emitResponse(stdout, 'readyok', 30)
      emitResponse(stdout, 'bestmove d2d4', 50)

      const fen =
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      await getBestMove(fen, preset)

      const writeCalls = stdin.write.mock.calls.map((c: any) => c[0])
      expect(writeCalls).toContain(
        'setoption name Skill Level value 20\n'
      )
      expect(writeCalls).toContain(`position fen ${fen}\n`)
      expect(writeCalls).toContain('go movetime 5000\n')
    })

    test('handles partial stdout chunks (line buffering)', async () => {
      const { proc, stdout } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      const preset = getPreset('beginner')

      setTimeout(() => stdout.emit('data', Buffer.from('bestmo')), 40)
      setTimeout(() => stdout.emit('data', Buffer.from('ve e2')), 50)
      setTimeout(() => stdout.emit('data', Buffer.from('e4\n')), 60)

      const result = await getBestMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        preset
      )

      expect(result.bestMove).toBe('e2e4')
    })
  })

  describe('newGame', () => {
    test('sends ucinewgame and isready, waits for readyok', async () => {
      const { proc, stdout, stdin } = createMockStockfish()
      spawnMock.mockReturnValue(proc as any)

      emitResponse(stdout, 'uciok', 10)
      emitResponse(stdout, 'readyok', 20)
      await initEngine()

      emitResponse(stdout, 'readyok', 30)
      await newGame()

      const writeCalls = stdin.write.mock.calls.map((c: any) => c[0])
      expect(writeCalls).toContain('ucinewgame\n')
    })
  })

  describe('crash recovery', () => {
    test('auto-respawns process on next call after crash', async () => {
      const { proc: proc1, stdout: stdout1 } = createMockStockfish()
      const { proc: proc2, stdout: stdout2 } = createMockStockfish()

      let callCount = 0
      spawnMock.mockImplementation(() => {
        callCount++
        return callCount === 1 ? (proc1 as any) : (proc2 as any)
      })

      emitResponse(stdout1, 'uciok', 10)
      emitResponse(stdout1, 'readyok', 20)
      await initEngine()

      setTimeout(() => proc1.emit('close', 1), 30)
      await new Promise((r) => setTimeout(r, 50))

      emitResponse(stdout2, 'uciok', 10)
      emitResponse(stdout2, 'readyok', 20)
      emitResponse(stdout2, 'bestmove e2e4', 50)

      const preset = getPreset('beginner')
      const result = await getBestMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        preset
      )

      expect(callCount).toBe(2)
      expect(result.bestMove).toBe('e2e4')
    })
  })
})
