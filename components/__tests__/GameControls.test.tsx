import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { GameControls } from '../GameControls'

const defaultProps = {
  onNewGame: vi.fn(),
  onUndo: vi.fn(),
  canUndo: true,
  isAiThinking: false,
}

function renderControls(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides }

  for (const fn of Object.values(props)) {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      ;(fn as ReturnType<typeof vi.fn>).mockClear()
    }
  }
  return render(<GameControls {...props} />)
}

describe('GameControls', () => {
  describe('New Game button', () => {
    test('calls onNewGame when clicked', () => {
      const onNewGame = vi.fn()
      renderControls({ onNewGame })
      fireEvent.click(screen.getByRole('button', { name: /new game/i }))
      expect(onNewGame).toHaveBeenCalledTimes(1)
    })
  })

  describe('Undo button', () => {
    test('calls onUndo when clicked', () => {
      const onUndo = vi.fn()
      renderControls({ onUndo, canUndo: true })
      fireEvent.click(screen.getByRole('button', { name: /undo/i }))
      expect(onUndo).toHaveBeenCalledTimes(1)
    })

    test('is disabled when canUndo=false', () => {
      renderControls({ canUndo: false })
      expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
    })

    test('is disabled when isAiThinking=true', () => {
      renderControls({ canUndo: true, isAiThinking: true })
      expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
    })
  })

  describe('removed controls', () => {
    test('does not render a difficulty selector', () => {
      renderControls()
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })

    test('does not render a flip board button', () => {
      renderControls()
      expect(screen.queryByRole('button', { name: /flip board/i })).not.toBeInTheDocument()
    })
  })
})
