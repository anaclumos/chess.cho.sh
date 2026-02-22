'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'

interface BoardSquareProps {
  row: number
  col: number
  isLegalMove: boolean
  isSelected: boolean
  hasPiece: boolean
  onClick: () => void
}

const SCALE_SPEED = 12

function MoveDot() {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    const t = Math.min(1, delta * SCALE_SPEED)
    ref.current.scale.x += (1 - ref.current.scale.x) * t
    ref.current.scale.y += (1 - ref.current.scale.y) * t
    ref.current.scale.z += (1 - ref.current.scale.z) * t
  })

  return (
    <mesh ref={ref} position={[0, 0.1, 0]} scale={0}>
      <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
      <meshStandardMaterial color="#22c55e" transparent opacity={0.6} />
    </mesh>
  )
}

function CaptureRing() {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    const t = Math.min(1, delta * SCALE_SPEED)
    ref.current.scale.x += (1 - ref.current.scale.x) * t
    ref.current.scale.y += (1 - ref.current.scale.y) * t
    ref.current.scale.z += (1 - ref.current.scale.z) * t
  })

  return (
    <mesh ref={ref} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0}>
      <ringGeometry args={[0.35, 0.45, 32]} />
      <meshStandardMaterial color="#ef4444" transparent opacity={0.5} side={2} />
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
      <mesh receiveShadow onPointerDown={handlePointerDown}>
        <boxGeometry args={[1, 0.15, 1]} />
        <meshStandardMaterial
          color={isSelected ? '#fbbf24' : isLight ? '#deb887' : '#8b6914'}
          transparent={isSelected}
          opacity={isSelected ? 0.7 : 1}
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      {isLegalMove && !hasPiece && <MoveDot />}
      {isLegalMove && hasPiece && <CaptureRing />}
    </group>
  )
}
