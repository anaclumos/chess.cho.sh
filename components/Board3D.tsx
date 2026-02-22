'use client'

import { Canvas } from '@react-three/fiber'
import { ChessScene } from './3d/ChessScene'

interface Board3DProps {
  fen: string
  turn: 'w' | 'b'
  isAiThinking: boolean
  isGameOver: boolean
  selectedSquare: string | null
  legalMoves: string[]
  onSquareClick: (square: string) => void
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
    <div className="aspect-square w-full">
      <Canvas
        dpr={[1, 2]}
        shadows
        style={{ touchAction: 'none' }}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => onSquareClick('')}
      >
        <ChessScene
          fen={fen}
          turn={turn}
          isAiThinking={isAiThinking}
          isGameOver={isGameOver}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          onSquareClick={onSquareClick}
        />
      </Canvas>
    </div>
  )
}
