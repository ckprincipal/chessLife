# Release notes — Stale-Mate v0.5.10 (2026-10-31)

## Implemented at the user's request

1. **Two Traditional rooks restored:** `K1 Q1 R2 N2 B2 P2` (10 starting military pieces). Rook stays **2 CP**; bishop stays **1 CP**.
2. **Middle receives two additional pawns:** `K1 N2 P6` (9 pieces).
3. **Flatten receives four additional pawns:** `K1 P9` (10 pieces).
4. **Preserved from v0.5.9:** No starting training camps in Standard mode (both sides). A Pawn builds a first camp only after reaching **level 4**, with normal three-turn construction; King XP recruitment waits for a completed camp. Optional **Quick Start** enables one starter camp per side, and is explicitly **not** the default.
5. No separate invulnerable engineer (carried over from v0.5.9). No new training-camp count limit or CP-subsidy mechanics. Historical army presets and old save armies are preserved.
6. Updated in-game descriptions, roster selectors, King/pawn panels, default status messages, and export filenames.
7. **Save schema 15** supports prior version 5–14 command-camp saves without replacing existing units or facilities. Real v0.5.8 and v0.5.9 roster/camp migrations are explicitly tested.

## Skills status (not newly invented in this release)

Previous **v0.5.6** implementation remains intact: slot capacities P/N/B/R/Q/K = `0/1/1/2/3/2`, 36 prototype authored Pawn skills, Pawns choose one of three at levels 3/6/9/etc., with practical effects for scouting, work, defense, and movement. Non-Pawn full choice-tree authoring is incomplete; starting slot counts alone do not mean these are complete trees. Per-Pawn skill routes can be displayed with varying disclosure modes but have no hidden perks.

## Tests executed

- `organization_v0510.cjs`: **41/41** (exact 10/9/10 rosters, 30/50/70, mixed matchups, 0-camp default, Quick Start, future camp construction, R2/B1 costs, real v0.5.8 and v0.5.9 imported save fidelity, AI validity)
- `regression_v0510.cjs`: **23/23** (historical camp-recruitment behaviors deliberately exercised using explicit Quick Start; new default separately tested above)
- `pawn_workers_v0510.cjs`: **54/54**
- `skills_v0510.cjs`: **55/55**
- Randomized: **36 + 24 maps, 5,495 + 2,917 = 8,412 actions**; all recorded invariants pass
- Browser: organizational **38/38**, worker **46/46**, skills **48/48** = **132/132** real Chromium checks, zero page errors
- Offline HTML rebuilt from separate `prototype/*` files; clean archive extraction, all file hashes, and rerun validation required before handoff

**Outstanding gameplay risk:** a Standard match with all Pawn-workers captured before camp construction cannot recruit a replacement. This could be legitimate loss of infrastructure rather than an engine bug, but should be playtested. User specifically deferred training-camp proliferation controls. **No claim of balance, fun, or Unity runtime parity.**
