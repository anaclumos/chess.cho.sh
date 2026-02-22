import { describe, test, expect, vi, beforeEach } from 'vitest'

const { mockNewGame } = vi.hoisted(() => ({
  mockNewGame: vi.fn(),
}))

vi.mock('@/lib/engine/stockfish', () => ({
  newGame: mockNewGame,
  getBestMove: vi.fn(),
  initEngine: vi.fn(),
}))

import { POST } from '../route'

describe('POST /api/newgame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns 200 with success message', async () => {
    mockNewGame.mockResolvedValue(undefined)

    const res = await POST()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(mockNewGame).toHaveBeenCalledOnce()
  })

  test('returns 500 when newGame() throws', async () => {
    mockNewGame.mockRejectedValue(new Error('Engine not responding'))

    const res = await POST()
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toMatch(/engine/i)
  })
})
