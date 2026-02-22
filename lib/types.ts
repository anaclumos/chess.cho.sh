export interface GameState {
  currentFen: string
  history: Move[]
  isGameOver: boolean
  gameOverReason: GameOverReason | null
  turn: 'w' | 'b'
  isAiThinking: boolean
  boardOrientation: 'white' | 'black'
  isInCheck: boolean
}

export type GameOverReason =
  | 'checkmate'
  | 'stalemate'
  | 'threefold-repetition'
  | '50-move-rule'
  | 'insufficient-material'

export interface Move {
  from: string
  to: string
  san: string
  color: 'w' | 'b'
  piece: string
  captured?: string
  promotion?: string
}

export interface DifficultyPreset {
  name: string
  label: string
  skillLevel: number // Stockfish Skill Level 0-20
  movetime: number // ms for UCI go movetime
  description: string
}

export interface MoveRequest {
  fen: string
  difficulty: string
}

export interface MoveResponse {
  bestMove: string | null
  from: string
  to: string
  promotion?: string
  isGameOver: boolean
}

export type UCICommand = string

export interface UCIResponse {
  type: 'uciok' | 'readyok' | 'bestmove' | 'info' | 'other'
  raw: string
  bestMove?: string
  from?: string
  to?: string
  promotion?: string
}

export function isDifficultyPreset(
  value: unknown
): value is DifficultyPreset {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.name === 'string' &&
    typeof v.label === 'string' &&
    typeof v.skillLevel === 'number' &&
    typeof v.movetime === 'number' &&
    typeof v.description === 'string'
  )
}

export function isMoveResponse(value: unknown): value is MoveResponse {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    (v.bestMove === null || typeof v.bestMove === 'string') &&
    typeof v.from === 'string' &&
    typeof v.to === 'string' &&
    typeof v.isGameOver === 'boolean'
  )
}
