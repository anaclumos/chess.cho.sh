'use client'

import { Canvas } from '@react-three/fiber'
import { ChessScene } from './3d/chess-scene'

interface Board3DProps {
  fen: string
  isAiThinking: boolean
  isGameOver: boolean
  legalMoves: string[]
  onSquareClick: (square: string) => void
  selectedSquare: string | null
  turn: 'w' | 'b'
}

export function Board3D({
  fen,
  turn,
  isAiThinking,
  isGameOver,
  selectedSquare,
  legalMoves,
  onSquareClick,
}: Board3DProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        onPointerMissed={() => onSquareClick('')}
        shadows
        style={{ touchAction: 'none' }}
      >
        <ChessScene
          fen={fen}
          isAiThinking={isAiThinking}
          isGameOver={isGameOver}
          legalMoves={legalMoves}
          onSquareClick={onSquareClick}
          selectedSquare={selectedSquare}
          turn={turn}
        />
      </Canvas>
    </div>
  )
}
