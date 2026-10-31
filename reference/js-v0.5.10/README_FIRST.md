# Stale-Mate v0.5.10 — Revised Rosters (No-Camp Start Preserved)

**Play:** Open `Stale-Mate_v0.5.10_Play.html` directly in Chrome/Chromium. This is the full offline JavaScript prototype. **Earlier v0.5.9 already removed the free camp; v0.5.10 changes the organizational rosters.** It is **not a compiled Unity game**.

## Starting organizations (new matches)

| Organization | Starting roster per side | Count | Intent |
| --- | --- | ---: | --- |
| **Traditional (default)** | **K1 Q1 R2 N2 B2 P2** | **10** | Queen as deputy; Knights/Bishops as middle managers; two rooks restored; two end-to-end Pawn-workers |
| **Middle** | **K1 N2 P6** | **9** | Knights as CP-efficient tactical team leads and six Pawn-workers |
| **Flatten** | **K1 P9** | **10** | King manages nine Pawn-workers directly |

The opponent **mirrors your structure by default**, but you can override it. Historic Balanced Court / Explorers / Fortress presets remain selectable for comparison. Rooks cost **2 CP**, bishops **1 CP**, knights/pawns/kings **1 CP**, queens **3 CP** in the default 3-CP command mode; capturing the opponent King wins; no stalemate. No automatic delegation bonuses or increased construction-CP prices have been introduced.

## Starting infrastructure

**Standard starts with ZERO prebuilt training camps on either side.** The retired independent engineer does not return. A Pawn must develop to **level 4** and build a camp in **three friendly work turns** before King XP recruitment or Pawn-directed camp production can begin. Level-4 Pawn construction consumes its normal activation/CP. A **Quick Start** dropdown remains available as an explicit alternative, creating one ready camp per side. No separate camp-count cap was imposed. The 20-military-unit capacity still applies.

**Important strategic risk:** if all Pawn-workers are lost before a camp exists, the army may lose its ability to recruit or build camps. This is an *unresolved strategic/balance issue*, not a hidden rescue mechanic. Standard Traditional starts with only two Pawns; protect them if you want later production.

## Skills: what is implemented

- **Starting capacity:** P/N/B/R/Q/K = **0/1/1/2/3/2** slots. This is a limit, not six completed new skill trees.
- **Pawns:** acquire one skill slot at levels **3, 6, 9, ... 99**. At each milestone choose **one of three offered skills**. There are **36 authored prototype Pawn skills** split among scouting, construction, and support categories (12 each).
- Actual skills include sight changes, terrain work reductions, temporary signals, defensive cover, limited active movement, and related cooldown/equipment checks; active powers cost the normal CP and a piece activation unless the skill is passive.
- Pawn affinity routes are developmental summaries; they do not secretly grant bonuses. The default UI shows exact effects but withholds route-affinity scores. Other unit types retain their existing abilities and initial slot capacities; **complete authored Knight/Bishop/Rook/Queen/King choice trees are still pending**.
- Click **Skills ready** after a Pawn passes a milestone.

## Preserved systems

Three-state fog with terrain memory; default 50×50 board (30 and 70 selectable); Pawn movement to three **empty forward directions** and **capture only on forward diagonals**; Pawn labor unlocks L1 forest, L2 bridge/watchtower, L3 mountain, L4 training camp; roomier command budget 3 CP (2-CP comparison available); one normal activation per piece; King gets XP from allied achievements but no XP from waiting; optional Fission, shield-pip hits, numeric HP and camp capture remain off by default.

## Saves and source

**Save schema v15.** Loads v5–v14 command-camp saves. Existing units, XP, skills, CP, camp ownership and paid training queues are preserved on import. A saved v0.5.8 match **keeps its ready starting camp and old 8/7/6-unit roster**; a saved v0.5.9 match **keeps its actual 8/7/6-unit roster and selected camp setup**. Only **New match** uses the revised 10/9/10 starting rosters. The no-camp Standard default was already established by v0.5.9. Back up valuable historical saves before importing.

`prototype/engine.js` is the JavaScript rules source of truth; `prototype/app.js`, `prototype/index.html`, and `prototype/style.css` are the UI. Regenerate the complete offline HTML with `python tools/build_standalone.py`.

## Tests

From this source directory:

```bash
python tools/run_release_tests.py
python tools/verify_sha256.py
```

The current release passed **173 focused Node checks**, **132 real Chromium checks**, and **8,412 randomized actions** across 60 seeded scenarios. Test files: `tests/organization_v0510.cjs`, `regression_v0510.cjs`, `pawn_workers_v0510.cjs`, `skills_v0510.cjs`, two randomized suites, and three Playwright browser suites. The historical v0.5.8 and v0.5.9 engine fixtures are used to prove old saved armies do not change. Test counts are mechanical evidence, **not** balance or enjoyment results. See `TEST_RESULTS.txt`.

## Development state

Unity Starter v0.1, released alongside v0.5.8, remains a **presentation-only, uncompiled-in-Editor viewer of the *older* 8/7/6-unit openings**. Its snapshots have not been refreshed for v0.5.10; do not treat it as parity. The latest gameplay is the offline JS HTML. The public `ckprincipal/chessLife` repo still needs a reviewed import of this source; this release does **not** push it. Prior golden branches and draft PRs are untouched.
