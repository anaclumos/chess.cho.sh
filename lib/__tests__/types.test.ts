import { describe, test, expect } from 'vitest'
import {
  isDifficultyPreset,
  isMoveResponse,
  type DifficultyPreset,
  type MoveResponse,
  type GameState,
  type Move,
} from '../types'

describe('isDifficultyPreset', () => {
  test('returns true for valid DifficultyPreset', () => {
    const preset: DifficultyPreset = {
      name: 'beginner',
      label: 'Beginner',
      skillLevel: 0,
      movetime: 500,
      description: '~1320 ELO',
    }
    expect(isDifficultyPreset(preset)).toBe(true)
  })

  test('returns false for missing fields', () => {
    expect(isDifficultyPreset({ name: 'beginner' })).toBe(false)
  })

  test('returns false for null', () => {
    expect(isDifficultyPreset(null)).toBe(false)
  })

  test('returns false for non-object', () => {
    expect(isDifficultyPreset('string')).toBe(false)
    expect(isDifficultyPreset(42)).toBe(false)
  })

  test('returns false when skillLevel is string instead of number', () => {
    expect(
      isDifficultyPreset({
        name: 'b',
        label: 'B',
        skillLevel: '0',
        movetime: 500,
        description: 'x',
      })
    ).toBe(false)
  })
})

describe('isMoveResponse', () => {
  test('returns true for valid MoveResponse with move', () => {
    const response: MoveResponse = {
      bestMove: 'e2e4',
      from: 'e2',
      to: 'e4',
      isGameOver: false,
    }
    expect(isMoveResponse(response)).toBe(true)
  })

  test('returns true for game-over response (null bestMove)', () => {
    const response: MoveResponse = {
      bestMove: null,
      from: '',
      to: '',
      isGameOver: true,
    }
    expect(isMoveResponse(response)).toBe(true)
  })

  test('returns false for missing fields', () => {
    expect(isMoveResponse({ bestMove: 'e2e4' })).toBe(false)
  })

  test('returns false for null', () => {
    expect(isMoveResponse(null)).toBe(false)
  })
})

describe('type imports compile correctly', () => {
  test('GameState type is importable', () => {
    const state: GameState = {
      currentFen:
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      history: [],
      isGameOver: false,
      gameOverReason: null,
      turn: 'w',
      isAiThinking: false,
      boardOrientation: 'white',
      isInCheck: false,
    }
    expect(state.turn).toBe('w')
  })

  test('Move type is importable', () => {
    const move: Move = {
      from: 'e2',
      to: 'e4',
      san: 'e4',
      color: 'w',
      piece: 'p',
    }
    expect(move.from).toBe('e2')
  })
})
