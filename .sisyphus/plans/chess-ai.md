# Chess AI — Play Against Stockfish

## TL;DR

> **Quick Summary**: Build a full-stack Next.js chess web app where users play against a server-side Stockfish engine with adjustable difficulty, featuring a clean minimal UI with drag-and-drop pieces.
> 
> **Deliverables**:
> - Interactive chessboard with drag-and-drop (react-chessboard + chess.js)
> - Server-side Stockfish 17 engine via UCI protocol (singleton process)
> - Adjustable difficulty (5 named presets from Beginner to Maximum)
> - Game controls: New Game, Difficulty selector, Undo, Flip Board
> - Move history panel + Game status display (check, checkmate, stalemate, draw)
> - Custom pawn promotion dialog
> - Dockerized deployment on Railway
> 
> **Estimated Effort**: Medium-Large
> **Parallel Execution**: YES — 4 waves + final verification
> **Critical Path**: Task 1 → Task 5 → Task 8 → Task 13 → Task 15 → F1-F4

---

## Context

### Original Request
Build a Chess AI and a web UI to play against it. Deploy on Railway.

### Interview Summary
**Key Discussions**:
- **Engine**: User wants 2000+ ELO strength → Stockfish wrapper (not custom engine)
- **Architecture**: Server-side engine via Next.js API routes (REST, not WebSocket)
- **UI**: Clean & minimal — no accounts, no sounds, no analysis features
- **Features confirmed**: New Game, Difficulty selector, Move history, Game status, Flip board, Undo
- **Features excluded**: Sounds, hints, accounts, leaderboards, puzzles, multiplayer, eval bar, PGN export
- **Testing**: TDD — write tests first, implement after
- **Deploy**: Railway with Docker

**Research Findings**:
- **chess.js v1.4.0**: `.move()` THROWS on illegal moves (not null return). Must use try/catch everywhere
- **react-chessboard v4.x**: Removed built-in promotion dialog. Custom UI required
- **Stockfish UCI**: Singleton process mandatory (maintainer-confirmed). Line-buffered stdout. `bestmove (none)` for game-over positions
- **Stockfish Skill Level 0-20**: Maps to ~1320-3190 ELO (CCRL Blitz). Alternative: `UCI_LimitStrength` + `UCI_Elo`
- **Docker**: Must build Stockfish from source (`ARCH=x86-64-modern`). `apt-get install stockfish` gives ancient version without NNUE
- **React pattern**: Must use `useRef` for chess.js instance in callbacks (stale closure bug). Re-render via `new Chess(game.fen())`

### Metis Review
**Identified Gaps** (addressed):
- Undo behavior: Must undo 2 half-moves (AI + user) to restore to user's turn
- Stockfish stdout line buffering: Partial chunks from child_process, must buffer/split on newlines
- UCI protocol sequence: Strict ordering — `uci` → `isready` → options → `ucinewgame` → `position` → `go movetime`
- Process crash recovery: Auto-respawn on crash, propagate error to API caller
- `bestmove (none)`: Game-over signal that must be handled
- Invalid FEN crashes Stockfish: Must validate before sending
- 5 scenarios where Stockfish doesn't return bestmove: All documented and handled
- Skill Level options `Maximum Error` / `Probability` removed from modern Stockfish: Don't reference
- Concurrent users: Defaulted to single-user (singleton process, no pool)

---

## Work Objectives

### Core Objective
Deliver a polished, single-page chess web app where the user plays against Stockfish with adjustable difficulty, backed by a robust UCI engine wrapper, deployed on Railway.

### Concrete Deliverables
- `app/page.tsx` — Main game page integrating all components
- `app/api/move/route.ts` — POST endpoint accepting FEN + difficulty, returning Stockfish's best move
- `lib/engine/stockfish.ts` — Singleton Stockfish process wrapper with UCI protocol, line buffering, crash recovery
- `lib/engine/difficulty.ts` — Difficulty presets mapped to UCI options
- `hooks/useChessGame.ts` — React hook wrapping chess.js with full game state management
- `components/Board.tsx` — react-chessboard integration with drag restriction and custom promotion
- `components/PromotionDialog.tsx` — Custom pawn promotion picker (Q/R/B/N)
- `components/GameControls.tsx` — New Game, Difficulty, Undo, Flip Board
- `components/MoveHistory.tsx` — Scrollable algebraic notation list
- `components/GameStatus.tsx` — Check, checkmate, stalemate, draw display
- `Dockerfile` — Multi-stage: build Stockfish 17 from source + Next.js standalone output
- `railway.toml` — Railway deployment configuration

### Definition of Done
- [ ] `bun test` — all tests pass (unit + integration)
- [ ] `bun run build` — Next.js production build succeeds
- [ ] `docker build . -t chess-ai && docker run -p 3000:3000 chess-ai` — app loads and AI responds to moves
- [ ] Playwright E2E: Full game playable from first move through checkmate
- [ ] Railway deploy: App accessible at public URL, AI responds within 5 seconds

### Must Have
- Drag-and-drop piece movement with legal move enforcement
- AI responds to every user move within 5 seconds
- Adjustable difficulty with 5 named presets
- All 5 game-over conditions detected (checkmate, stalemate, threefold repetition, 50-move rule, insufficient material)
- Pawn promotion with piece selection (not auto-queen)
- Undo restores to user's turn (undoes 2 half-moves)
- Board flipping (play as white or black perspective)
- Move history in standard algebraic notation
- Game status messages for check, checkmate, stalemate, draw
- Stockfish process crash recovery with auto-respawn

### Must NOT Have (Guardrails)
- G1: NO evaluation bar, engine score, or analysis features
- G2: NO legal move dot indicators on hover
- G3: NO PGN export/import
- G4: NO clocks, timers, or time controls
- G5: NO multiple themes or piece sets — one clean default
- G6: NO sound effects
- G7: NO user accounts, authentication, or saved games
- G8: NO draw offer or resign buttons — game ends by rules only
- G9: NO move annotations (!,?,!!,??)
- G10: NO `apt-get install stockfish` — must build from source
- G11: NO `go infinite` or `go ponder` — always use `movetime`
- G12: NO deprecated chess.js APIs (`move.flags`, null-return pattern)
- G13: NO auto-queen promotion — always show promotion picker

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO (greenfield) — will set up in Task 1
- **Automated tests**: TDD — RED → GREEN → REFACTOR for every module
- **Framework**: Vitest (fast, native ESM, works with Next.js)
- **If TDD**: Each task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Engine/Library**: Use Bash (bun test + bun REPL) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 4 parallel, all independent):
├── Task 1: Next.js scaffolding + deps + vitest + git init [quick]
├── Task 2: TypeScript types & interfaces [quick]
├── Task 3: Dockerfile with Stockfish 17 from source [quick]
├── Task 4: Difficulty presets module (TDD) [quick]

Wave 2 (Core Engine + Game Logic — 2 parallel):
├── Task 5: Stockfish UCI engine wrapper (TDD) (depends: 2, 3) [deep]
├── Task 6: useChessGame React hook (TDD) (depends: 1, 2) [deep]

Wave 3 (API + UI Components — 5 parallel):
├── Task 7: Custom promotion dialog component (depends: 1) [visual-engineering]
├── Task 8: POST /api/move route (TDD) (depends: 5, 4) [unspecified-high]
├── Task 9: Chessboard component (depends: 6) [visual-engineering]
├── Task 10: Move history + Game status components (depends: 2) [visual-engineering]
├── Task 11: Game controls panel (depends: 2) [visual-engineering]

Wave 4 (Integration + Deploy — 3 sequential-ish):
├── Task 12: Main game page — wire all components (depends: 7-11) [deep]
├── Task 13: Railway deployment config + Docker validation (depends: 3, 12) [quick]
├── Task 14: E2E Playwright tests (depends: 12) [unspecified-high]

Wave FINAL (Verification — 4 parallel):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
├── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 6 → Task 9 → Task 12 → Task 14 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 5 (Wave 3)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|:----:|:----------:|:------:|:----:|
| 1 | — | 6, 7, 9 | 1 |
| 2 | — | 5, 6, 10, 11 | 1 |
| 3 | — | 5, 13 | 1 |
| 4 | — | 8 | 1 |
| 5 | 2, 3 | 8 | 2 |
| 6 | 1, 2 | 9 | 2 |
| 7 | 1 | 12 | 3 |
| 8 | 5, 4 | 12 | 3 |
| 9 | 6 | 12 | 3 |
| 10 | 2 | 12 | 3 |
| 11 | 2 | 12 | 3 |
| 12 | 7-11 | 13, 14 | 4 |
| 13 | 3, 12 | F1-F4 | 4 |
| 14 | 12 | F1-F4 | 4 |

### Agent Dispatch Summary

- **Wave 1**: **4 tasks** — T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 2**: **2 tasks** — T5 → `deep`, T6 → `deep`
- **Wave 3**: **5 tasks** — T7 → `visual-engineering`, T8 → `unspecified-high`, T9 → `visual-engineering`, T10 → `visual-engineering`, T11 → `visual-engineering`
- **Wave 4**: **3 tasks** — T12 → `deep`, T13 → `quick`, T14 → `unspecified-high`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

### Wave 1 — Foundation (4 parallel, all independent)

- [ ] 1. Next.js Project Scaffolding + Dependencies + Vitest + Git Init

  **What to do**:
  - Run `git init` in the project root
  - Create Next.js 15 project with App Router (`bunx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias='@/*'`)
  - Install core deps: `bun add chess.js react-chessboard`
  - Install dev deps: `bun add -d vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom`
  - Create `vitest.config.ts` with React plugin and jsdom environment
  - Add `"test": "vitest"` and `"test:run": "vitest run"` to package.json scripts
  - Create a trivial `lib/__tests__/setup.test.ts` to verify vitest works: `test('vitest works', () => expect(1+1).toBe(2))`
  - Verify `bun test` passes and `bun run build` succeeds
  - Set `output: 'standalone'` in `next.config.ts` for Docker builds
  - Create `.gitignore` with node_modules, .next, .env, .sisyphus/evidence

  **Must NOT do**:
  - Do NOT add any chess logic or components — scaffolding only
  - Do NOT install Playwright yet (Task 14)
  - Do NOT create Dockerfile yet (Task 3)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard scaffolding with well-known tools, no creative decisions
  - **Skills**: []
    - No specialized skills needed for project initialization

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 6, 7, 9 (need Next.js project to exist)
  - **Blocked By**: None (can start immediately)

  **References**:

  **External References**:
  - Next.js create-next-app: https://nextjs.org/docs/getting-started/installation
  - Vitest with Next.js: https://nextjs.org/docs/app/building-your-application/testing/vitest
  - react-chessboard npm: https://www.npmjs.com/package/react-chessboard
  - chess.js npm: https://www.npmjs.com/package/chess.js

  **Acceptance Criteria**:
  - [ ] `bun test` → PASS (1 test, 0 failures)
  - [ ] `bun run build` → Next.js production build succeeds with zero errors
  - [ ] `bunx tsc --noEmit` → zero type errors
  - [ ] `package.json` contains `chess.js`, `react-chessboard` in dependencies
  - [ ] `vitest.config.ts` exists with jsdom environment
  - [ ] `next.config.ts` has `output: 'standalone'`

  **QA Scenarios:**

  ```
  Scenario: Vitest runs and passes
    Tool: Bash
    Preconditions: Project scaffolded, deps installed
    Steps:
      1. Run `bun test -- --run`
      2. Check exit code is 0
      3. Verify output contains "1 passed"
    Expected Result: Test suite passes with 1 test
    Failure Indicators: Non-zero exit code, "FAIL" in output
    Evidence: .sisyphus/evidence/task-1-vitest-passes.txt

  Scenario: Next.js build succeeds
    Tool: Bash
    Preconditions: Project scaffolded
    Steps:
      1. Run `bun run build`
      2. Check exit code is 0
      3. Verify `.next/standalone` directory exists
    Expected Result: Build completes, standalone output generated
    Failure Indicators: Build errors, missing standalone directory
    Evidence: .sisyphus/evidence/task-1-nextjs-build.txt
  ```

  **Evidence to Capture:**
  - [ ] task-1-vitest-passes.txt — vitest run output
  - [ ] task-1-nextjs-build.txt — build command output

  **Commit**: YES
  - Message: `chore: scaffold Next.js project with vitest and dependencies`
  - Files: package.json, tsconfig.json, vitest.config.ts, next.config.ts, app/layout.tsx, .gitignore, lib/__tests__/setup.test.ts
  - Pre-commit: `bun run build`

- [ ] 2. TypeScript Types & Interfaces

  **What to do**:
  - Create `lib/types.ts` with all shared types for the project:
    - `GameState`: currentFen, history (Move[]), isGameOver, gameOverReason, turn, isAiThinking, boardOrientation
    - `Move` (from chess.js re-export or custom): from, to, san, color, piece, captured?, promotion?, flags
    - `DifficultyPreset`: name, label, skillLevel, movetime, description
    - `MoveRequest`: { fen: string, difficulty: string }
    - `MoveResponse`: { bestMove: string | null, from: string, to: string, promotion?: string, isGameOver: boolean }
    - `UCICommand` / `UCIResponse` types for engine communication
  - Write TDD tests first: `lib/__tests__/types.test.ts`
    - Test that type guards work (e.g., `isDifficultyPreset(value)`)
    - Test that type exports are importable
  - Implement types to make tests pass

  **Must NOT do**:
  - Do NOT implement any logic — types and type guards only
  - Do NOT import chess.js types directly — define our own interfaces to decouple

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure type definitions, straightforward TypeScript work
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 5, 6, 10, 11 (need type definitions)
  - **Blocked By**: None (can start immediately)

  **References**:

  **External References**:
  - chess.js Move type: https://github.com/jhlywa/chess.js — see `Move` interface in chess.ts
  - Stockfish UCI protocol spec: http://wbec-ridderkerk.nl/html/UCIProtocol.html

  **Acceptance Criteria**:
  - [ ] `bunx tsc --noEmit` → zero type errors
  - [ ] `bun test lib/__tests__/types.test.ts` → PASS
  - [ ] `lib/types.ts` exports: GameState, DifficultyPreset, MoveRequest, MoveResponse

  **QA Scenarios:**

  ```
  Scenario: Types compile and type guards work
    Tool: Bash
    Preconditions: lib/types.ts created
    Steps:
      1. Run `bunx tsc --noEmit`
      2. Run `bun test lib/__tests__/types.test.ts -- --run`
      3. Check both exit with code 0
    Expected Result: Zero type errors, all type guard tests pass
    Failure Indicators: Type errors, test failures
    Evidence: .sisyphus/evidence/task-2-types-compile.txt
  ```

  **Evidence to Capture:**
  - [ ] task-2-types-compile.txt — tsc + test output

  **Commit**: YES
  - Message: `feat: add TypeScript types for game state, API, and UCI protocol`
  - Files: lib/types.ts, lib/__tests__/types.test.ts
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 3. Dockerfile with Stockfish 17 Built from Source

  **What to do**:
  - Create multi-stage `Dockerfile`:
    - **Stage 1 (stockfish-builder)**: FROM `ubuntu:22.04`
      - `apt-get install -y git g++ make`
      - `git clone --depth 1 --branch sf_17 https://github.com/official-stockfish/Stockfish.git`
      - `cd Stockfish/src && make -j$(nproc) net && make -j$(nproc) build ARCH=x86-64-modern`
    - **Stage 2 (app-builder)**: FROM `oven/bun:1` (or `node:20-slim` with bun installed via `npm i -g bun`)
      - Copy project, `bun install`, `bun run build`
    - **Stage 3 (runner)**: FROM `node:20-slim`
      - Copy Stockfish binary from stage 1: `COPY --from=stockfish-builder /Stockfish/src/stockfish /usr/local/bin/stockfish`
      - Copy standalone Next.js output from stage 2
      - `EXPOSE 3000`, `CMD ["node", "server.js"]`
  - Create `.dockerignore`: node_modules, .next, .git, .sisyphus
  - Test: `docker build . -t chess-ai-test` → verify Stockfish binary exists and responds to `uci` command

  **Must NOT do**:
  - Do NOT use `apt-get install stockfish` (G10 — gives ancient version)
  - Do NOT include NNUE net download separately — `make net` handles it
  - Do NOT add Railway config yet (Task 13)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Docker configuration with well-known patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Tasks 5, 13 (need Stockfish binary path known)
  - **Blocked By**: None (can start immediately)

  **References**:

  **External References**:
  - Stockfish build instructions: https://github.com/official-stockfish/Stockfish/wiki/Compiling-from-source
  - Dockfish reference Dockerfile: https://github.com/ivangabriele/dockfish — multi-stage Docker build pattern for Stockfish
  - Next.js standalone Docker: https://nextjs.org/docs/app/building-your-application/deploying#docker-image

  **Acceptance Criteria**:
  - [ ] `docker build . -t chess-ai-test` → image builds successfully
  - [ ] `docker run --rm chess-ai-test /usr/local/bin/stockfish <<< 'uci' | head -1` → outputs `Stockfish ...`
  - [ ] `.dockerignore` exists and excludes node_modules, .next, .git

  **QA Scenarios:**

  ```
  Scenario: Docker image builds with Stockfish binary
    Tool: Bash
    Preconditions: Dockerfile created
    Steps:
      1. Run `docker build . -t chess-ai-test`
      2. Run `docker run --rm chess-ai-test /usr/local/bin/stockfish <<< 'uci quit'`
      3. Verify output contains "Stockfish" and "uciok"
    Expected Result: Image builds, Stockfish binary responds to UCI
    Failure Indicators: Build failure, missing binary, no UCI response
    Evidence: .sisyphus/evidence/task-3-docker-stockfish.txt

  Scenario: Stockfish binary NOT from apt (guardrail G10)
    Tool: Bash
    Preconditions: Dockerfile exists
    Steps:
      1. Read Dockerfile content
      2. Verify no `apt-get install stockfish` or `apt install stockfish` present
      3. Verify `git clone` of official Stockfish repo and `make build` present
    Expected Result: Stockfish compiled from source, not installed from package manager
    Failure Indicators: Found apt-get/apt install stockfish in Dockerfile
    Evidence: .sisyphus/evidence/task-3-no-apt-stockfish.txt
  ```

  **Evidence to Capture:**
  - [ ] task-3-docker-stockfish.txt — build + run output
  - [ ] task-3-no-apt-stockfish.txt — Dockerfile grep verification

  **Commit**: YES
  - Message: `chore: add Dockerfile with Stockfish 17 built from source`
  - Files: Dockerfile, .dockerignore
  - Pre-commit: `docker build . -t chess-ai-test`

- [ ] 4. Difficulty Presets Module (TDD)

  **What to do**:
  - **RED**: Write tests first in `lib/engine/__tests__/difficulty.test.ts`:
    - Test that 5 presets exist: beginner, easy, intermediate, hard, maximum
    - Test each preset has: name, label, skillLevel (number 0-20), movetime (ms), description
    - Test `getPreset(name)` returns correct preset or throws for unknown name
    - Test `getAllPresets()` returns all 5 sorted by difficulty
    - Test `getUCIOptions(preset)` returns correct UCI option strings
  - **GREEN**: Implement `lib/engine/difficulty.ts`:
    - Define 5 presets:
      - `beginner`: Skill Level 0, movetime 500ms, ~1320 ELO
      - `easy`: Skill Level 5, movetime 1000ms, ~1650 ELO
      - `intermediate`: Skill Level 10, movetime 2000ms, ~2000 ELO
      - `hard`: Skill Level 15, movetime 3000ms, ~2500 ELO
      - `maximum`: Skill Level 20, movetime 5000ms, full strength
    - Export `getPreset()`, `getAllPresets()`, `getUCIOptions()`
  - **REFACTOR**: Clean up, ensure types from Task 2's `DifficultyPreset` are used

  **Must NOT do**:
  - Do NOT reference `Maximum Error` or `Probability` Stockfish options (removed in modern SF)
  - Do NOT use `UCI_LimitStrength` — use `Skill Level` for simplicity

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small module with clear spec, pure functions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 8 (API route needs difficulty presets)
  - **Blocked By**: None (can start immediately — uses inline types if Task 2 not done yet)

  **References**:

  **External References**:
  - Stockfish Skill Level source: https://github.com/official-stockfish/Stockfish/blob/master/src/search.h — `LowestElo = 1320`, `HighestElo = 3190`
  - UCI protocol Skill Level: `setoption name Skill Level value N` where N is 0-20

  **Acceptance Criteria**:
  - [ ] `bun test lib/engine/__tests__/difficulty.test.ts` → PASS (all tests)
  - [ ] 5 presets defined with correct Skill Level values
  - [ ] `getUCIOptions()` returns valid UCI option strings

  **QA Scenarios:**

  ```
  Scenario: All difficulty presets exist and are valid
    Tool: Bash
    Preconditions: lib/engine/difficulty.ts created
    Steps:
      1. Run `bun test lib/engine/__tests__/difficulty.test.ts -- --run`
      2. Verify all tests pass
      3. Verify output shows tests for: beginner, easy, intermediate, hard, maximum
    Expected Result: 5 presets, all tests pass, correct Skill Level mapping
    Failure Indicators: Missing presets, wrong Skill Level values, test failures
    Evidence: .sisyphus/evidence/task-4-difficulty-tests.txt

  Scenario: Invalid preset name throws error
    Tool: Bash
    Preconditions: Module implemented
    Steps:
      1. Run test that calls `getPreset('nonexistent')`
      2. Verify it throws an error
    Expected Result: Throws descriptive error for unknown difficulty name
    Failure Indicators: Returns undefined instead of throwing
    Evidence: .sisyphus/evidence/task-4-difficulty-tests.txt (included in test suite)
  ```

  **Evidence to Capture:**
  - [ ] task-4-difficulty-tests.txt — full test output

  **Commit**: YES
  - Message: `feat: add difficulty presets module with tests`
  - Files: lib/engine/difficulty.ts, lib/engine/__tests__/difficulty.test.ts
  - Pre-commit: `bun test`


### Wave 2 — Core Engine + Game Logic (2 parallel)

- [ ] 5. Stockfish UCI Engine Wrapper (TDD)

  **What to do**:
  - **RED**: Write tests first in `lib/engine/__tests__/stockfish.test.ts`:
    - Test UCI initialization sequence: sends `uci`, receives `uciok`, sends `isready`, receives `readyok`
    - Test `getBestMove(fen, difficulty)`: sends `position fen <fen>`, `go movetime <N>`, returns parsed `bestmove`
    - Test `bestmove (none)` returns `{ bestMove: null, isGameOver: true }`
    - Test move parsing: `bestmove e2e4` → `{ from: 'e2', to: 'e4' }`, `bestmove a7a8q` → `{ from: 'a7', to: 'a8', promotion: 'q' }`
    - Test stdout line buffering: simulate partial chunks, verify lines reassembled correctly
    - Test process crash recovery: mock process exit, verify respawn + error propagation
    - Test FEN validation: invalid FEN rejected before sending to Stockfish
    - Test `newGame()`: sends `ucinewgame` + `isready`, waits for `readyok`
    - Test difficulty application: verify correct `setoption name Skill Level value N` sent
    - Test timeout: if no `bestmove` within 10 seconds, reject with timeout error
  - **GREEN**: Implement `lib/engine/stockfish.ts`:
    - Create singleton module pattern (module-level `let process: ChildProcess | null`)
    - `initEngine()`: spawn `stockfish` (or `/usr/local/bin/stockfish`), send `uci`, wait for `uciok`, send `isready`, wait for `readyok`
    - `getBestMove(fen: string, preset: DifficultyPreset): Promise<MoveResponse>`:
      1. Validate FEN using chess.js `validateFen()`
      2. Send `setoption name Skill Level value ${preset.skillLevel}` (only when idle)
      3. Send `position fen ${fen}`
      4. Send `go movetime ${preset.movetime}`
      5. Collect stdout lines, find `bestmove` line, parse result
      6. Return `{ bestMove, from, to, promotion?, isGameOver }`
    - `newGame()`: send `ucinewgame` + `isready`, wait for `readyok`
    - Stdout buffering: maintain `let buffer = ''`, split on `\n`, keep incomplete last line
    - Crash recovery: listen for `close`/`exit` events, set process to null, next call auto-respawns
    - Timeout: reject Promise after 10 seconds if no `bestmove` received
  - **REFACTOR**: Use types from `lib/types.ts`

  **Must NOT do**:
  - Do NOT spawn a new process per request (Stockfish maintainer: loses hash table)
  - Do NOT use `go infinite` or `go ponder` (G11)
  - Do NOT send `setoption` during search (undefined behavior)
  - Do NOT reference `Maximum Error` or `Probability` options (removed from modern SF)
  - Do NOT skip FEN validation before sending to Stockfish

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex async process management, UCI protocol, crash recovery — requires careful implementation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 6)
  - **Parallel Group**: Wave 2 (with Task 6)
  - **Blocks**: Task 8 (API route depends on engine wrapper)
  - **Blocked By**: Tasks 2, 3 (needs types + Stockfish binary path knowledge)

  **References**:

  **Pattern References**:
  - Dockfish UCI process management: https://github.com/ivangabriele/dockfish/blob/main/server/index.mjs — singleton Stockfish process, stdin/stdout communication
  - Chesskit UCI abstraction: https://github.com/GuillaumeSD/Chesskit/blob/main/src/lib/engine/uciEngine.ts — acquire/release pattern, command queue
  - Tonnetto UCI interface: https://github.com/marcobuontempo/tonnetto/blob/main/src/uci.ts — clean UCI command parsing

  **External References**:
  - UCI protocol spec: http://wbec-ridderkerk.nl/html/UCIProtocol.html
  - Stockfish maintainer guidance (don't restart): https://github.com/official-stockfish/Stockfish/discussions/5075#discussioncomment-8582941
  - Stockfish search.h (Skill Level ELO mapping): https://github.com/official-stockfish/Stockfish/blob/master/src/search.h

  **Acceptance Criteria**:
  - [ ] `bun test lib/engine/__tests__/stockfish.test.ts` → PASS (all tests)
  - [ ] Engine initializes and responds to UCI commands
  - [ ] `bestmove (none)` handled as game-over
  - [ ] Stdout line buffering works with partial chunks
  - [ ] Process crash triggers auto-respawn on next call
  - [ ] FEN validation rejects invalid input before sending to engine

  **QA Scenarios:**

  ```
  Scenario: Engine returns valid best move for starting position
    Tool: Bash
    Preconditions: Stockfish binary available on PATH or /usr/local/bin/stockfish
    Steps:
      1. Run `bun test lib/engine/__tests__/stockfish.test.ts -- --run`
      2. Verify test "getBestMove returns valid move for starting position" passes
      3. Verify returned move matches UCI format (e.g., e2e4, d2d4)
    Expected Result: Valid UCI move returned within 5 seconds
    Failure Indicators: Timeout, invalid move format, process crash
    Evidence: .sisyphus/evidence/task-5-engine-bestmove.txt

  Scenario: Engine handles bestmove (none) for game-over position
    Tool: Bash
    Preconditions: Engine wrapper implemented
    Steps:
      1. Run test with checkmate FEN: `rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3`
      2. Verify response has `bestMove: null` and `isGameOver: true`
    Expected Result: Game-over detected, no crash
    Failure Indicators: Throws error, hangs, returns invalid move
    Evidence: .sisyphus/evidence/task-5-engine-gameover.txt

  Scenario: Engine recovers from process crash
    Tool: Bash
    Preconditions: Engine wrapper with crash recovery implemented
    Steps:
      1. Run test that kills Stockfish process mid-operation
      2. Verify error is propagated for the failed request
      3. Run a subsequent getBestMove call
      4. Verify it succeeds (process auto-respawned)
    Expected Result: First call fails gracefully, second call works after respawn
    Failure Indicators: Unhandled exception, process not respawned, second call hangs
    Evidence: .sisyphus/evidence/task-5-engine-crash-recovery.txt
  ```

  **Evidence to Capture:**
  - [ ] task-5-engine-bestmove.txt — test output for valid moves
  - [ ] task-5-engine-gameover.txt — test output for game-over handling
  - [ ] task-5-engine-crash-recovery.txt — test output for crash recovery

  **Commit**: YES
  - Message: `feat: add Stockfish UCI engine wrapper with crash recovery`
  - Files: lib/engine/stockfish.ts, lib/engine/__tests__/stockfish.test.ts
  - Pre-commit: `bun test`

- [ ] 6. useChessGame React Hook (TDD)

  **What to do**:
  - **RED**: Write tests first in `hooks/__tests__/useChessGame.test.ts` (using @testing-library/react `renderHook`):
    - Test initial state: starting FEN, empty history, isGameOver=false, turn='w', isAiThinking=false
    - Test `makeMove(from, to)`: updates FEN, adds to history, returns true for legal move
    - Test `makeMove` with illegal move: try/catch returns false, state unchanged
    - Test `makeMove` with promotion: accepts promotion param, applies correctly
    - Test `undoMove()`: undoes 2 half-moves (user + AI), restores FEN and history
    - Test `undoMove()` on empty history: returns false, state unchanged
    - Test `undoMove()` with only 1 move: returns false (can't undo just user's move without AI response)
    - Test `newGame()`: resets to starting position, clears history, isGameOver=false
    - Test `flipBoard()`: toggles boardOrientation between 'white' and 'black'
    - Test `setAiThinking(true/false)`: updates isAiThinking state
    - Test `isPromotion(from, to)`: detects pawn reaching 8th/1st rank
    - Test game-over detection: checkmate, stalemate, threefold, 50-move, insufficient material
    - Test `applyAiMove(from, to, promotion?)`: applies engine's move to game state
  - **GREEN**: Implement `hooks/useChessGame.ts`:
    - Use `useState` for `game` (Chess instance) + `useRef` for `gameRef` (stale closure prevention)
    - Sync ref on every render: `gameRef.current = game`
    - All callbacks use `gameRef.current` for mutations, then `setGame(new Chess(gameRef.current.fen()))` to trigger re-render
    - All `chess.move()` calls wrapped in try/catch (v1.4.0 throws, not null)
    - `undoMove`: call `game.undo()` twice (undo AI + user move)
    - `isPromotion`: use `chess.moves({ square: from, verbose: true })` to check if any move to `to` has promotion flag
    - Game-over: check after every move via `game.isGameOver()`, set reason from `isCheckmate()`, `isStalemate()`, `isDraw()`, `isThreefoldRepetition()`, `isInsufficientMaterial()`
    - Return: `{ game state values, makeMove, undoMove, newGame, flipBoard, setAiThinking, isPromotion, applyAiMove }`
  - **REFACTOR**: Use types from `lib/types.ts`

  **Must NOT do**:
  - Do NOT use `game.move()` without try/catch (G12 — v1.4.0 throws)
  - Do NOT use `setGame(game)` for re-render (mutation not detected) — always `new Chess(fen)`
  - Do NOT use `move.flags` field (deprecated in v1.4.0) — use `.isCapture()`, `.isEnPassant()` etc.
  - Do NOT auto-promote to queen (G13) — always check `isPromotion()` first
  - Do NOT undo just 1 half-move — always undo 2 (user + AI)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex React state management with chess.js, stale closure prevention, game logic
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `vercel-react-best-practices`: Would add React optimization patterns but core logic is chess-specific, not perf-focused

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 5)
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: Task 9 (Board component depends on game hook)
  - **Blocked By**: Tasks 1, 2 (needs React project + types)

  **References**:

  **Pattern References**:
  - react-chessboard official chess.js example: https://github.com/Clariity/react-chessboard/blob/main/docs/B_BasicExamples.mdx — `gameRef` pattern, `new Chess(fen)` for re-render
  - chess.js API: https://github.com/jhlywa/chess.js — `.move()` throws in v1.4.0, `.isPromotion()`, `.undo()`

  **External References**:
  - chess.js v1.4.0 API: `.move()` throws Error, not returns null. Source: chess.ts L1720-L1723
  - React Testing Library renderHook: https://testing-library.com/docs/react-testing-library/api/#renderhook

  **Acceptance Criteria**:
  - [ ] `bun test hooks/__tests__/useChessGame.test.ts` → PASS (all tests)
  - [ ] All `chess.move()` calls use try/catch (grep verify)
  - [ ] `useRef` pattern used for chess.js instance
  - [ ] Undo always removes 2 half-moves
  - [ ] All 5 game-over conditions detected correctly

  **QA Scenarios:**

  ```
  Scenario: Full game state lifecycle
    Tool: Bash
    Preconditions: Hook implemented, vitest configured
    Steps:
      1. Run `bun test hooks/__tests__/useChessGame.test.ts -- --run`
      2. Verify all tests pass including:
         - Initial state matches starting position
         - Legal move updates state correctly
         - Illegal move rejected without state change
         - Undo restores state after 2 half-moves
    Expected Result: All state transitions correct, no stale closure bugs
    Failure Indicators: Stale state in callbacks, undo removing wrong number of moves
    Evidence: .sisyphus/evidence/task-6-game-hook-tests.txt

  Scenario: Game-over detection for all 5 conditions
    Tool: Bash
    Preconditions: Hook implemented
    Steps:
      1. Run tests that set up positions for: checkmate, stalemate, threefold rep, 50-move, insufficient material
      2. Verify each triggers isGameOver=true with correct gameOverReason
    Expected Result: All 5 game-over types detected and reported
    Failure Indicators: Missing detection, wrong reason string
    Evidence: .sisyphus/evidence/task-6-gameover-detection.txt

  Scenario: No stale closure bugs (useRef verification)
    Tool: Bash (grep)
    Preconditions: Hook implemented
    Steps:
      1. Grep hooks/useChessGame.ts for `useRef`
      2. Verify `gameRef.current` used in all callbacks (not `game` directly)
      3. Grep for `setGame(new Chess(` pattern (not `setGame(game)`)
    Expected Result: Ref pattern used correctly, re-render via new Chess instance
    Failure Indicators: Direct `game` access in callbacks, `setGame(game)` mutation
    Evidence: .sisyphus/evidence/task-6-ref-pattern.txt
  ```

  **Evidence to Capture:**
  - [ ] task-6-game-hook-tests.txt — full test output
  - [ ] task-6-gameover-detection.txt — game-over test results
  - [ ] task-6-ref-pattern.txt — grep verification of useRef pattern

  **Commit**: YES
  - Message: `feat: add useChessGame hook with full game state management`
  - Files: hooks/useChessGame.ts, hooks/__tests__/useChessGame.test.ts
  - Pre-commit: `bun test`

### Wave 3 — API + UI Components (5 parallel)

- [ ] 7. Custom Pawn Promotion Dialog Component

  **What to do**:
  - **RED**: Write tests in `components/__tests__/PromotionDialog.test.tsx`:
    - Test renders 4 piece options (Queen, Rook, Bishop, Knight) with correct piece images/icons
    - Test clicking a piece calls `onSelect` callback with correct piece letter ('q', 'r', 'b', 'n')
    - Test dialog shows only when `isOpen=true`
    - Test dialog renders as an overlay positioned near the promotion square
  - **GREEN**: Implement `components/PromotionDialog.tsx`:
    - Overlay component with 4 piece buttons (Q/R/B/N)
    - Accepts props: `isOpen: boolean`, `color: 'w' | 'b'`, `onSelect: (piece: string) => void`
    - Show white/black piece images based on `color` prop
    - Positioned absolutely, styled with Tailwind
  - **REFACTOR**: Clean styling

  **Must NOT do**:
  - Do NOT auto-select queen (G13)
  - Do NOT reference `onPromotionPieceSelect` or `onPromotionCheck` props (removed in react-chessboard v4)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with visual design decisions, overlay positioning
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8-11)
  - **Blocks**: Task 12 (integration needs promotion dialog)
  - **Blocked By**: Task 1 (needs React project)

  **References**:
  - react-chessboard piece images: Use `react-chessboard` piece image conventions for consistency

  **Acceptance Criteria**:
  - [ ] `bun test components/__tests__/PromotionDialog.test.tsx` → PASS
  - [ ] All 4 piece options render and are clickable
  - [ ] Callback receives correct piece letter

  **QA Scenarios:**
  ```
  Scenario: Promotion dialog shows 4 pieces and handles selection
    Tool: Bash
    Steps:
      1. Run `bun test components/__tests__/PromotionDialog.test.tsx -- --run`
      2. Verify all tests pass
    Expected Result: 4 piece options render, click triggers callback with correct piece
    Evidence: .sisyphus/evidence/task-7-promotion-dialog.txt
  ```

  **Commit**: YES
  - Message: `feat: add custom pawn promotion dialog component`
  - Files: components/PromotionDialog.tsx, components/__tests__/PromotionDialog.test.tsx
  - Pre-commit: `bun test`

- [ ] 8. POST /api/move API Route (TDD)

  **What to do**:
  - **RED**: Write tests in `app/api/move/__tests__/route.test.ts`:
    - Test POST with valid FEN + difficulty → returns `{ bestMove, from, to, promotion?, isGameOver }` with 200
    - Test POST with invalid FEN → returns 400 with error message
    - Test POST with unknown difficulty name → returns 400
    - Test POST with missing body fields → returns 400
    - Test response when engine returns `bestmove (none)` → `{ bestMove: null, isGameOver: true }`
    - Test POST with game-over FEN (checkmate position) → returns game-over response
  - **GREEN**: Implement `app/api/move/route.ts`:
    - Parse JSON body: `{ fen: string, difficulty: string }`
    - Validate FEN using chess.js `validateFen()`
    - Look up difficulty preset using `getPreset(difficulty)` from Task 4
    - Call `getBestMove(fen, preset)` from Task 5's engine wrapper
    - Return JSON response with correct shape
    - Handle errors: invalid FEN (400), unknown difficulty (400), engine error (500)
  - **REFACTOR**: Add proper error types

  **Must NOT do**:
  - Do NOT spawn a new Stockfish process — use singleton from Task 5
  - Do NOT bypass FEN validation
  - Do NOT send `go infinite` (G11) — always use preset's `movetime`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: API integration with engine, error handling, request validation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9-11)
  - **Blocks**: Task 12 (integration needs API route)
  - **Blocked By**: Tasks 4, 5 (needs difficulty presets + engine wrapper)

  **References**:
  - `lib/engine/stockfish.ts` (Task 5) — `getBestMove()` function
  - `lib/engine/difficulty.ts` (Task 4) — `getPreset()` function
  - `lib/types.ts` (Task 2) — `MoveRequest`, `MoveResponse` types

  **Acceptance Criteria**:
  - [ ] `bun test app/api/move/__tests__/route.test.ts` → PASS
  - [ ] `curl -X POST /api/move` with valid payload returns 200 + valid move
  - [ ] `curl -X POST /api/move` with invalid FEN returns 400

  **QA Scenarios:**
  ```
  Scenario: API returns valid move for starting position
    Tool: Bash (curl)
    Steps:
      1. Start dev server: `bun run dev &`
      2. Run: `curl -s -X POST http://localhost:3000/api/move -H 'Content-Type: application/json' -d '{"fen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1","difficulty":"intermediate"}'`
      3. Verify response has `bestMove` field matching UCI format (4-5 chars)
      4. Verify HTTP status is 200
    Expected Result: JSON response with valid move within 5 seconds
    Evidence: .sisyphus/evidence/task-8-api-valid-move.txt

  Scenario: API rejects invalid FEN
    Tool: Bash (curl)
    Steps:
      1. Run: `curl -s -w '%{http_code}' -X POST http://localhost:3000/api/move -H 'Content-Type: application/json' -d '{"fen":"not-a-valid-fen","difficulty":"easy"}'`
      2. Verify HTTP status is 400
      3. Verify response contains error message about invalid FEN
    Expected Result: 400 status with descriptive error
    Evidence: .sisyphus/evidence/task-8-api-invalid-fen.txt
  ```

  **Commit**: YES
  - Message: `feat: add POST /api/move route with difficulty support`
  - Files: app/api/move/route.ts, app/api/move/__tests__/route.test.ts
  - Pre-commit: `bun test`

- [ ] 9. Chessboard Component

  **What to do**:
  - **RED**: Write tests in `components/__tests__/Board.test.tsx`:
    - Test renders react-chessboard with correct FEN position
    - Test `onPieceDrop` callback triggers `makeMove` from game hook
    - Test `canDragPiece` prevents moving opponent's pieces (checks `piece[0] === game.turn()`)
    - Test board disables dragging when `isAiThinking=true`
    - Test board orientation matches `boardOrientation` from game state
    - Test promotion detection: when `isPromotion()` returns true, shows PromotionDialog
  - **GREEN**: Implement `components/Board.tsx`:
    - Use `Chessboard` from `react-chessboard`
    - Wire props: `position={fen}`, `onPieceDrop`, `boardOrientation`, `isDraggablePiece`
    - `isDraggablePiece`: return false if `isAiThinking`, or if piece color ≠ turn
    - On drop: check `isPromotion(from, to)` — if yes, show PromotionDialog; if no, call `makeMove(from, to)`
    - When promotion selected: call `makeMove(from, to, promotionPiece)`
  - **REFACTOR**: Clean up prop threading

  **Must NOT do**:
  - Do NOT add legal move dots/highlights (G2)
  - Do NOT auto-promote to queen (G13)
  - Do NOT add sound effects (G6)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: React component integration with chess UI library
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 10, 11)
  - **Blocks**: Task 12
  - **Blocked By**: Task 6 (needs useChessGame hook)

  **References**:
  - react-chessboard API: https://www.npmjs.com/package/react-chessboard — `Chessboard` props
  - `hooks/useChessGame.ts` (Task 6) — game state + makeMove + isPromotion
  - `components/PromotionDialog.tsx` (Task 7) — promotion piece selection

  **Acceptance Criteria**:
  - [ ] `bun test components/__tests__/Board.test.tsx` → PASS
  - [ ] Board renders with correct position from FEN
  - [ ] Dragging disabled during AI thinking
  - [ ] Promotion dialog appears for pawn promotion moves

  **QA Scenarios:**
  ```
  Scenario: Board renders and drag restriction works
    Tool: Bash
    Steps:
      1. Run `bun test components/__tests__/Board.test.tsx -- --run`
      2. Verify drag restriction tests pass (can't move opponent pieces, disabled during AI thinking)
    Expected Result: All board tests pass
    Evidence: .sisyphus/evidence/task-9-board-tests.txt
  ```

  **Commit**: YES
  - Message: `feat: add chessboard component with drag-and-drop`
  - Files: components/Board.tsx, components/__tests__/Board.test.tsx
  - Pre-commit: `bun test`

- [ ] 10. Move History + Game Status Components

  **What to do**:
  - **RED**: Write tests for both components:
    - `MoveHistory`: renders move pairs (1. e4 e5 2. Nf3 Nc6...), scrolls to bottom on new move, shows empty state
    - `GameStatus`: shows "Check!" when in check, "Checkmate — [color] wins!", "Stalemate — Draw", "Draw by [reason]"
  - **GREEN**: Implement `components/MoveHistory.tsx`:
    - Accepts `history: Move[]` from game hook
    - Renders as numbered move pairs in scrollable container
    - Auto-scrolls to bottom when new moves added (useEffect + scrollIntoView)
    - Highlights last move
  - **GREEN**: Implement `components/GameStatus.tsx`:
    - Accepts game state: `isCheck`, `isGameOver`, `gameOverReason`, `turn`
    - Conditional rendering based on game state

  **Must NOT do**:
  - Do NOT add move annotations (G9)
  - Do NOT add PGN export (G3)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI display components with conditional rendering and scroll behavior
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 12
  - **Blocked By**: Task 2 (needs Move type)

  **Acceptance Criteria**:
  - [ ] Tests pass for both MoveHistory and GameStatus
  - [ ] Move pairs rendered correctly in algebraic notation
  - [ ] All game-over messages display correctly

  **QA Scenarios:**
  ```
  Scenario: Move history and game status render correctly
    Tool: Bash
    Steps:
      1. Run `bun test components/__tests__/MoveHistory.test.tsx components/__tests__/GameStatus.test.tsx -- --run`
      2. Verify all tests pass
    Expected Result: Move pairs numbered correctly, status messages match game state
    Evidence: .sisyphus/evidence/task-10-history-status.txt
  ```

  **Commit**: YES
  - Message: `feat: add move history and game status components`
  - Files: components/MoveHistory.tsx, components/GameStatus.tsx, tests
  - Pre-commit: `bun test`

- [ ] 11. Game Controls Panel

  **What to do**:
  - **RED**: Write tests in `components/__tests__/GameControls.test.tsx`:
    - Test "New Game" button calls `onNewGame` callback
    - Test difficulty dropdown shows 5 presets, calls `onDifficultyChange` on selection
    - Test "Undo" button calls `onUndo`, disabled when `canUndo=false`
    - Test "Flip Board" button calls `onFlipBoard`
    - Test Undo disabled during AI thinking
  - **GREEN**: Implement `components/GameControls.tsx`:
    - Row/column of control buttons styled with Tailwind
    - Difficulty dropdown using `getAllPresets()` from Task 4
    - Props: `onNewGame`, `onUndo`, `onFlipBoard`, `onDifficultyChange`, `currentDifficulty`, `canUndo`, `isAiThinking`

  **Must NOT do**:
  - Do NOT add clock/timer controls (G4)
  - Do NOT add draw offer or resign buttons (G8)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Interactive control panel with form elements and state management
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 12
  - **Blocked By**: Task 2 (needs DifficultyPreset type)

  **Acceptance Criteria**:
  - [ ] `bun test components/__tests__/GameControls.test.tsx` → PASS
  - [ ] 5 difficulty presets shown in dropdown
  - [ ] Undo button disabled when appropriate

  **QA Scenarios:**
  ```
  Scenario: Game controls render and respond to interaction
    Tool: Bash
    Steps:
      1. Run `bun test components/__tests__/GameControls.test.tsx -- --run`
      2. Verify all button and dropdown interaction tests pass
    Expected Result: All controls functional, undo disabled when canUndo=false
    Evidence: .sisyphus/evidence/task-11-game-controls.txt
  ```

  **Commit**: YES
  - Message: `feat: add game controls panel`
  - Files: components/GameControls.tsx, components/__tests__/GameControls.test.tsx
  - Pre-commit: `bun test`

### Wave 4 — Integration + Deploy (3 tasks)

- [ ] 12. Main Game Page — Wire All Components

  **What to do**:
  - Implement `app/page.tsx` as the single game page:
    - Initialize `useChessGame` hook
    - State: `currentDifficulty` (default: 'intermediate')
    - Layout: Board (left/center) + side panel (controls, move history, status)
    - Wire user move flow:
      1. User drops piece → `makeMove(from, to)` or show promotion dialog
      2. If move valid and not game over: `setAiThinking(true)` → `fetch('/api/move', { fen, difficulty })` → `applyAiMove(response)` → `setAiThinking(false)`
      3. If game over: display status, disable board
    - Wire controls: New Game resets game + sends `fetch('/api/newgame')`, Undo calls `undoMove()`, Flip calls `flipBoard()`
    - Add `/api/newgame` route (sends `ucinewgame` to engine)
    - Loading indicator during AI thinking (e.g., subtle spinner or "AI is thinking..." text)
    - Global styles in `app/globals.css` (minimal: centered layout, clean typography)
    - Responsive enough to look good on desktop (mobile optimization NOT required for V1)

  **Must NOT do**:
  - Do NOT add eval bar or analysis (G1)
  - Do NOT add multiple themes (G5)
  - Do NOT add accounts/auth (G7)
  - Do NOT over-engineer layout — single page, clean and minimal

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Integration of all components, async flow management, error handling across boundaries
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Helps craft a polished layout despite minimal scope

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on all Wave 3 tasks)
  - **Parallel Group**: Wave 4 (sequential start)
  - **Blocks**: Tasks 13, 14
  - **Blocked By**: Tasks 7, 8, 9, 10, 11 (all UI components + API route)

  **References**:
  - All component files from Tasks 7-11
  - `hooks/useChessGame.ts` (Task 6) — all game state and actions
  - `app/api/move/route.ts` (Task 8) — API contract

  **Acceptance Criteria**:
  - [ ] `bun run build` → production build succeeds
  - [ ] Page renders board with all controls
  - [ ] User move triggers AI response
  - [ ] Game over displays correct status
  - [ ] All controls (new game, undo, flip, difficulty) functional

  **QA Scenarios:**
  ```
  Scenario: Full game loop — user move triggers AI response
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Verify chessboard renders with starting position
      3. Drag white pawn from e2 to e4 (or click e2 then e4)
      4. Wait for AI thinking indicator to appear
      5. Wait for AI move to be applied (max 10 seconds)
      6. Verify board position has changed (not starting position)
      7. Verify move history shows "1. e4 [AI move]"
      8. Screenshot the board state
    Expected Result: User plays e4, AI responds within 10s, history updated
    Evidence: .sisyphus/evidence/task-12-game-loop.png

  Scenario: New Game resets everything
    Tool: Playwright
    Steps:
      1. Play 2-3 moves
      2. Click "New Game" button
      3. Verify board returns to starting position
      4. Verify move history is empty
      5. Verify game status is clear
    Expected Result: Complete reset to initial state
    Evidence: .sisyphus/evidence/task-12-new-game.png

  Scenario: Undo removes user and AI move
    Tool: Playwright
    Steps:
      1. Play one move, wait for AI response
      2. Note the board position
      3. Click Undo
      4. Verify board returns to position before user's last move
      5. Verify move history has 2 fewer entries
    Expected Result: Board and history revert by 2 half-moves
    Evidence: .sisyphus/evidence/task-12-undo.png
  ```

  **Commit**: YES
  - Message: `feat: integrate all components into main game page`
  - Files: app/page.tsx, app/globals.css, app/api/newgame/route.ts
  - Pre-commit: `bun run build`

- [ ] 13. Railway Deployment Config + Docker Validation

  **What to do**:
  - Create `railway.toml`:
    ```toml
    [build]
    builder = "dockerfile"
    dockerfilePath = "Dockerfile"
    
    [deploy]
    startCommand = "node server.js"
    healthcheckPath = "/"
    restartPolicyType = "on_failure"
    restartPolicyMaxRetries = 3
    ```
  - Full Docker validation:
    - `docker build . -t chess-ai` → image builds
    - `docker run -d -p 3000:3000 --name chess-test chess-ai` → app starts
    - `curl http://localhost:3000` → returns HTML
    - `curl -X POST http://localhost:3000/api/move ...` → returns move
    - `docker stop chess-test && docker rm chess-test`

  **Must NOT do**:
  - Do NOT actually deploy to Railway (user does this manually)
  - Do NOT add environment variables with secrets

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration file + Docker smoke test
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 14)
  - **Parallel Group**: Wave 4
  - **Blocks**: Final verification wave
  - **Blocked By**: Tasks 3, 12

  **Acceptance Criteria**:
  - [ ] `railway.toml` exists with correct config
  - [ ] Full Docker build + run + curl test passes

  **QA Scenarios:**
  ```
  Scenario: Docker container serves app and AI responds
    Tool: Bash
    Steps:
      1. Run `docker build . -t chess-ai`
      2. Run `docker run -d -p 3000:3000 --name chess-test chess-ai && sleep 10`
      3. Run `curl -s http://localhost:3000 | grep -qi chess`
      4. Run `curl -s -X POST http://localhost:3000/api/move -H 'Content-Type: application/json' -d '{"fen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1","difficulty":"easy"}' | jq .bestMove`
      5. Verify bestMove is a valid UCI string
      6. Run `docker stop chess-test && docker rm chess-test`
    Expected Result: App serves HTML, AI returns valid move in container
    Evidence: .sisyphus/evidence/task-13-docker-full.txt
  ```

  **Commit**: YES
  - Message: `chore: add Railway deployment config`
  - Files: railway.toml
  - Pre-commit: `docker build .`

- [ ] 14. E2E Playwright Tests

  **What to do**:
  - Install Playwright: `bun add -d @playwright/test && bunx playwright install chromium`
  - Create `playwright.config.ts` with webServer pointing to `bun run dev`
  - Write E2E tests in `e2e/game.spec.ts`:
    - Test: Page loads with chessboard visible (assert board element exists)
    - Test: Make a move (drag e2→e4 or click), AI responds within 10s
    - Test: Move history updates after user + AI move
    - Test: New Game button resets board to starting position
    - Test: Undo button reverts last move pair
    - Test: Flip board changes perspective
    - Test: Difficulty selector shows 5 options
    - Test: Game status displays "Check" when in check (use Fool's Mate setup if needed)
  - All tests capture screenshots as evidence

  **Must NOT do**:
  - Do NOT test with Docker (test against dev server for speed)
  - Do NOT test mobile viewports (not in V1 scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: E2E test authoring with Playwright, requires understanding of full app flow
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation for E2E testing

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 13)
  - **Parallel Group**: Wave 4
  - **Blocks**: Final verification wave
  - **Blocked By**: Task 12 (needs complete app)

  **Acceptance Criteria**:
  - [ ] `bunx playwright test` → all tests pass
  - [ ] Screenshots captured for each test scenario

  **QA Scenarios:**
  ```
  Scenario: E2E test suite passes
    Tool: Bash
    Steps:
      1. Run `bunx playwright test --reporter=list`
      2. Verify all tests pass
      3. Verify screenshot evidence files exist
    Expected Result: All E2E tests pass, screenshots saved
    Evidence: .sisyphus/evidence/task-14-e2e-results.txt
  ```

  **Commit**: YES
  - Message: `test: add E2E Playwright tests for full game flow`
  - Files: e2e/game.spec.ts, playwright.config.ts
  - Pre-commit: `bunx playwright test`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `bunx tsc --noEmit` + `bun run lint` + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp). Verify all chess.js `.move()` calls use try/catch (G12). Verify `useRef` pattern used for chess.js instance in hooks.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state (`docker build && docker run`). Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration: play a full game from e4 to checkmate, undo mid-game, change difficulty mid-game, flip board and continue playing. Test edge cases: undo on first move, new game during AI thinking, promotion to knight. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check all "Must NOT do" guardrails (G1-G13) — search codebase for violations. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Guardrails [13/13 clean] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| After Task(s) | Commit Message | Files | Pre-commit |
|:---:|:---|:---|:---|
| 1 | `chore: scaffold Next.js project with vitest and dependencies` | package.json, tsconfig.json, vitest.config.ts, next.config.ts, app/layout.tsx, .gitignore | `bun run build` |
| 2 | `feat: add TypeScript types for game state, API, and UCI protocol` | lib/types.ts | `bunx tsc --noEmit` |
| 3 | `chore: add Dockerfile with Stockfish 17 built from source` | Dockerfile, .dockerignore | `docker build . -t chess-ai-test` |
| 4 | `feat: add difficulty presets module with tests` | lib/engine/difficulty.ts, lib/engine/difficulty.test.ts | `bun test` |
| 5 | `feat: add Stockfish UCI engine wrapper with crash recovery` | lib/engine/stockfish.ts, lib/engine/stockfish.test.ts | `bun test` |
| 6 | `feat: add useChessGame hook with full game state management` | hooks/useChessGame.ts, hooks/useChessGame.test.ts | `bun test` |
| 7 | `feat: add custom pawn promotion dialog component` | components/PromotionDialog.tsx, components/PromotionDialog.test.tsx | `bun test` |
| 8 | `feat: add POST /api/move route with difficulty support` | app/api/move/route.ts, app/api/move/route.test.ts | `bun test` |
| 9 | `feat: add chessboard component with drag-and-drop` | components/Board.tsx, components/Board.test.tsx | `bun test` |
| 10 | `feat: add move history and game status components` | components/MoveHistory.tsx, components/GameStatus.tsx, tests | `bun test` |
| 11 | `feat: add game controls panel` | components/GameControls.tsx, components/GameControls.test.tsx | `bun test` |
| 12 | `feat: integrate all components into main game page` | app/page.tsx, app/globals.css | `bun run build` |
| 13 | `chore: add Railway deployment config` | railway.toml | `docker build .` |
| 14 | `test: add E2E Playwright tests for full game flow` | e2e/*.spec.ts, playwright.config.ts | `bunx playwright test` |

---

## Success Criteria

### Verification Commands
```bash
bun test                           # Expected: all tests pass
bun run build                      # Expected: Next.js production build succeeds
bunx tsc --noEmit                  # Expected: zero type errors
docker build . -t chess-ai         # Expected: image builds with Stockfish binary
docker run -d -p 3000:3000 chess-ai && sleep 5 && curl -s http://localhost:3000 | grep -q "chess"  # Expected: app serves HTML
curl -s -X POST http://localhost:3000/api/move -H 'Content-Type: application/json' -d '{"fen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1","difficulty":"intermediate"}' | jq .bestMove  # Expected: valid UCI move
bunx playwright test               # Expected: E2E tests pass
```

### Final Checklist
- [ ] All "Must Have" features present and working
- [ ] All "Must NOT Have" guardrails (G1-G13) verified clean
- [ ] All tests pass (`bun test`)
- [ ] Production build succeeds (`bun run build`)
- [ ] Docker image builds and runs
- [ ] Railway deployment accessible
- [ ] AI responds to moves within 5 seconds at all difficulty levels
