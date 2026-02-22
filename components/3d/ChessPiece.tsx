'use client'

import { useMemo } from 'react'
import { createPieceGeometry } from './piece-profiles'
import type { ThreeEvent } from '@react-three/fiber'

interface ChessPieceProps {
  type: string
  color: 'w' | 'b'
  position: [number, number, number]
  isSelected: boolean
  onClick: () => void
}

export function ChessPiece({
  type,
  color,
  position,
  isSelected,
  onClick,
}: ChessPieceProps) {
  const geometry = useMemo(() => createPieceGeometry(type), [type])

  const materialProps = useMemo(() => {
    const base =
      color === 'w'
        ? { color: '#f5e6d3', roughness: 0.4, metalness: 0.1 }
        : { color: '#3d2b1f', roughness: 0.35, metalness: 0.15 }

    if (isSelected) {
      return {
        ...base,
        emissive: '#fbbf24',
        emissiveIntensity: 0.3,
      }
    }
    return base
  }, [color, isSelected])

  const y = isSelected ? position[1] + 0.15 : position[1]

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <mesh
      geometry={geometry}
      position={[position[0], y, position[2]]}
      castShadow
      receiveShadow
      onPointerDown={handlePointerDown}
    >
      <meshStandardMaterial {...materialProps} />
    </mesh>
  )
}
