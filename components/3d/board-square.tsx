'use client'

import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

function squareColor(isSelected: boolean, isLight: boolean): string {
  if (isSelected) {
    return '#fbbf24'
  }
  return isLight ? '#deb887' : '#8b6914'
}

interface BoardSquareProps {
  col: number
  hasPiece: boolean
  isLegalMove: boolean
  isSelected: boolean
  onClick: () => void
  row: number
}

const SCALE_SPEED = 12

function MoveDot({ visible }: { visible: boolean }) {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!ref.current) {
      return
    }
    const target = visible ? 1 : 0
    const t = Math.min(1, delta * SCALE_SPEED)
    ref.current.scale.x += (target - ref.current.scale.x) * t
    ref.current.scale.y += (target - ref.current.scale.y) * t
    ref.current.scale.z += (target - ref.current.scale.z) * t
  })

  return (
    <mesh position={[0, 0.1, 0]} ref={ref} scale={0}>
      <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
      <meshStandardMaterial color="#22c55e" opacity={0.6} transparent />
    </mesh>
  )
}

function CaptureRing({ visible }: { visible: boolean }) {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!ref.current) {
      return
    }
    const target = visible ? 1 : 0
    const t = Math.min(1, delta * SCALE_SPEED)
    ref.current.scale.x += (target - ref.current.scale.x) * t
    ref.current.scale.y += (target - ref.current.scale.y) * t
    ref.current.scale.z += (target - ref.current.scale.z) * t
  })

  return (
    <mesh
      position={[0, 0.1, 0]}
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={0}
    >
      <ringGeometry args={[0.35, 0.45, 48]} />
      <meshStandardMaterial
        color="#ef4444"
        opacity={0.5}
        side={2}
        transparent
      />
    </mesh>
  )
}

export function BoardSquare({
  row,
  col,
  isLegalMove,
  isSelected,
  hasPiece,
  onClick,
}: BoardSquareProps) {
  const x = col - 3.5
  const z = row - 3.5
  const isLight = (row + col) % 2 === 0

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <group position={[x, 0, z]}>
      <mesh onPointerDown={handlePointerDown} receiveShadow>
        <boxGeometry args={[1, 0.15, 1]} />
        <meshStandardMaterial
          color={squareColor(isSelected, isLight)}
          metalness={0.05}
          opacity={isSelected ? 0.7 : 1}
          roughness={0.6}
          transparent={isSelected}
        />
      </mesh>

      <MoveDot visible={isLegalMove && !hasPiece} />
      <CaptureRing visible={isLegalMove && hasPiece} />
    </group>
  )
}
