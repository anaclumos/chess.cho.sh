import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { GameControls } from '../GameControls'

const defaultProps = {
  onNewGame: vi.fn(),
  onUndo: vi.fn(),
  onFlipBoard: vi.fn(),
  onDifficultyChange: vi.fn(),
  currentDifficulty: 'intermediate',
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

  describe('Difficulty selector', () => {
    test('shows all 5 difficulty presets as options', () => {
      renderControls()
      const select = screen.getByRole('combobox')
      const options = select.querySelectorAll('option')
      expect(options).toHaveLength(5)

      const optionTexts = Array.from(options).map((o) => o.textContent)
      expect(optionTexts).toContain('Beginner')
      expect(optionTexts).toContain('Easy')
      expect(optionTexts).toContain('Intermediate')
      expect(optionTexts).toContain('Hard')
      expect(optionTexts).toContain('Maximum')
    })

    test('shows current difficulty as selected', () => {
      renderControls({ currentDifficulty: 'hard' })
      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('hard')
    })

    test('calls onDifficultyChange with preset name on selection', () => {
      const onDifficultyChange = vi.fn()
      renderControls({ onDifficultyChange })
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'easy' },
      })
      expect(onDifficultyChange).toHaveBeenCalledWith('easy')
      expect(onDifficultyChange).toHaveBeenCalledTimes(1)
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

  describe('Flip Board button', () => {
    test('calls onFlipBoard when clicked', () => {
      const onFlipBoard = vi.fn()
      renderControls({ onFlipBoard })
      fireEvent.click(screen.getByRole('button', { name: /flip board/i }))
      expect(onFlipBoard).toHaveBeenCalledTimes(1)
    })
  })
})
