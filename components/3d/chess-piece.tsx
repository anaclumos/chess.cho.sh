'use client'

import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import { createPieceGeometry } from './piece-profiles'

interface ChessPieceProps {
  color: 'w' | 'b'
  isSelected: boolean
  onClick: () => void
  position: [number, number, number]
  type: string
}

const LERP_SPEED = 10

export function ChessPiece({
  type,
  color,
  position,
  isSelected,
  onClick,
}: ChessPieceProps) {
  const meshRef = useRef<Mesh>(null)
  const initialized = useRef(false)
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

  const targetY = isSelected ? position[1] + 0.15 : position[1]

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return
    }
    const mesh = meshRef.current

    if (!initialized.current) {
      mesh.position.set(position[0], targetY, position[2])
      mesh.scale.setScalar(0.001)
      initialized.current = true
      return
    }

    const t = Math.min(1, delta * LERP_SPEED)

    mesh.position.x += (position[0] - mesh.position.x) * t
    mesh.position.y += (targetY - mesh.position.y) * t
    mesh.position.z += (position[2] - mesh.position.z) * t

    mesh.scale.x += (1 - mesh.scale.x) * t
    mesh.scale.y += (1 - mesh.scale.y) * t
    mesh.scale.z += (1 - mesh.scale.z) * t
  })

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <mesh
      castShadow
      geometry={geometry}
      onPointerDown={handlePointerDown}
      receiveShadow
      ref={meshRef}
    >
      <meshStandardMaterial {...materialProps} />
    </mesh>
  )
}
