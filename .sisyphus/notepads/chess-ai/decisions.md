# Decisions — chess-ai

## [2026-02-22] Session Start
- Default difficulty: intermediate (~2000 ELO)
- Engine timeout: 10 seconds per move
- Single-user only (singleton Stockfish process, no pool)
- Desktop-only layout in V1
- Stockfish 17 built from source (not apt package)
- REST API (no WebSocket needed for turn-based chess)
- Vitest for unit/integration tests, Playwright for E2E
- Bun as package manager and runtime
