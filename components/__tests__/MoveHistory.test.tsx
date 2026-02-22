import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MoveHistory } from '../MoveHistory'
import type { Move } from '@/lib/types'

function makeMove(san: string, color: 'w' | 'b'): Move {
  return { from: 'a1', to: 'a2', san, color, piece: 'p' }
}

describe('MoveHistory', () => {
  test('renders empty state when no moves', () => {
    render(<MoveHistory history={[]} />)
    expect(screen.getByText(/no moves/i)).toBeDefined()
  })

  test('renders move numbers', () => {
    const history = [makeMove('e4', 'w'), makeMove('e5', 'b')]
    render(<MoveHistory history={history} />)
    expect(screen.getByText('1.')).toBeDefined()
  })

  test('renders white and black moves as pair on same row', () => {
    const history = [makeMove('e4', 'w'), makeMove('e5', 'b')]
    render(<MoveHistory history={history} />)
    expect(screen.getByText('e4')).toBeDefined()
    expect(screen.getByText('e5')).toBeDefined()
  })

  test('renders multiple move pairs', () => {
    const history = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('Nf3', 'w'),
      makeMove('Nc6', 'b'),
    ]
    render(<MoveHistory history={history} />)
    expect(screen.getByText('1.')).toBeDefined()
    expect(screen.getByText('2.')).toBeDefined()
    expect(screen.getByText('Nf3')).toBeDefined()
    expect(screen.getByText('Nc6')).toBeDefined()
  })

  test('handles odd number of moves (white moved, black not yet)', () => {
    const history = [makeMove('e4', 'w')]
    render(<MoveHistory history={history} />)
    expect(screen.getByText('e4')).toBeDefined()
  })
})
