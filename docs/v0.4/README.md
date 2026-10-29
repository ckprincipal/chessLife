# ChessLife v0.4 — civilian economy, skill loadouts, speculative fog, HP

**Working title:** ChessLife. **Status:** playable offline vertical slice, **not yet balanced**. The game is inspired by chess, but it has deliberately different victory and combat rules. The design principle is *an army of characters whose lives, skills and decisions matter*.

## Play

Open `ChessLife_v0.4_Play.html` in a desktop browser. No server, account, or external assets required. This file is distributed separately beside the source ZIP.

Alternatively, open `prototype/index.html` (keep its `.js` and `.css` next to it). Some browsers restrict local linked scripts; if necessary run `python -m http.server 8765` from `prototype/`, then visit `http://localhost:8765`.

**Controls:** click a unit to see its abilities and skills; click a gold destination for a currently visible move or a blue square for a misted speculative move. Drag to pan, scroll to zoom, click the minimap to reposition, click End Turn to advance, use Save/Load for JSON match snapshots. Villagers are indicated by ⚒ and wildlife by 🦖 / 🐊.

## Current mechanics

- **30×30 / 50×50 / 70×70**, default 50×50; procedural terrain and asymmetric army presets.
- **11–12 combat units plus 3 civilian villagers per side**. Civilian workers do not count toward military supply.
- **Three-state fog:** black never seen, gray mist for explored-but-unobserved, currently visible terrain and units. No permanent current vision after exploration by default.
- **Fog movement:** rook/bishop/queen can order moves through *explored* mist, but not unexplored black. Hidden blockers stop an advancing piece *before* that blocker; the action is spent, with no blind capture. Ninja bonus actions can allow a second move. Slider moves are still provisionally capped at 7 squares.
- **HP combat toggle:** when enabled, a hit damages a unit (attacker stays in place unless defender dies). Level-1 pawn cannot one-shot a level-99 queen. Classic one-hit captures can be selected at new-match setup.
- **Three protected villager professions:** lumberjack (wood from adjacent forest), miner (gold from adjacent mountain), hunter (food from dinosaur or gator wildlife grounds). Each turn, assigned villagers gather **automatically** if at a suitable site. Reassignments are free, limited to once per villager/turn; moving a worker manually costs an action.
- **Nonlethal civilian raids:** villagers cannot damage military units and cannot be killed by them; attackers can rout civilians, disrupting production and penalizing **unspent XP, food/wood/gold, HP, and recovery time**. Raiders get no combat XP from civilians. Civilian sacrifices/siphons are forbidden.
- **Limited wildlife stocks:** hunting exhausts a habitat temporarily; wildlife has a risk of injuring the hunter. Dino and gator are hunting grounds rather than autonomous fighting monsters at this stage.
- **Resources:** gold, food, wood, ritual essence; royal summoning consumes multiple resources and command actions.
- **99 levels per piece**; vision/exploration XP +0.30 per genuinely new team square, king 1.5× XP, queen 0.75× XP + 1.5× threshold.
- **Skill slot framework:** king & queen start with **3 equipped slots**; rook/bishop/knight have **2**; pawn starts at **0** and earns slots with levels; villager starts at 0 *military* slots. The Choice Queen learns four early options but can equip only three simultaneously; changes require returning near the king or shrine and spending an action. Other class skill inventories are **not yet complete**.
- Pawn professions: Swimmer, Mountaineer, Scout, Ninja (30% non-chainable extra action). Queen routes: War, Phantom, Choice/Blood. Relationship prototypes: devoted pawn, bishop lover, knight protector.
- **Victory:** king capture; no checkmate/stalemate or draw by lack of moves. A player without legal actions passes.

## Scope and limitations

This is **a prototype**, not a completed RPG or polished strategy game. In particular: (1) the 99-rank trees are skeletal, (2) not all available skill slots have learned skills to equip, (3) civilian economy/HP/wildlife/drop rates are unbalanced, (4) AI is simplistic, (5) fog is not secure against a malicious client because the full state resides in local JS/JSON, (6) wildlife uses static finite resource sites, not mobile hostile AI, and (7) the save system stores a match, not a persistent character campaign.

For code ownership and follow-on tasks, read `docs/CODEX_HANDOFF.md`, `docs/ECONOMY_CREW.md`, and `docs/DESIGN_BIBLE.md`.

## Verify

```sh
node tests/engine.test.cjs
python tools/build_standalone.py
```

Browser smoke checks use Python Playwright/Chromium. The v0.4 build passed 35 engine checks and a Chrome worker-assignment/AI-turn interaction in this packaging session; see the tests for actual assertions.
