import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
}))

vi.mock('../3d/ChessScene', () => ({
  ChessScene: (props: Record<string, unknown>) => {
    mockChessScene(props)
    return <div data-testid="chess-scene" />
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
      </div>
    ) : null,
}))

const mockChessScene = vi.fn()

import { Board3D } from '../Board3D'

const defaultProps = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  turn: 'w' as const,
  isAiThinking: false,
  isGameOver: false,
  selectedSquare: null as string | null,
  legalMoves: [] as string[],
  onSquareClick: vi.fn(),
}

describe('Board3D', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    test('renders canvas container', () => {
      render(<Board3D {...defaultProps} />)
      expect(screen.getByTestId('canvas')).toBeInTheDocument()
    })

    test('renders chess scene', () => {
      render(<Board3D {...defaultProps} />)
      expect(screen.getByTestId('chess-scene')).toBeInTheDocument()
    })

    test('passes fen to ChessScene', () => {
      render(<Board3D {...defaultProps} />)
      expect(mockChessScene).toHaveBeenCalledWith(
        expect.objectContaining({ fen: defaultProps.fen })
      )
    })

    test('passes turn to ChessScene', () => {
      render(<Board3D {...defaultProps} turn="b" />)
      expect(mockChessScene).toHaveBeenCalledWith(
        expect.objectContaining({ turn: 'b' })
      )
    })

    test('passes selectedSquare to ChessScene', () => {
      render(<Board3D {...defaultProps} selectedSquare="e2" />)
      expect(mockChessScene).toHaveBeenCalledWith(
        expect.objectContaining({ selectedSquare: 'e2' })
      )
    })

    test('passes legalMoves to ChessScene', () => {
      render(<Board3D {...defaultProps} legalMoves={['e3', 'e4']} />)
      expect(mockChessScene).toHaveBeenCalledWith(
        expect.objectContaining({ legalMoves: ['e3', 'e4'] })
      )
    })

    test('passes isAiThinking to ChessScene', () => {
      render(<Board3D {...defaultProps} isAiThinking={true} />)
      expect(mockChessScene).toHaveBeenCalledWith(
        expect.objectContaining({ isAiThinking: true })
      )
    })

    test('passes isGameOver to ChessScene', () => {
      render(<Board3D {...defaultProps} isGameOver={true} />)
      expect(mockChessScene).toHaveBeenCalledWith(
        expect.objectContaining({ isGameOver: true })
      )
    })
  })
})
