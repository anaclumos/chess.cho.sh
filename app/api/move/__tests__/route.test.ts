import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockGetBestMove, mockNewGame, mockInitEngine } = vi.hoisted(() => ({
  mockGetBestMove: vi.fn(),
  mockNewGame: vi.fn(),
  mockInitEngine: vi.fn(),
}))

vi.mock('@/lib/engine/stockfish', () => ({
  getBestMove: mockGetBestMove,
  newGame: mockNewGame,
  initEngine: mockInitEngine,
}))


import { POST } from '../route'

const VALID_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/move', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns 200 with bestMove for valid FEN + difficulty', async () => {
    mockGetBestMove.mockResolvedValue({
      bestMove: 'e2e4',
      from: 'e2',
      to: 'e4',
      isGameOver: false,
    })

    const res = await POST(makeRequest({ fen: VALID_FEN, difficulty: 'beginner' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({
      bestMove: 'e2e4',
      from: 'e2',
      to: 'e4',
      isGameOver: false,
    })
    expect(mockGetBestMove).toHaveBeenCalledOnce()
  })

  test('returns promotion field when present', async () => {
    mockGetBestMove.mockResolvedValue({
      bestMove: 'a7a8q',
      from: 'a7',
      to: 'a8',
      promotion: 'q',
      isGameOver: false,
    })

    const res = await POST(makeRequest({ fen: VALID_FEN, difficulty: 'easy' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.promotion).toBe('q')
  })

  test('returns isGameOver: true when engine returns bestmove (none)', async () => {
    mockGetBestMove.mockResolvedValue({
      bestMove: null,
      from: '',
      to: '',
      isGameOver: true,
    })

    const res = await POST(makeRequest({ fen: VALID_FEN, difficulty: 'hard' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({
      bestMove: null,
      from: '',
      to: '',
      isGameOver: true,
    })
  })

  test('returns 400 for invalid FEN string', async () => {
    const res = await POST(makeRequest({ fen: 'not-valid-fen', difficulty: 'beginner' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toMatch(/invalid fen/i)
    expect(mockGetBestMove).not.toHaveBeenCalled()
  })

  test('returns 400 for unknown difficulty name', async () => {
    const res = await POST(makeRequest({ fen: VALID_FEN, difficulty: 'grandmaster' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toMatch(/unknown difficulty/i)
    expect(mockGetBestMove).not.toHaveBeenCalled()
  })

  test('returns 400 when fen is missing', async () => {
    const res = await POST(makeRequest({ difficulty: 'beginner' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toMatch(/fen.*required|missing/i)
  })

  test('returns 400 when difficulty is missing', async () => {
    const res = await POST(makeRequest({ fen: VALID_FEN }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toMatch(/difficulty.*required|missing/i)
  })

  test('returns 400 when body is empty', async () => {
    const res = await POST(makeRequest({}))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeDefined()
  })

  test('returns 500 when engine throws unexpected error', async () => {
    mockGetBestMove.mockRejectedValue(new Error('Stockfish crashed'))

    const res = await POST(makeRequest({ fen: VALID_FEN, difficulty: 'beginner' }))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toMatch(/engine/i)
  })

  test('passes correct preset to getBestMove', async () => {
    mockGetBestMove.mockResolvedValue({
      bestMove: 'd2d4',
      from: 'd2',
      to: 'd4',
      isGameOver: false,
    })

    await POST(makeRequest({ fen: VALID_FEN, difficulty: 'intermediate' }))

    expect(mockGetBestMove).toHaveBeenCalledWith(
      VALID_FEN,
      expect.objectContaining({
        name: 'intermediate',
        skillLevel: 10,
        movetime: 2000,
      })
    )
  })
})
