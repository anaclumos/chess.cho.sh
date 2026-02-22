# Learnings — chess-ai

## [2026-02-22] Session Start
- Project root: /Users/cho/Developer/chess.cho.sh-2
- Stack: Next.js 15, react-chessboard, chess.js, Vitest, Tailwind, Bun, Docker, Railway
- chess.js v1.4.0: `.move()` THROWS on illegal moves (not null). Always try/catch.
- react-chessboard v4: Removed built-in promotion dialog. Custom UI required.
- Stockfish: Singleton process only. Line-buffered stdout. `bestmove (none)` = game over.
- Docker Stage 2 must use `oven/bun:1` base image (not `node:20-slim`) since we use `bun` commands.
- `useRef` required for chess.js instance in React callbacks to prevent stale closures.
- `setGame(new Chess(fen))` pattern for re-render (not `setGame(game)` which doesn't trigger update).
- Undo = 2 half-moves (user + AI). Undo 1 only is NOT correct.
- All 5 game-over types must be detected: checkmate, stalemate, threefold repetition, 50-move rule, insufficient material.
