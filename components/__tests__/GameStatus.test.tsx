import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { GameStatus } from '../GameStatus'

describe('GameStatus', () => {
  test('renders nothing when game is not over and not in check', () => {
    const { container } = render(
      <GameStatus
        isGameOver={false}
        gameOverReason={null}
        turn="w"
        isInCheck={false}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  test('shows "Check!" when king is in check', () => {
    render(
      <GameStatus
        isGameOver={false}
        gameOverReason={null}
        turn="w"
        isInCheck={true}
      />
    )
    expect(screen.getByText(/check!/i)).toBeDefined()
  })

  test('shows checkmate message when game over by checkmate', () => {
    render(
      <GameStatus
        isGameOver={true}
        gameOverReason="checkmate"
        turn="b"
        isInCheck={false}
      />
    )
    expect(screen.getByText(/checkmate/i)).toBeDefined()
  })

  test('shows stalemate message', () => {
    render(
      <GameStatus
        isGameOver={true}
        gameOverReason="stalemate"
        turn="w"
        isInCheck={false}
      />
    )
    expect(screen.getByText(/stalemate/i)).toBeDefined()
    expect(screen.getByText(/draw/i)).toBeDefined()
  })

  test('shows draw message for threefold repetition', () => {
    render(
      <GameStatus
        isGameOver={true}
        gameOverReason="threefold-repetition"
        turn="w"
        isInCheck={false}
      />
    )
    expect(screen.getByText(/threefold repetition/i)).toBeDefined()
  })

  test('shows draw message for 50-move rule', () => {
    render(
      <GameStatus
        isGameOver={true}
        gameOverReason="50-move-rule"
        turn="w"
        isInCheck={false}
      />
    )
    expect(screen.getByText(/50.move rule/i)).toBeDefined()
  })

  test('shows draw message for insufficient material', () => {
    render(
      <GameStatus
        isGameOver={true}
        gameOverReason="insufficient-material"
        turn="w"
        isInCheck={false}
      />
    )
    expect(screen.getByText(/insufficient material/i)).toBeDefined()
  })
})
