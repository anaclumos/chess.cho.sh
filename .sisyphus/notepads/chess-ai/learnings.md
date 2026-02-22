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

## [2026-02-22] Task 1: Project Scaffolding
 `create-next-app --yes` does NOT bypass non-empty directory check. Workaround: create in /tmp and rsync.
 `@types/testing-library__jest-dom` causes Next.js build failure ("Cannot find type definition file"). Remove it; `@testing-library/jest-dom` ships its own types.
 `bun test --run` uses bun's built-in test runner, NOT vitest. Use `bunx vitest run` or `bun run test:run` for vitest.
 Next.js 16.1.6 was installed (latest as of 2026-02-22), not 15. The plan said 15 but latest is 16.
 `.next/standalone` directory is created when `output: 'standalone'` is set in next.config.ts.


## [2026-02-22] Task 2: TypeScript Types
 lib/types.ts exports: GameState, Move, DifficultyPreset, MoveRequest, MoveResponse, UCIResponse
 isDifficultyPreset() and isMoveResponse() type guards defined and tested
 GameOverReason type: 'checkmate' | 'stalemate' | 'threefold-repetition' | '50-move-rule' | 'insufficient-material'
 isInCheck added to GameState (check status for UI display)
 UCICommand is a simple string alias; UCIResponse has typed discriminant field
 11 tests pass across 3 describe blocks (type guards + compile checks)

## [2026-02-22] Task 4: Difficulty Presets
 5 presets: beginner(0/500ms), easy(5/1000ms), intermediate(10/2000ms), hard(15/3000ms), maximum(20/5000ms)
 getUCIOptions() returns ['setoption name Skill Level value N']
 Do NOT use Maximum Error or Probability options (removed from modern Stockfish)
 Do NOT use UCI_LimitStrength — use Skill Level for simplicity
 DifficultyPreset type imported from lib/types.ts (Task 2 was already complete)
 lib/types.ts existed with matching DifficultyPreset interface — no inline definition needed
 .sisyphus/evidence is gitignored — evidence saved locally only


## [2026-02-22] Task 3: Dockerfile
 Multi-stage build: ubuntu:22.04 (Stockfish) → oven/bun:1 (Next.js build) → node:20-slim (runner)
 Stockfish binary at /usr/local/bin/stockfish in final image
 Build takes ~30s on Apple Silicon (ARM native), would take 20-40 min on x86 QEMU
 ARCH=x86-64-modern is DEPRECATED in SF17, auto-maps to x86-64-sse41-popcnt
 On Apple Silicon (aarch64 in Docker), use ARCH=armv8-dotprod (NOT apple-silicon, which is macOS-only)
 apple-silicon ARCH uses -m64 and -mfpu=neon flags that don't work on Linux ARM64
 `make net` requires wget or curl — must add wget to apt-get install
 bun.lock* wildcard handles both bun.lockb (old) and bun.lock (new) formats
 NEXT_TELEMETRY_DISABLED=1 prevents telemetry during build
 Dockerfile auto-detects arch: armv8-dotprod for ARM, x86-64-modern for x86_64
 Railway deploys to linux/amd64, so x86-64-modern path will be used in production


## [2026-02-22] Task 6: useChessGame Hook
 useRef + useReducer pattern: gameRef holds mutable Chess instance, useReducer forces re-render
 CRITICAL: new Chess(fen) loses move history! Cannot use setGame(new Chess(fen)) for re-render trigger
 Instead: mutate gameRef.current directly, call forceRender() via useReducer
 makeMove: chess.move({ from, to, promotion }) throws on illegal (v1.4.0) — always try/catch
 undoMove: returns false if history.length < 2 (must undo 2 half-moves at once)
 detectGameOver: runs on every render from chess state — immediate after loadFen
 chess.history({ verbose: true }) returns Move[] with full move objects — map to our Move type
 chess.inCheck() is the correct method name in chess.js v1.x (isCheck() also exists)
 Move.isPromotion() method replaces deprecated flags field for promotion detection
 loadFen helper added for test setup (loading specific positions like stalemate/check)
 'use client' directive required for React hooks in Next.js App Router
 27 tests pass across 9 describe blocks

## [2026-02-22] Task 5: Stockfish Engine Wrapper
 Singleton via module-level `let proc: ChildProcess | null`
 lineEmitter (EventEmitter) distributes parsed lines to multiple waiters
 Buffer += chunk.toString(), split on '\n', emit each trimmed non-empty line
 bestmove (none) returns { bestMove: null, from: '', to: '', isGameOver: true }
 promotion parse: move.length === 5 ? move[4] : undefined (e.g., 'a7a8q' → 'q')
 FEN validation via new Chess(fen) — throws on invalid FEN
 STOCKFISH_PATH = process.env.STOCKFISH_PATH ?? '/usr/local/bin/stockfish'
 Do NOT use go infinite or go ponder — always go movetime N
 vi.mock('child_process') needs `default: { spawn: mockSpawn }` for CJS→ESM interop
 vi.hoisted() creates shared mock references that survive vi.mock hoisting
 _resetForTesting() export is cleaner than vi.resetModules() for singleton reset between tests
 vi.resetModules() + vi.doMock() has ESM interop issues with CJS modules like child_process


## [2026-02-22] Task 7: PromotionDialog Component
 Returns null when isOpen=false (not hidden via CSS — null return for clean DOM)
 aria-label on buttons for testability: getByRole('button', { name: /queen/i })
 Fixed overlay: fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
 4 pieces: queen(q), rook(r), bishop(b), knight(n)
 color prop selects which player's piece symbols to show (♕♖♗♘ white, ♛♜♝♞ black)
 'use client' required for interactive components in Next.js App Router
 type="button" required on <button> elements (eslint jsx-a11y rule)
 Amber/warm palette for chess-themed dialog (gradient bg, amber borders)
 8 tests: isOpen toggle, 4 piece selection callbacks, white/black color modes


## [2026-02-22] Task 10: MoveHistory + GameStatus
 MoveHistory groups moves into pairs [white, black?] using i += 2 loop
 Auto-scroll via useEffect + bottomRef.scrollIntoView?.() — optional chaining needed (jsdom lacks scrollIntoView)
 GameStatus returns null for empty state (not empty div) — tests use toBeEmptyDOMElement()
 sideToMove param in getGameOverMessage: player about to move = player in checkmate (winner is opposite)
 GameOverReason: 'checkmate' | 'stalemate' | 'threefold-repetition' | '50-move-rule' | 'insufficient-material'
 Use <output> element instead of <div role="status"> to satisfy biome lint
 84 total tests (72 existing + 5 MoveHistory + 7 GameStatus)


## [2026-02-22] Task 8: POST /api/move API Route
 Next.js App Router API: export async function POST(request: NextRequest) — no default export
 NextRequest/NextResponse from 'next/server' — not 'next/request'
 vi.mock('@/lib/engine/stockfish') with vi.hoisted() works for API route mocking (same pattern as engine tests)
 FEN validation: try { new Chess(fen) } catch → 400 — chess.js throws on invalid FEN
 getPreset() throws for unknown names — wrap in try/catch, return 400
 let preset needs explicit type annotation (ReturnType<typeof getPreset>) for strict TS
 NextRequest constructor: new NextRequest(url, { method, headers, body: JSON.stringify(data) })
 API routes show as ƒ (Dynamic) in build output — not prerendered
 newgame route needs no request param: export async function POST() is valid
 12 new tests (10 move + 2 newgame), total 96 passing


## [2026-02-22] Task 9: Board Component
 react-chessboard v4 API: all props go inside `options` object: `<Chessboard options={{...}} />`
 `isDraggablePiece` renamed to `canDragPiece` with v4 PieceHandlerArgs: `({ isSparePiece, piece: { pieceType }, square })`
 `onPieceDrop` now receives destructured object: `({ piece, sourceSquare, targetSquare })`
 `piece` is `PieceDataType = { pieceType: string }` not raw string; pieceType format: 'wP', 'bN' etc.
 `animationDuration` renamed to `animationDurationInMs`
 `position` prop name unchanged but now inside options object
 Promotion flow: onPieceDrop returns false + stores pending {from,to} in state → PromotionDialog → onSelect calls makeMove(from, to, piece)
 canDragPiece: check `piece.pieceType[0] === turn` for color matching (w/b prefix)
 Tests mock react-chessboard entirely; access options via `mockChessboard.mock.calls[0][0].options`
 Helper functions (getOptions, dropPiece, checkCanDrag) reduce test boilerplate significantly
 16 new tests: 3 rendering + 2 onPieceDrop + 5 canDragPiece + 6 promotion, total 112 passing
