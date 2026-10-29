# ChessLife — exact Codex next-work contract (2026-10-29)

**Start at mailbox [issue #1](https://github.com/ckprincipal/chessLife/issues/1).** Read latest comments, post `READY — CHESSLIFE CODEX` with actual HEAD SHA, branch, code inventory, and blockers; ACK the latest coordinator HANDOFF URL/ID. This is a public repo: no secrets.

## Reality and priorities
- `main` was v0.2 documents + images only, HEAD `aaea2f3b26f421923f98e967e027b0fcd5aff0ef`.
- Branch `handoff/v04-baseline-v05-design` imports v0.4 modular source (`prototype/`), tests (`tests/`), build utility (`tools/`), exact v0.4 snapshots (`docs/v0.4/`) and design-only v0.5 addendum (`docs/v0.5/`).
- Do not silently change `main`; work from a topic branch based on the handoff branch or its reviewed merge. Keep code changes in small PRs and identify a single owner per file.
- User's top goal is **fun qualitative character development, NOT complex stat, HP or resource economies**.

## Core, not experimental
1. 50×50 default; selectable 30/50/70, seeded fair-ish terrain, selectable small starting armies (11/12/11 soldiers in v0.4) and a usable zoom/pan/minimap.
2. Unexplored deep black / previously explored mist / currently visible clear, per player, recomputed. Only current sight exposes enemies. No history-to-live-visibility leaks in previews/logs/AI.
3. Rook/bishop/queen do NOT attack an entire 50-cell ray; v0.4 caps sliders at 7. Previously explored mist may be selected speculatively; hidden blockers halt before the first piece/obstacle and consume the normal action; never-unexplored black is not selectable/traversable. Real bonus action exceptions (ninja etc.) are separately validated.
4. King is the single royal with 1.5× earned XP and summoning/command focus; capturing enemy king ends game. **No stalemate:** lack of legal action causes pass, not draw. Queen cannot succeed the king.
5. All military units have independent levels 1–99, XP, acquired skills and relationship narratives; meaningful new options, not linear stat inflation. +0.30 XP once per first team discovery of each square (no mist farming). Queen initially strongest but leveling slower and less efficient.
6. Three mutually exclusive queen routes: War (massive local OR weaker global buff), Phantom (stealth/deception with counterplay), Choice/Blood (mercy, nonlethal siphon, sacrifice with hard opportunity costs—**not** merely kill your own army).
7. Skill equipment: K/Q start with 3 equipped slots; R/B/N 2; pawn 0 but earns slots; learned skills distinct from equip slots. Pawn swimmer/mountaineer/scout/ninja specializations and organic pawn/bishop/knight relationships matter.

## Unsettled mechanics — protect behind feature flags
- **Full villagers + food/wood/gold economy:** v0.4 implemented, but user worries it hurts fun. Keep it as `economyMode="v04-legacy"`; build an experiment with economy disabled and non-currency command limits for summons. Do not treat economy as compulsory.
- **Granular numeric HP:** v0.4 implemented, but user worries it complicates combat. Retain as `combatMode="v04-numeric"` for comparison.
- **1–3 discrete capture hits:** candidate `combatMode="discrete"`; rare shield pips with hard cap 3, nonfinal hit damages shield but leaves both positions unchanged, final hit captures.
- **Fission:** proposed high-tier skill for eligible nonroyal units. One source becomes **two level-1 pieces of the same type, resetting BOTH**. Strict conditions (action, free visible legal spawn, unit cap, lineage safeguard; reset trained skills, level-derived durability, XP-related power and bonuses). Start with pawns/knights; **never king**; queen off by default. No duplication of discoveries/bonds/rewards. This is a design experiment, not live v0.4 behavior.
- Persistent inter-match character progression remains undecided.

## P0: import verification (first, no gameplay edits)
Verify exact current branch and file inventory. Run `node tests/engine.test.cjs` and standalone build. Run browser checks if environment supports Playwright. Record SHA, command output, pass/fail, known limitations, config and one screenshot. Add minimal CI smoke if feasible. Preserve v0.4 reproducibility.

## P1: one simplified vertical-slice comparison
In a **small feature-flagged PR**, test economy-off gameplay (without mandatory three-currency burden) and compare legacy HP vs classic capture vs discrete-hit candidate. Report game length, first 20 turns' meaningful tactical choices, king/queen safety, army growth; avoid making unsupported balance claims.

## P2: independently tested mechanics
Implement discrete hits **behind flag**; implement fission **behind flag**; maintain game-state serialization compatibility and visibility correctness. Add tests for 1/2/3 hit cases, effect resolution order, collisions, level reset of BOTH fission products, king uniqueness, cap, no immediate extra action, and no duplication of rewards/relationships.

## P3: real character trees and playtesting
Data-driven level-99 progression with milestone choices, skill loadouts, professions, relationship hooks, late evolutions, and meaningful losses. Focus on whether early gameplay is fun without hours of grinding; instrument scripted/bot-vs-bot tests. Unimplemented trees must be labeled unimplemented.

## Commit / PR contract
Each delivery: branch + full SHA, files touched, tests actually run with outputs, screenshots/playback if UI affected, known limitations, concrete design questions and merge recommendation. No silent changes to core fantasy; publish REQUEST in mailbox and receive ACK/decision. **Never report a proposed balance curve as measured data.**
