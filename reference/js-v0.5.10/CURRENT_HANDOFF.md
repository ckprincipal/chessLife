# Stale-Mate — Coordinator continuity R10 / 2026-10-31

**Current authoritative playable version:** **v0.5.10**, downloadable standalone `Stale-Mate_v0.5.10_Play.html`; complete editable rules/UI/tests in this Source ZIP. **Unity Starter v0.1 is not current gameplay and not C#-port parity.**

## Decisions carried forward

- The user first removed the permanent independent engineer: Pawns are now **capturable workers + scouts + fighters** with abilities unlocked at levels 1 through 4. They cost real military CP to work, though additional management premiums are a future experiment.
- Organizational Flatness selector: **Traditional (default) K1 Q1 R2 N2 B2 P2** (10), **Middle K1 N2 P6** (9), **Flatten K1 P9** (10). The user's last instruction explicitly restored **two rooks** to Traditional and added **two pawns** to Middle, **four pawns** to Flatten. Former v0.5.8/v0.5.9 definitions 8/7/6 are obsolete for new matches, not for old saves.
- User previously removed the **default training camp** in v0.5.9. Standard new games start with **no camps**. Optional Quick Start restores one free ready camp each side for comparison. Camps are unlimited for now (no new cap beyond existing unit capacity).
- Early camp recruitment is not available without a camp; a level-4 Pawn must build one in three friendly work turns. King's initial XP=3 and leadership experience sharing remain. No passive turn XP.
- Same 3-CP default; R2 / B1 / Q3 / P1 / N1 / K1. Existing optional original mode and experimental pips/Fission/HP/camp capture unchanged.
- Pawn skills **already implemented in v0.5.6**: 36 prototype choices (12 Scout, 12 Pioneer, 12 Companion), slots P/N/B/R/Q/K=0/1/1/2/3/2, Pawn drafts at levels 3/6/9/…; other piece skill trees not fully authored. No hidden skill-route bonuses.
- King only royal, capturing him wins; no stalemate. 50×50 standard map; fog remembers historical terrain and does not leak current unseen terrain. No mandatory resource economy.

## Technical implementation

`prototype/engine.js` is authoritative for match rules (`StaleMateEngine`/legacy `ChessLifeEngine` namespace); `prototype/app.js` + HTML/CSS is the browser renderer. The raw standalone HTML is **built**, not hand edited. `tools/build_standalone.py` is deterministic. `tools/run_release_tests.py` executes actual test commands and logs stdout/stderr. Preserve `tests/fixtures/engine_v059.cjs`, `engine_v058.cjs` and `engine_v056.cjs` for old-save migration checks. Version 15 saves load v5–v14; they **keep their existing armies and camps**. Do not silently reinitialize old saves with the new defaults.

## Evidence

All current 173 focused Node checks (41 org, 23 engine, 54 worker, 55 skills), 132 Chromium checks (38 org, 46 worker, 48 skills), 8,412 randomized actions (5,495 + 2,917), plus JS syntax checks passed. Only measures mechanics. Read `TEST_RESULTS.txt` and verify exact SHA256 manifest. Source ZIP is the user-executable handoff; keep versioned Library folder.

## Deliberate nonchanges/open items

1. Traditional rooks have no special managerial functionality or subsidies; middle Knights are tactical team leads **in theme**, not yet a new delegation mechanic. User has not selected specific CP costs for engineering overhead.
2. The "Work, Baby, Work!" alternative mode is still a **separate concept** and its earlier screenshot preserved; do not blend it into Flatten without a new decision. Phrase **"executing royal plans"** is preserved.
3. **Camp starvation risk:** a no-camp standard army whose Pawns die before level-4 construction can lose its production path. Test before designing softlock protection. User explicitly deferred construction/camp proliferation caps.
4. Existing Unity Starter v0.1 generated *v0.5.8 starting state fixtures*, which are **obsolete for v0.5.10 rosters**. Do not claim C# gameplay port, Unity compilation, platform export or console deployment.
5. Current source is local/ChatGPT Library, **NOT pushed/merged** to `ckprincipal/chessLife`; `main`, v0.4 golden and draft PRs #3/#4 should remain untouched until requested.
6. No real human balance evidence for Traditional/Middle/Flatten. Gameplay tuning should examine pairing, rook utility, many pawns competing for 3 CP, and pace of first camp construction.

## Next successor instruction

Inspect the actual Source ZIP. Run `python tools/run_release_tests.py` and `python tools/verify_sha256.py` with the exact source. Request specific user playtest feedback rather than claiming balance. If later migrating to Unity, do it incrementally with deterministic parity against JS; do not discard the original working game. Keep every release's handoff and source, not just HTML.
