# ChessLife — Codex implementation handoff v0.2

**Mission:** Implement a genuinely fun, testable 50×50 tactical chess-RPG, faithfully following `DESIGN_BIBLE.md`. The design bible is the authoritative product document. Keep gameplay choices reversible and balance numbers in data/config, not hardwired throughout UI.

## Engineering non-negotiables

1. **Deterministic, separately testable engine**: seedable RNG; pure or isolated game transitions; event log; easy save/load; modelable 30×30/50×50/70×70 board. No perfect-information AI under fog.
2. **Three-state fog** for each side: black never seen / pale mist remembered terrain / clear present sight. Never show current enemy positions through old sightings; ghost icons if used are explicitly stale. No hidden-information leaks through selection previews, error text, or bot targeting.
3. **Movement:** traditional chess geometry, maximum seven squares for straight/diagonal sliders on enlarged boards; terrain blocking; king vulnerable to capture; no stalemate; no royal queen.
4. **Progression:** independently tracked unit IDs, XP and levels 1–99, king multiplier 1.5, queen intentionally slow, anti-farm credits for *first discoveries by team* (0.30 per new cell), profession choices and role-appropriate upgrades; skill growth changes decisions, not pure stats.
5. **Choice Queen:** spells MUST offer meaningful sacrifice / nonlethal siphon / mercy-protection alternatives with opportunity costs. Devoted pawn special 100% conversion balanced by serious development drawback; no summon-sacrifice economy loop.
6. **UX:** zoom, pan, minimap, inspect piece status and next levels, strong colorblind-accessible fog differentiation, show XP earned in log, clear skills and costs, no wall of 2,500 buttons.

## Suggested parallel work packets (separate branches, with small reviewable PRs)

### Codex A — Rules, state, deterministic map
Deliver pure engine and tests for seeded mirrored terrain, 30/50/70 board, army placement, movement constraints, obstacles, king capture, action accounting, automatic pass if no actions; undoable events. Include tests for 50-tile attack-line prohibition and no stalemate.

### Codex B — Fog-of-war and XP correctness
Deliver independently testable FOW observer with explored memory, transient visible cells, last-seen ghost model, occlusion, scout/beacon duration/costs; award +0.30 XP only once per team per discovered tile; king/queen XP modifiers; tests for repeated tile visits and hidden enemy non-leakage. Coordinate clear interfaces with Codex A.

### Codex C — RPG levels and classes
Deliver data-driven XP ladder through L99, per-unit profession/skill trees (swimmer/mountaineer/scout/ninja), bonds/loyalty XP, king summons with cooldowns/costs/supply, decayed value of new summons; deterministic 30% non-chainable Ninja extra action. Tests for all rewards and capped procs.

### Codex D — Queen routes and choice economy
Implement three mutually exclusive routes. War (local massive versus global modest passive), Phantom (stealth/decoys + counters), Choice/Blood (sacrifice / nonlethal siphon / spare) with rank-scaling power-versus-efficiency points and anti-exploit protection; no second-king mechanic. Provide 3 small scenario fixtures, one per route, and short fun/balance notes.

### Codex E — UI/UX and save system
Deliver responsive canvas/WebGL viewport (not 2500 DOM buttons), zoom/pan, minimap, 3-state fog shader/overlay, selected-unit XP/branch choices, three queen options, skill-use targeting, seed and army presets; match save/load, sample replays; keyboard-friendly alternatives. Avoid assets that introduce redistribution rights issues.

### Codex F — AI, balance and playtests
Deliver fog-respecting opponent policy and agent-vs-agent simulator. Evaluate exploration XP farming, game length (50×50, 3 AP), central objective contest rate, route win rates, queen dominating beyond intended 15%, king suicide incentives, summon→sacrifice exploits. Report empirical results separately from untested design hypotheses.

## Recommended phase gates

- **G0 (engine trust):** tests for moves, win/pass, seed, FOW non-leakage. CI green.
- **G1 (playable):** 50×50 battlefield, keyboard/mouse/touch viewport, selectable armies, sensible 3 AP turns, objective economy and bot, save/load.
- **G2 (fun):** pieces quickly develop distinct professions; three queen routes each present a genuinely interesting choice; king can summon but is high-risk; first 20 turns are engaging.
- **G3 (balancing):** seeded bot-vs-bot and human-vs-bot logs demonstrate no obvious XP or sacrifice infinite exploit; publish relevant metrics and known limitations.

## Merge/API integration contract

Before parallel work, Codex A proposes canonical interfaces: `GameState`, `Unit`, `TerrainTile`, `PlayerVisibility`, `Action`, `Event`, `Skill`, `QueenRoute`, `ArmyPreset`. Each work packet edits its own module and tests until contract is agreed. Treat rules in `DESIGN_BIBLE.md` as design decisions, not silent engineering defaults. If a change is required, open a decision note in `docs/DECISIONS.md` rather than quietly changing core fantasy.

## Paste-ready coordinator instruction

> You are the coordinating Codex engineer for **ChessLife**. Read `docs/DESIGN_BIBLE.md` and `docs/CODEX_HANDOFF.md` in full. Prioritize a deterministic, testable 50×50 vertical slice over cosmetics. Implement P0 and P1 with modular engine and simple UI, then add the three queen routes behind tests. Preserve: 3-state fog with stale memory, king capture/no stalemate, 99 per-piece levels, king 1.5× XP, slow queen XP, vision +0.30 once per team tile, pawn professions and relationship hooks, queen War/Phantom/Choice, anti-summon-sacrifice exploits, selectable 30/50/70 board and army presets, and no scaling slider attack range. Split across A–F packets above if parallel Codex sessions are available; create small PRs with executed test output, a screenshot/gif, known limitations, and a playable build. Do not claim that unimplemented skill mechanics are done.
