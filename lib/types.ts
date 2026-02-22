export interface GameState {
  boardOrientation: 'white' | 'black'
  currentFen: string
  gameOverReason: GameOverReason | null
  history: Move[]
  isAiThinking: boolean
  isGameOver: boolean
  isInCheck: boolean
  turn: 'w' | 'b'
}

export type GameOverReason =
  | 'checkmate'
  | 'stalemate'
  | 'threefold-repetition'
  | '50-move-rule'
  | 'insufficient-material'

export interface Move {
  captured?: string
  color: 'w' | 'b'
  from: string
  piece: string
  promotion?: string
  san: string
  to: string
}

export interface Evaluation {
  type: 'cp' | 'mate'
  value: number // centipawns or moves to mate (positive = side to move advantage)
}

export interface DifficultyPreset {
  description: string
  label: string
  movetime: number // ms for UCI go movetime
  name: string
  skillLevel: number // Stockfish Skill Level 0-20
}

export interface MoveRequest {
  difficulty: string
  fen: string
}

export interface MoveResponse {
  bestMove: string | null
  evaluation?: Evaluation
  from: string
  isGameOver: boolean
  promotion?: string
  to: string
}

export type UCICommand = string

export interface UCIResponse {
  bestMove?: string
  from?: string
  promotion?: string
  raw: string
  to?: string
  type: 'uciok' | 'readyok' | 'bestmove' | 'info' | 'other'
}

export function isDifficultyPreset(value: unknown): value is DifficultyPreset {
  if (!value || typeof value !== 'object') {
    return false
  }
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
  if (!value || typeof value !== 'object') {
    return false
  }
  const v = value as Record<string, unknown>
  return (
    (v.bestMove === null || typeof v.bestMove === 'string') &&
    typeof v.from === 'string' &&
    typeof v.to === 'string' &&
    typeof v.isGameOver === 'boolean'
  )
}
