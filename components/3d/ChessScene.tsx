'use client'

import { useMemo, useRef, useEffect, type ComponentRef } from 'react'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { TOUCH, MOUSE } from 'three'
import { BoardSquare } from './BoardSquare'
import { ChessPiece } from './ChessPiece'

interface ChessSceneProps {
  fen: string
  turn: 'w' | 'b'
  isAiThinking: boolean
  isGameOver: boolean
  selectedSquare: string | null
  legalMoves: string[]
  onSquareClick: (square: string) => void
}

interface ParsedPiece {
  type: string
  color: 'w' | 'b'
  row: number
  col: number
}

function parseFen(fen: string): ParsedPiece[] {
  const pieces: ParsedPiece[] = []
  const position = fen.split(' ')[0]
  const ranks = position.split('/')

  for (let rankIdx = 0; rankIdx < ranks.length; rankIdx++) {
    let col = 0
    for (const ch of ranks[rankIdx]) {
      if (ch >= '1' && ch <= '8') {
        col += parseInt(ch)
      } else {
        const row = 7 - rankIdx
        const color: 'w' | 'b' = ch === ch.toUpperCase() ? 'w' : 'b'
        pieces.push({ type: ch.toLowerCase(), color, row, col })
        col++
      }
    }
  }

  return pieces
}

function squareToCoords(square: string): { row: number; col: number } {
  const col = square.charCodeAt(0) - 97
  const row = parseInt(square[1]) - 1
  return { row, col }
}

function coordsToSquare(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (row + 1)
}

export function ChessScene({
  fen,
  turn,
  isAiThinking,
  isGameOver,
  selectedSquare,
  legalMoves,
  onSquareClick,
}: ChessSceneProps) {
  const pieces = useMemo(() => parseFen(fen), [fen])

  const legalMoveSet = useMemo(() => new Set(legalMoves), [legalMoves])

  const pieceSquares = useMemo(() => {
    const set = new Set<string>()
    for (const p of pieces) {
      set.add(coordsToSquare(p.row, p.col))
    }
    return set
  }, [pieces])

  const disabled = isAiThinking || isGameOver

  const selectedCoords = useMemo(() => {
    if (!selectedSquare) return null
    return squareToCoords(selectedSquare)
  }, [selectedSquare])

  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.mouseButtons = { LEFT: undefined, MIDDLE: MOUSE.ROTATE, RIGHT: MOUSE.ROTATE }
    controls.touches = { ONE: undefined, TWO: TOUCH.DOLLY_ROTATE }
  }, [])
  return (
    <>
      <color attach="background" args={['#000000']} />
      <PerspectiveCamera makeDefault position={[0, 7, -5]} fov={45} />
      <OrbitControls
        ref={controlsRef}
        enableRotate
        enablePan={false}
        enableZoom
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 3}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-3, 6, -3]} intensity={0.3} />

      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[8.6, 0.1, 8.6]} />
        <meshStandardMaterial color="#654321" roughness={0.7} metalness={0.1} />
      </mesh>

      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const square = coordsToSquare(row, col)
          const isSelected =
            selectedCoords !== null &&
            selectedCoords.row === row &&
            selectedCoords.col === col
          const isLegalMove = legalMoveSet.has(square)
          const hasPiece = pieceSquares.has(square)

          return (
            <BoardSquare
              key={square}
              row={row}
              col={col}
              isLegalMove={isLegalMove}
              isSelected={isSelected}
              hasPiece={hasPiece}
              onClick={() => onSquareClick(square)}
            />
          )
        })
      )}

      {pieces.map((piece) => {
        const square = coordsToSquare(piece.row, piece.col)
        const isOwn = piece.color === turn
        const isSelected = selectedSquare === square

        return (
          <ChessPiece
            key={`${square}-${piece.type}-${piece.color}`}
            type={piece.type}
            color={piece.color}
            position={[piece.col - 3.5, 0.075, piece.row - 3.5]}
            isSelected={isSelected}
            onClick={() => {
              if (disabled) return
              if (isOwn || legalMoveSet.has(square)) {
                onSquareClick(square)
              } else {
                onSquareClick('')
              }
            }}
          />
        )
      })}
    </>
  )
}
