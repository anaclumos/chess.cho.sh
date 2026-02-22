import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock react-chessboard — it uses canvas/WebGL which jsdom cannot handle
const mockChessboard = vi.fn()
vi.mock('react-chessboard', () => ({
  Chessboard: (props: Record<string, unknown>) => {
    mockChessboard(props)
    return <div data-testid="chessboard" />
  },
}))

vi.mock('../PromotionDialog', () => ({
  PromotionDialog: ({
    isOpen,
    color,
    onSelect,
  }: {
    isOpen: boolean
    color: string
    onSelect: (piece: string) => void
  }) =>
    isOpen ? (
      <div data-testid="promotion-dialog" data-color={color}>
        <button type="button" onClick={() => onSelect('q')}>
          Queen
        </button>
        <button type="button" onClick={() => onSelect('r')}>
          Rook
        </button>
        <button type="button" onClick={() => onSelect('b')}>
          Bishop
        </button>
        <button type="button" onClick={() => onSelect('n')}>
          Knight
        </button>
      </div>
    ) : null,
}))

import { Board } from '../Board'

const defaultProps = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  turn: 'w' as const,
  boardOrientation: 'white' as const,
  isAiThinking: false,
  isGameOver: false,
  makeMove: vi.fn(() => true),
  isPromotion: vi.fn(() => false),
}

function getOptions() {
  return mockChessboard.mock.calls[0][0].options
}

function dropPiece(from: string, to: string, pieceType = 'wP') {
  return getOptions().onPieceDrop({
    piece: { isSparePiece: false, position: from, pieceType },
    sourceSquare: from,
    targetSquare: to,
  })
}

function checkCanDrag(pieceType: string, square = 'e2') {
  return getOptions().canDragPiece({
    isSparePiece: false,
    piece: { pieceType },
    square,
  })
}

describe('Board', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    test('renders Chessboard with correct FEN position', () => {
      render(<Board {...defaultProps} />)
      expect(getOptions().position).toBe(defaultProps.fen)
    })

    test('passes boardOrientation to Chessboard', () => {
      render(<Board {...defaultProps} boardOrientation="black" />)
      expect(getOptions().boardOrientation).toBe('black')
    })

    test('renders chessboard element', () => {
      render(<Board {...defaultProps} />)
      expect(screen.getByTestId('chessboard')).toBeInTheDocument()
    })
  })

  describe('onPieceDrop', () => {
    test('triggers makeMove when no promotion', () => {
      const makeMove = vi.fn(() => true)
      const isPromotion = vi.fn(() => false)
      render(
        <Board
          {...defaultProps}
          makeMove={makeMove}
          isPromotion={isPromotion}
        />
      )

      const result = dropPiece('e2', 'e4')

      expect(isPromotion).toHaveBeenCalledWith('e2', 'e4')
      expect(makeMove).toHaveBeenCalledWith('e2', 'e4')
      expect(result).toBe(true)
    })

    test('returns false when makeMove fails (illegal move)', () => {
      const makeMove = vi.fn(() => false)
      const isPromotion = vi.fn(() => false)
      render(
        <Board
          {...defaultProps}
          makeMove={makeMove}
          isPromotion={isPromotion}
        />
      )

      const result = dropPiece('e2', 'e5')
      expect(result).toBe(false)
    })
  })

  describe('canDragPiece', () => {
    test('prevents moving opponent pieces (black piece on white turn)', () => {
      render(<Board {...defaultProps} turn="w" />)
      // 'bP' pieceType: 'b' prefix = black; turn is 'w' → NOT draggable
      expect(checkCanDrag('bP', 'd7')).toBe(false)
    })

    test('allows moving own pieces (white piece on white turn)', () => {
      render(<Board {...defaultProps} turn="w" />)
      expect(checkCanDrag('wP', 'e2')).toBe(true)
    })

    test('allows moving own pieces (black piece on black turn)', () => {
      render(<Board {...defaultProps} turn="b" />)
      expect(checkCanDrag('bN', 'b8')).toBe(true)
    })

    test('disables dragging when isAiThinking is true', () => {
      render(<Board {...defaultProps} isAiThinking={true} turn="w" />)
      expect(checkCanDrag('wP', 'e2')).toBe(false)
    })

    test('disables dragging when isGameOver is true', () => {
      render(<Board {...defaultProps} isGameOver={true} turn="w" />)
      expect(checkCanDrag('wP', 'e2')).toBe(false)
    })
  })

  describe('promotion', () => {
    test('shows PromotionDialog when isPromotion returns true', () => {
      const isPromotion = vi.fn(() => true)
      render(<Board {...defaultProps} isPromotion={isPromotion} />)

      act(() => {
        dropPiece('e7', 'e8')
      })

      expect(screen.getByTestId('promotion-dialog')).toBeInTheDocument()
    })

    test('does not show PromotionDialog for normal moves', () => {
      render(<Board {...defaultProps} />)

      act(() => {
        dropPiece('e2', 'e4')
      })

      expect(screen.queryByTestId('promotion-dialog')).not.toBeInTheDocument()
    })

    test('calls makeMove with promotion piece when selected', () => {
      const makeMove = vi.fn(() => true)
      const isPromotion = vi.fn(() => true)
      render(
        <Board
          {...defaultProps}
          makeMove={makeMove}
          isPromotion={isPromotion}
        />
      )

      act(() => {
        dropPiece('e7', 'e8')
      })

      act(() => {
        fireEvent.click(screen.getByText('Queen'))
      })

      expect(makeMove).toHaveBeenCalledWith('e7', 'e8', 'q')
    })

    test('closes PromotionDialog after piece selection', () => {
      const isPromotion = vi.fn(() => true)
      render(<Board {...defaultProps} isPromotion={isPromotion} />)

      act(() => {
        dropPiece('e7', 'e8')
      })

      expect(screen.getByTestId('promotion-dialog')).toBeInTheDocument()

      act(() => {
        fireEvent.click(screen.getByText('Rook'))
      })

      expect(screen.queryByTestId('promotion-dialog')).not.toBeInTheDocument()
    })

    test('passes correct color to PromotionDialog', () => {
      const isPromotion = vi.fn(() => true)
      render(
        <Board {...defaultProps} turn="w" isPromotion={isPromotion} />
      )

      act(() => {
        dropPiece('e7', 'e8')
      })

      expect(screen.getByTestId('promotion-dialog')).toHaveAttribute(
        'data-color',
        'w'
      )
    })

    test('onPieceDrop returns false during pending promotion (no immediate move)', () => {
      const makeMove = vi.fn(() => true)
      const isPromotion = vi.fn(() => true)
      render(
        <Board
          {...defaultProps}
          makeMove={makeMove}
          isPromotion={isPromotion}
        />
      )

      let result: boolean
      act(() => {
        result = dropPiece('e7', 'e8')
      })

      expect(result!).toBe(false)
      expect(makeMove).not.toHaveBeenCalled()
    })
  })
})
