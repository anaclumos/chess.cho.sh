'use client'

import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { type ComponentRef, useEffect, useMemo, useRef } from 'react'
import { MOUSE, TOUCH } from 'three'
import { BoardSquare } from './board-square'
import { ChessPiece } from './chess-piece'

interface ChessSceneProps {
  fen: string
  isAiThinking: boolean
  isGameOver: boolean
  legalMoves: string[]
  onSquareClick: (square: string) => void
  selectedSquare: string | null
  turn: 'w' | 'b'
}

interface ParsedPiece {
  col: number
  color: 'w' | 'b'
  row: number
  type: string
}

interface TrackedPiece extends ParsedPiece {
  id: string
}

function parseFen(fen: string): ParsedPiece[] {
  const pieces: ParsedPiece[] = []
  const position = fen.split(' ')[0]
  const ranks = position.split('/')

  for (let rankIdx = 0; rankIdx < ranks.length; rankIdx++) {
    let col = 0
    for (const ch of ranks[rankIdx]) {
      if (ch >= '1' && ch <= '8') {
        col += Number.parseInt(ch, 10)
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
  const row = Number.parseInt(square[1], 10) - 1
  return { row, col }
}

function coordsToSquare(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (row + 1)
}

function matchExact(
  newParsed: ParsedPiece[],
  prev: TrackedPiece[],
  usedPrev: Set<number>,
  usedNew: Set<number>,
  result: TrackedPiece[]
): void {
  for (let i = 0; i < newParsed.length; i++) {
    for (let j = 0; j < prev.length; j++) {
      if (usedPrev.has(j) || usedNew.has(i)) {
        continue
      }
      const n = newParsed[i]
      const p = prev[j]
      if (
        p.type === n.type &&
        p.color === n.color &&
        p.row === n.row &&
        p.col === n.col
      ) {
        result.push({ ...n, id: p.id })
        usedPrev.add(j)
        usedNew.add(i)
        break
      }
    }
  }
}

function matchMoved(
  newParsed: ParsedPiece[],
  prev: TrackedPiece[],
  usedPrev: Set<number>,
  usedNew: Set<number>,
  result: TrackedPiece[]
): void {
  for (let i = 0; i < newParsed.length; i++) {
    if (usedNew.has(i)) {
      continue
    }
    for (let j = 0; j < prev.length; j++) {
      if (usedPrev.has(j)) {
        continue
      }
      if (
        prev[j].type === newParsed[i].type &&
        prev[j].color === newParsed[i].color
      ) {
        result.push({ ...newParsed[i], id: prev[j].id })
        usedPrev.add(j)
        usedNew.add(i)
        break
      }
    }
  }
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
  const nextPieceId = useRef(0)
  const prevTrackedRef = useRef<TrackedPiece[]>([])

  const trackedPieces = useMemo(() => {
    const newParsed = parseFen(fen)
    const prev = prevTrackedRef.current
    const result: TrackedPiece[] = []
    const usedPrev = new Set<number>()
    const usedNew = new Set<number>()

    matchExact(newParsed, prev, usedPrev, usedNew, result)
    matchMoved(newParsed, prev, usedPrev, usedNew, result)

    for (let i = 0; i < newParsed.length; i++) {
      if (!usedNew.has(i)) {
        result.push({ ...newParsed[i], id: `p${nextPieceId.current++}` })
      }
    }

    prevTrackedRef.current = result
    return result
  }, [fen])

  const legalMoveSet = useMemo(() => new Set(legalMoves), [legalMoves])

  const pieceSquares = useMemo(() => {
    const set = new Set<string>()
    for (const p of trackedPieces) {
      set.add(coordsToSquare(p.row, p.col))
    }
    return set
  }, [trackedPieces])

  const disabled = isAiThinking || isGameOver

  const selectedCoords = useMemo(() => {
    if (!selectedSquare) {
      return null
    }
    return squareToCoords(selectedSquare)
  }, [selectedSquare])

  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) {
      return
    }
    controls.mouseButtons = {
      LEFT: undefined,
      MIDDLE: MOUSE.ROTATE,
      RIGHT: MOUSE.ROTATE,
    }
    controls.touches = { ONE: undefined, TWO: TOUCH.DOLLY_ROTATE }
  }, [])
  return (
    <>
      <color args={['#000000']} attach="background" />
      <PerspectiveCamera fov={45} makeDefault position={[0, 10, -7.5]} />
      <OrbitControls
        enablePan={false}
        enableRotate
        enableZoom
        maxPolarAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 6}
        ref={controlsRef}
      />

      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        intensity={0.8}
        position={[5, 8, 5]}
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight intensity={0.3} position={[-3, 6, -3]} />

      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[8.6, 0.1, 8.6]} />
        <meshStandardMaterial color="#654321" metalness={0.1} roughness={0.7} />
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
              col={col}
              hasPiece={hasPiece}
              isLegalMove={isLegalMove}
              isSelected={isSelected}
              key={square}
              onClick={() => onSquareClick(square)}
              row={row}
            />
          )
        })
      )}

      {trackedPieces.map((piece) => {
        const square = coordsToSquare(piece.row, piece.col)
        const isOwn = piece.color === turn
        const isSelected = selectedSquare === square
        return (
          <ChessPiece
            color={piece.color}
            isSelected={isSelected}
            key={piece.id}
            onClick={() => {
              if (disabled) {
                return
              }
              if (isOwn || legalMoveSet.has(square)) {
                onSquareClick(square)
              } else {
                onSquareClick('')
              }
            }}
            position={[piece.col - 3.5, 0.075, piece.row - 3.5]}
            type={piece.type}
          />
        )
      })}
    </>
  )
}
