import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChessGame } from '../useChessGame'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

describe('useChessGame - initial state', () => {
  test('starts with starting position FEN', () => {
    const { result } = renderHook(() => useChessGame())
    expect(result.current.fen).toBe(STARTING_FEN)
  })

  test('starts with empty history', () => {
    const { result } = renderHook(() => useChessGame())
    expect(result.current.history).toHaveLength(0)
  })

  test('starts with isGameOver=false', () => {
    const { result } = renderHook(() => useChessGame())
    expect(result.current.isGameOver).toBe(false)
  })

  test('starts with turn=w (white)', () => {
    const { result } = renderHook(() => useChessGame())
    expect(result.current.turn).toBe('w')
  })

  test('starts with isAiThinking=false', () => {
    const { result } = renderHook(() => useChessGame())
    expect(result.current.isAiThinking).toBe(false)
  })

  test('starts with boardOrientation=white', () => {
    const { result } = renderHook(() => useChessGame())
    expect(result.current.boardOrientation).toBe('white')
  })

  test('starts with isInCheck=false', () => {
    const { result } = renderHook(() => useChessGame())
    expect(result.current.isInCheck).toBe(false)
  })

  test('starts with gameOverReason=null', () => {
    const { result } = renderHook(() => useChessGame())
    expect(result.current.gameOverReason).toBeNull()
  })
})

describe('useChessGame - makeMove', () => {
  test('makes a legal move and updates FEN', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      const success = result.current.makeMove('e2', 'e4')
      expect(success).toBe(true)
    })

    expect(result.current.fen).not.toBe(STARTING_FEN)
    expect(result.current.turn).toBe('b')
  })

  test('adds move to history after legal move', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.makeMove('e2', 'e4')
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].san).toBe('e4')
  })

  test('returns false for illegal move and leaves state unchanged', () => {
    const { result } = renderHook(() => useChessGame())
    const fenBefore = result.current.fen

    act(() => {
      const success = result.current.makeMove('e2', 'e5') // illegal
      expect(success).toBe(false)
    })

    expect(result.current.fen).toBe(fenBefore)
    expect(result.current.history).toHaveLength(0)
  })

  test('accepts promotion param for pawn promotion moves', () => {
    const { result } = renderHook(() => useChessGame())

    // Load a position with pawn about to promote
    act(() => {
      result.current.loadFen('8/P7/8/8/8/8/8/k1K5 w - - 0 1')
    })

    act(() => {
      const success = result.current.makeMove('a7', 'a8', 'q')
      expect(success).toBe(true)
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].promotion).toBe('q')
  })
})

describe('useChessGame - undoMove', () => {
  test('undoes 2 half-moves (restores to position before user move)', () => {
    const { result } = renderHook(() => useChessGame())

    // Make user move + simulate AI move
    act(() => {
      result.current.makeMove('e2', 'e4') // user move
    })
    act(() => {
      result.current.applyAiMove('e7', 'e5') // AI move
    })

    expect(result.current.history).toHaveLength(2)

    act(() => {
      const success = result.current.undoMove()
      expect(success).toBe(true)
    })

    expect(result.current.fen).toBe(STARTING_FEN)
    expect(result.current.history).toHaveLength(0)
    expect(result.current.turn).toBe('w')
  })

  test('returns false when no moves to undo', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      const success = result.current.undoMove()
      expect(success).toBe(false)
    })

    expect(result.current.fen).toBe(STARTING_FEN)
  })

  test('returns false when only 1 move made (cannot undo partial AI turn)', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.makeMove('e2', 'e4') // only user's move, no AI yet
    })

    act(() => {
      const success = result.current.undoMove()
      expect(success).toBe(false)
    })
  })
})

describe('useChessGame - newGame', () => {
  test('resets to starting position', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.makeMove('e2', 'e4')
    })

    act(() => {
      result.current.newGame()
    })

    expect(result.current.fen).toBe(STARTING_FEN)
    expect(result.current.history).toHaveLength(0)
    expect(result.current.isGameOver).toBe(false)
    expect(result.current.gameOverReason).toBeNull()
    expect(result.current.turn).toBe('w')
  })
})

describe('useChessGame - flipBoard', () => {
  test('toggles boardOrientation from white to black', () => {
    const { result } = renderHook(() => useChessGame())
    expect(result.current.boardOrientation).toBe('white')

    act(() => {
      result.current.flipBoard()
    })

    expect(result.current.boardOrientation).toBe('black')
  })

  test('toggles boardOrientation from black back to white', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.flipBoard()
      result.current.flipBoard()
    })

    expect(result.current.boardOrientation).toBe('white')
  })
})

describe('useChessGame - setAiThinking', () => {
  test('sets isAiThinking to true', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.setAiThinking(true)
    })

    expect(result.current.isAiThinking).toBe(true)
  })

  test('sets isAiThinking back to false', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.setAiThinking(true)
      result.current.setAiThinking(false)
    })

    expect(result.current.isAiThinking).toBe(false)
  })
})

describe('useChessGame - isPromotion', () => {
  test('returns true for pawn move to promotion square', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.loadFen('8/P7/8/8/8/8/8/k1K5 w - - 0 1')
    })

    expect(result.current.isPromotion('a7', 'a8')).toBe(true)
  })

  test('returns false for non-promotion pawn move', () => {
    const { result } = renderHook(() => useChessGame())

    expect(result.current.isPromotion('e2', 'e4')).toBe(false)
  })

  test('returns false for non-pawn piece move', () => {
    const { result } = renderHook(() => useChessGame())

    expect(result.current.isPromotion('g1', 'f3')).toBe(false)
  })
})

describe('useChessGame - applyAiMove', () => {
  test('applies AI move to game state', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.makeMove('e2', 'e4') // white's move
    })

    act(() => {
      result.current.applyAiMove('e7', 'e5') // AI (black) responds
    })

    expect(result.current.history).toHaveLength(2)
    expect(result.current.turn).toBe('w') // back to white
  })
})

describe('useChessGame - game-over detection', () => {
  test("detects checkmate (Fool's Mate)", () => {
    const { result } = renderHook(() => useChessGame())

    // Fool's Mate: 1. f3 e5 2. g4 Qh4#
    act(() => { result.current.makeMove('f2', 'f3') })
    act(() => { result.current.applyAiMove('e7', 'e5') })
    act(() => { result.current.makeMove('g2', 'g4') })
    act(() => { result.current.applyAiMove('d8', 'h4') })

    expect(result.current.isGameOver).toBe(true)
    expect(result.current.gameOverReason).toBe('checkmate')
  })

  test('detects stalemate', () => {
    const { result } = renderHook(() => useChessGame())

    // Black to move, stalemated
    act(() => {
      result.current.loadFen('k7/8/1Q6/8/8/8/8/K7 b - - 0 1')
    })

    expect(result.current.isGameOver).toBe(true)
    expect(result.current.gameOverReason).toBe('stalemate')
  })

  test('detects check state (isInCheck)', () => {
    const { result } = renderHook(() => useChessGame())

    // White king in check from black rook on h1
    act(() => {
      result.current.loadFen('4k3/8/8/8/8/8/8/4K2r w - - 0 1')
    })

    expect(result.current.isInCheck).toBe(true)
  })
})
