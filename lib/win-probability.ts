import type { Evaluation } from '@/lib/types'

/**
 * Converts centipawn evaluation to winning chances.
 * Uses the exact Lichess formula from:
 * https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/winningChances.ts
 *
 * Returns a value from -1 to 1 where:
 *   +1 = White winning (100%)
 *   -1 = Black winning (100%)
 *    0 = Equal (50/50)
 */
const MULTIPLIER = -0.003_682_08

function rawWinningChances(cp: number): number {
  return 2 / (1 + Math.exp(MULTIPLIER * cp)) - 1
}

function cpWinningChances(cp: number): number {
  return rawWinningChances(Math.min(Math.max(-1000, cp), 1000))
}

function mateWinningChances(mate: number): number {
  const cp = (21 - Math.min(10, Math.abs(mate))) * 100
  const signed = cp * (mate > 0 ? 1 : -1)
  return rawWinningChances(signed)
}

/**
 * Converts an engine evaluation to White's win percentage (0–100).
 *
 * The evaluation from Stockfish is always from the side-to-move's perspective.
 * Since the AI plays Black, the engine eval is from Black's POV.
 * We negate it to get White's perspective before converting.
 */
export function evalToWhitePercent(evaluation: Evaluation): number {
  // Negate because engine evaluates from Black's (side to move) perspective
  const whiteValue = -evaluation.value
  const raw =
    evaluation.type === 'cp'
      ? cpWinningChances(whiteValue)
      : mateWinningChances(whiteValue)
  // Convert from [-1, 1] to [0, 100]
  return Math.round(((raw + 1) / 2) * 100)
}
