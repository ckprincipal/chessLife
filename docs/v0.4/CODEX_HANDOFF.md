# ChessLife — Codex implementation handoff v0.4

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


## v0.4 engineering delta — maintain this before expanding the game

**New tested baseline:** `prototype/engine.js` includes 3 protected civilian villagers per army, 3 work roles, two neutral prey habitats, food/wood/gold economy, royal summons paid in all three, nonlethal raids, 3/2/0 skills equipped capacity and a queen skill-swap proof of concept. `node tests/engine.test.cjs` must pass all 35 assertions before accepting refactors. `prototype/app.js` exposes worker assignment and skill swaps. `tools/build_standalone.py` emits an offline HTML build.

### Packet A (Engine)
Formalize an action protocol for `move`, `attack`, `raid`, `work`, `equip`, `summon`, `queen`, `watch`, and `end`, especially AP ownership and fog-safe planning. Write property tests for stopping *before* the first unseen blocker and for not using hidden pieces in legal-order previews. Keep physics deterministic under seed. Propose long-range move rules (7 vs 12 vs explored-only unlimited) via simulation; do not silently uncap lines.

### Packet B (Fog, observation, XP)
Construct side-scoped observations; `orders()` must not reveal unknown enemy or wildlife state. Restore previously explored squares as *mist*, not live sight. Test invisible civilians and interference at multiple fog boundaries. Keep XP credited once per team-new square; distinguish work XP and first contact.

### Packet C (Skills and character growth)
Build a data-driven `learnedSkills` / `equippedSkills` catalog with capacities 3/3/2/2/2/0 and pawn L4/L15/L35 progression. Fill knight, rook, bishop and king skill inventories with **real playable skills** (not inert buttons), plus replayable tests. Choice Queen learns four early actions but equips three. Make loadout swapping cost a tactical action near king or shrine. No class should gain unlimited extra basic attack lines.

### Packet D (Queen tradeoffs and relationships)
Extend War local/global stances, Phantom stealth/deception counters, and Choice's sacrifice/siphon/mercy/surge choices. Restrict civilian ritual inputs, summoned farming and repeated raid abuse. Bind queen choices to relationship consequences, not pure min-max exploitation. No second king.

### Packet E (Villager economy and UI)
Keep worker production automatically processed at turn boundaries; provide readable tile/biome/resource preview and hunting risks. Use icons / simple original art to distinguish neutral prey from fighting pieces. Add optional protected/mortal workforces as a *simulator setting*, not a mandatory new gameplay mode until playtests. Save/load migration must preserve worker jobs, injury and supply stocks. Formalize resource travel/logistics only after testing whether it improves fun.

### Packet F (AI, balance and validation)
Run bot self-play / heuristic agents across board sizes with two/three/four villagers and three queen routes; measure: game length, fraction of turns with meaningful choices, worker raid frequency, worker kill/raid XP farming, success of resource income against summon costs, queen choice diversity, fog leakage and early queen domination. Report wins, confidence bounds and failures; do not describe new mechanics as balanced without executed matches.

**Acceptance gate:** keep 35 baseline engine tests green, add new smoke tests for workers, ensure no console exceptions, package a runnable standalone HTML and exact source, update `DECISIONS.md` and `BALANCE_BASELINE.json`, and clearly state work not yet implemented.