import {
  type BufferGeometry,
  LatheGeometry,
  ExtrudeGeometry,
  Shape,
  Vector2,
} from 'three'

const cache = new Map<string, BufferGeometry>()

const SEGMENTS = 32

function pawnProfile(): Vector2[] {
  return [
    new Vector2(0, 0),
    new Vector2(0.22, 0),
    new Vector2(0.24, 0.02),
    new Vector2(0.24, 0.04),
    new Vector2(0.22, 0.06),
    new Vector2(0.14, 0.08),
    new Vector2(0.11, 0.12),
    new Vector2(0.10, 0.20),
    new Vector2(0.09, 0.30),
    new Vector2(0.07, 0.38),
    new Vector2(0.06, 0.40),
    new Vector2(0.10, 0.42),
    new Vector2(0.11, 0.44),
    new Vector2(0.10, 0.46),
    new Vector2(0.06, 0.47),
    new Vector2(0.12, 0.50),
    new Vector2(0.13, 0.54),
    new Vector2(0.11, 0.57),
    new Vector2(0.06, 0.59),
    new Vector2(0, 0.60),
  ]
}

function rookProfile(): Vector2[] {
  return [
    new Vector2(0, 0),
    new Vector2(0.26, 0),
    new Vector2(0.28, 0.02),
    new Vector2(0.28, 0.04),
    new Vector2(0.26, 0.06),
    new Vector2(0.16, 0.08),
    new Vector2(0.14, 0.10),
    new Vector2(0.13, 0.14),
    new Vector2(0.12, 0.40),
    new Vector2(0.13, 0.44),
    new Vector2(0.14, 0.46),
    new Vector2(0.18, 0.48),
    new Vector2(0.20, 0.50),
    new Vector2(0.22, 0.52),
    new Vector2(0.22, 0.56),
    new Vector2(0.24, 0.58),
    new Vector2(0.24, 0.64),
    new Vector2(0.22, 0.66),
    new Vector2(0.22, 0.70),
    new Vector2(0.24, 0.72),
    new Vector2(0.24, 0.76),
    new Vector2(0.16, 0.76),
    new Vector2(0.16, 0.72),
    new Vector2(0.18, 0.70),
    new Vector2(0.18, 0.66),
    new Vector2(0.10, 0.66),
    new Vector2(0.10, 0.76),
    new Vector2(0.04, 0.76),
    new Vector2(0.04, 0.72),
    new Vector2(0.06, 0.70),
    new Vector2(0.06, 0.66),
    new Vector2(0, 0.66),
  ]
}

function bishopProfile(): Vector2[] {
  return [
    new Vector2(0, 0),
    new Vector2(0.24, 0),
    new Vector2(0.26, 0.02),
    new Vector2(0.26, 0.04),
    new Vector2(0.24, 0.06),
    new Vector2(0.15, 0.08),
    new Vector2(0.12, 0.12),
    new Vector2(0.11, 0.16),
    new Vector2(0.10, 0.25),
    new Vector2(0.09, 0.35),
    new Vector2(0.08, 0.42),
    new Vector2(0.12, 0.44),
    new Vector2(0.13, 0.46),
    new Vector2(0.12, 0.48),
    new Vector2(0.08, 0.50),
    new Vector2(0.10, 0.55),
    new Vector2(0.11, 0.60),
    new Vector2(0.09, 0.65),
    new Vector2(0.06, 0.70),
    new Vector2(0.03, 0.75),
    new Vector2(0.01, 0.78),
    new Vector2(0, 0.80),
    new Vector2(0.04, 0.82),
    new Vector2(0.04, 0.84),
    new Vector2(0, 0.85),
  ]
}

function queenProfile(): Vector2[] {
  return [
    new Vector2(0, 0),
    new Vector2(0.26, 0),
    new Vector2(0.28, 0.02),
    new Vector2(0.28, 0.04),
    new Vector2(0.26, 0.06),
    new Vector2(0.16, 0.08),
    new Vector2(0.13, 0.12),
    new Vector2(0.12, 0.18),
    new Vector2(0.11, 0.28),
    new Vector2(0.10, 0.40),
    new Vector2(0.09, 0.48),
    new Vector2(0.13, 0.50),
    new Vector2(0.14, 0.52),
    new Vector2(0.13, 0.54),
    new Vector2(0.09, 0.56),
    new Vector2(0.10, 0.60),
    new Vector2(0.12, 0.65),
    new Vector2(0.11, 0.70),
    new Vector2(0.08, 0.74),
    new Vector2(0.05, 0.78),
    new Vector2(0.03, 0.80),
    new Vector2(0.06, 0.82),
    new Vector2(0.08, 0.84),
    new Vector2(0.06, 0.86),
    new Vector2(0.04, 0.87),
    new Vector2(0.05, 0.89),
    new Vector2(0.04, 0.90),
    new Vector2(0, 0.90),
  ]
}

function kingProfile(): Vector2[] {
  return [
    new Vector2(0, 0),
    new Vector2(0.28, 0),
    new Vector2(0.30, 0.02),
    new Vector2(0.30, 0.04),
    new Vector2(0.28, 0.06),
    new Vector2(0.17, 0.08),
    new Vector2(0.14, 0.12),
    new Vector2(0.13, 0.18),
    new Vector2(0.12, 0.30),
    new Vector2(0.11, 0.42),
    new Vector2(0.10, 0.50),
    new Vector2(0.14, 0.52),
    new Vector2(0.15, 0.54),
    new Vector2(0.14, 0.56),
    new Vector2(0.10, 0.58),
    new Vector2(0.11, 0.62),
    new Vector2(0.13, 0.68),
    new Vector2(0.12, 0.72),
    new Vector2(0.09, 0.76),
    new Vector2(0.06, 0.80),
    new Vector2(0.04, 0.82),
    new Vector2(0.07, 0.84),
    new Vector2(0.08, 0.86),
    new Vector2(0.06, 0.88),
    new Vector2(0.04, 0.89),
    new Vector2(0.04, 0.90),
    new Vector2(0.02, 0.90),
    new Vector2(0.02, 0.93),
    new Vector2(0.05, 0.93),
    new Vector2(0.05, 0.95),
    new Vector2(0.02, 0.95),
    new Vector2(0.02, 0.98),
    new Vector2(0, 0.98),
  ]
}

function knightGeometry(): BufferGeometry {
  const shape = new Shape()
  shape.moveTo(0, 0)
  shape.lineTo(0.25, 0)
  shape.lineTo(0.25, 0.04)
  shape.lineTo(0.15, 0.08)
  shape.lineTo(0.12, 0.12)
  shape.lineTo(0.12, 0.25)
  shape.lineTo(0.14, 0.30)
  shape.lineTo(0.18, 0.35)
  shape.lineTo(0.22, 0.42)
  shape.lineTo(0.24, 0.50)
  shape.lineTo(0.22, 0.58)
  shape.lineTo(0.18, 0.62)
  shape.lineTo(0.14, 0.65)
  shape.lineTo(0.10, 0.68)
  shape.lineTo(0.06, 0.72)
  shape.lineTo(0.02, 0.74)
  shape.lineTo(-0.02, 0.75)
  shape.lineTo(-0.06, 0.73)
  shape.lineTo(-0.08, 0.70)
  shape.lineTo(-0.10, 0.65)
  shape.lineTo(-0.12, 0.58)
  shape.lineTo(-0.14, 0.48)
  shape.lineTo(-0.14, 0.40)
  shape.lineTo(-0.12, 0.35)
  shape.lineTo(-0.10, 0.30)
  shape.lineTo(-0.10, 0.20)
  shape.lineTo(-0.12, 0.12)
  shape.lineTo(-0.15, 0.08)
  shape.lineTo(-0.25, 0.04)
  shape.lineTo(-0.25, 0)
  shape.lineTo(0, 0)

  const geo = new ExtrudeGeometry(shape, {
    depth: 0.25,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 4,
  })
  geo.translate(0, 0, -0.125)
  geo.computeVertexNormals()
  return geo
}

export function createPieceGeometry(type: string): BufferGeometry {
  const cached = cache.get(type)
  if (cached) return cached

  let geometry: BufferGeometry

  if (type === 'n') {
    geometry = knightGeometry()
  } else {
    const profiles: Record<string, () => Vector2[]> = {
      p: pawnProfile,
      r: rookProfile,
      b: bishopProfile,
      q: queenProfile,
      k: kingProfile,
    }
    const profile = profiles[type]
    if (!profile) {
      geometry = new LatheGeometry(pawnProfile(), SEGMENTS)
    } else {
      geometry = new LatheGeometry(profile(), SEGMENTS)
    }
  }

  cache.set(type, geometry)
  return geometry
}
