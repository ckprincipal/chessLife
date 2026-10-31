# Stale-Mate — Dispatch R1.1 Gameplay Amendment / 2026-10-31

**Priority:** owner-requested additions to the forthcoming Unity production build, after exact v0.5.10 JS baseline is locked. Original `MASTER_HANDOFF.md`, all six agent briefs, and input Source/Unity ZIPs remain unchanged and valid for the **v0.5.10 oracle**. No gameplay source file has been patched by this amendment.

## Status ledger: do not confuse request, code, and proof

| Topic | User instruction | Actual v0.5.10 | Required action |
|---|---|---|---|
| Pawn sacrifice -> 2 Pawns | User reports button doesn't seem to work | Implemented in `engine.js`; existing staged Node and Chromium fixture tests pass. User's real match failure not reproduced | **P0 product/QA defect triage** before Unity acceptance; preserve save and UI evidence; do not label fixed without reproduction or trace |
| King mobility | King can move at **0 CP**, at most **once each friendly turn** | King normal activation costs 1+ CP depending on level; move and command share activation | **Approved direction, unimplemented**; create isolated versioned rule delta and separate parity suite |
| Facilities | Opponents may **capture or burn** one another's facilities | Experimental camp capture only when `campCaptureMode=on`, default OFF. No burn, no general watchtower capture | **Approved capability, unimplemented**; design/action/interface details below, test separately |
| Yellow square | User asks meaning | Solid yellow-gold terrain is a **shrine**, `T.SHRINE=4`. Other yellow outlines/dots are UI cues | Document/explain in game UI and legend; preserve existing shrine benefits until reviewed |

## A. P0 — Sacrifice button: user-reported malfunction

**Authoritative source:** `prototype/engine.js:496–514` (`startPawnCampTraining`) and `:515–544` (`tickTraining`); `prototype/app.js:170–182` (UI including `window.confirm`); `tests/pawn_workers_v0510.cjs` and `tests/browser_workers_v0510.py`.

**Current intended behavior:** level >=4 Pawn standing on an **owned, idle, physically present** training camp; Pawn hasn't acted/isn't busy; at least its activation CP available; capacity for 2 recruits under 20-unit military cap (sacrificed Pawn frees one slot). Clicking `Sacrifice pawn -> 2 Pawns` asks for explicit confirmation, sacrifices Pawn immediately, queues TWO new level-1 Pawns, `remaining=2` friendly turn ticks. At each friendly end-turn, tick advances. Once remaining reaches 0, recruits appear if **both** spawn/exit cells are legal/free; otherwise queue remains `remaining=0` with 'awaiting exits' feedback. No extra King XP charge.

**Existing evidence:** the shipped Node/Chromium fixtures exercise a controlled level-4 Pawn already on a camp; `tests/browser_workers_v0510.py` specifically confirms the popup and queue creation. Coordinator additionally executed 9 staged build-camp-then-sacrifice checks (Traditional/Middle/Flatten × seeds 43971, 112233, 88001): 3 friendly construction ticks, 2 recruitment ticks, 2 graduates, all PASS. These are **positive controls**, NOT proof that the user's real-world bug is absent.

**Mandatory triage:**
1. Reproduce from a **normal playable path** rather than an artificially granted camp; advance a Pawn to level 4 by actual progression; construct a camp; move/station there; click the button; capture UI, browser dialog, error/log state, exact save JSON and screenshots before/after.
2. Check **confirmation canceled/blocked**, active side/acted/CP, available training cap, camp ownership and physical tile, queue already busy, pawn move onto camp consumed this turn's activation, and both needed exit squares. Inspect `g.camps[].queue`, `g.ap`, `g.serial`, `u.alive`, `u.acted` and game log before and after.
3. Test failure mode when queue reaches 0 but lacks two exit squares. Explain blocked batch in main HUD and select/tooltip; do not silently lose the second recruit.
4. Add a failing deterministic regression for the **actual** defect if reproduced; fix in JS **as its own hotfix/delta** before porting expected behavior; then require JS ↔ Unity parity. If not reproduced, state unresolved and improve observable feedback; never declare "bug fixed" from fixture-only passes.
5. Cover save/load midqueue, pawn death, ownership flip, King captured/ended game, capped army, clicks with 0 CP, rapid clicks, and both Chrome downloaded-file and supported embed contexts if available.

**Additional positive-control utility:** `ADDENDUM/SM-C02_SACRIFICE_STAGED_CHECK.cjs` (run from extracted JS source root with `node /path/to/ADDENDUM/SM-C02_SACRIFICE_STAGED_CHECK.cjs prototype/engine.js`). It does not exercise the actual UI; the user defect remains open.

## B. King free movement: isolated rule delta, not a blanket cost discount

User: **"King be able to move without costs but can only move once each turn."** Implement `type:'move'` for a King at **0 CP**, including a move-to-capture under the current single move action model (this part is an implementation interpretation, not separately owner-confirmed). The King can still move if team CP has been exhausted. **Do not set `activationCost(K)=0` globally**: King recruit/command/abilities retain their current CP costs and XP rules. The King still has **one normal activation per friendly turn**, so after moving King cannot also recruit or perform a regular second move/command that turn, and issuing a command first prevents movement until next turn. Guard against bonus-action/status bypass and incorrect `canAct` UI disabling at CP=0. Keep capture-the-king victory, fog, blocked terrain, and King XP behavior unchanged.

**Acceptance cases:** at CP=0 King makes legal quiet move, spends 0 and becomes acted; cannot move a second time, use an ability, or recruit in that turn; at positive CP King movement spends none; pawn/knight/rook still spend current costs; King's summon still requires its old CP and King XP; moving King onto valid enemy square follows regular legal capture and its existing danger rules; no illegal leap or fog probe; UI reflects **"Move 0 CP, commands normal CP"** and doesn't suppress legal King destinations just because all CP is gone. Old-save import must be explicit about whether new gameplay rules apply to resumed games; don't silently mutate v15 archived parity fixtures.

## C. Adversarial facility capture and burning

User: enemy must be able to **capture/burn opponent's facilities**, symmetrically for both sides. Existing **opt-in** `claimCampAction` at `engine.js:549–566` allows a military unit to hold an enemy camp through opponent's response turn, then pay **1 CP** to transfer it, canceling its queue. **This is NOT a general facility system and burning does not exist.**

**Proposed first playable implementation (owner-approved direction; details subject to balance review):**
- Primary scope: **training camps and watchtowers**, both capturable and burnable. Require a living military occupier, valid enemy-owned facility, occupation survived enemy response, 1 regular activation, and a provisional 1 CP per action. A player chooses *capture* vs *burn*.
- **Capture camp:** ownership flips; cancel enemy queue without refund; remove/retarget workers/project locks safely; reveal/refresh vision only as legitimate. No duplicate production or invisible-unit leaks.
- **Burn camp:** remove camp entity and its terrain feature, cancel any queue, clear completed/build references, and update owner sight/last-observed terrain. Surviving units are not automatically killed; King victory remains independent.
- **Capture watchtower:** transfer sight control, update fog observations and any attached special-skill watchers; no instant omniscience under mist.
- **Burn watchtower:** destroy tower; revert to legal underlying tile and remove tower sight. Do not retroactively erase player's already explored memory; do not leak hidden changes to absent opponent.
- **Bridge/tunnel demolition:** separate later scope because restoring pre-construction terrain needs provenance (water/mountain) and pathing revalidation. Avoid guessing a destroyed bridge becomes plain or arbitrarily deleting a unit on an affected tile. Shrines are objectives, not burnable facilities.
- AI needs to understand both sides' legal capture/burn actions. Both must be save/load stable. Default-vs-feature-flag and costs should be explicitly accepted by owner, not silently promoted from old experimental camp-capture switch.

**Tests:** both sides, construction-in-progress, queued recruits, blocked camp, enemy contested, no occupation turn, 0 CP, fog/mist non-leak, map visualization, win condition separate, save migration, no double destroyed structures or free CP, burn then replacement building, and AI actor parity.

## D. Yellow square / map clarity

- Solid gold/tan terrain tile: **ancient Shrine** `T.SHRINE` (`app.js:6,12,26–30`). Claim/stand on it -> **+5 XP** via `claimedObjective` (`engine.js:740`) per side+shrine if >=7 rounds since prior claim. Learned skills may be equipped/changed at a shrine even outside the King's radius (`engine.js:583`). Existing `endTurn` also grants 2 legacy gold while a side occupies a shrine; gold is not currently required for standard camp construction/recruitment.
- Gold square stroke around a unit: **selected piece**, `app.js:67`.
- Small gold dots: legal destinations **currently in direct sight**; blue dashed squares/dots: speculative routes through remembered mist; target-outline gold rectangle: ability/build target (`app.js:45–65`).
- Gold rectangle in minimap: current **camera viewport**, `app.js:80+`, distinct from shrine terrain.
- Add a one-line hover/click legend or terrain inspector; do NOT change shrine rules during Unity port without an explicit owner revision.

## Gate and ownership

**Retain parity baseline:** v0.5.10 source ZIP remains read-only; don't retrofit user changes into oracle JSON outputs. New rules belong on versioned post-baseline branches and tests, after SM-C01 freezes state and action contracts. SM-C02 owns independent golden-vs-change regression, SM-C03 owns new action/state/save schema, SM-C04 owns King movement and interaction validation, SM-C05 owns facility state/fog/training consequences, SM-C06 owns UI feedback/visuals, SM-C01 integrates and records owner sign-off. Details in `OWNER_WORK_ORDERS.md`.

No new camp-count cap. Standard rosters and Corporate Flatness remain Traditional K1/Q1/R2/N2/B2/P2, Middle K1/N2/P6, Flatten K1/P9. **Keep the intentional Traditional two-worker bottleneck and avoid auto-rescue mechanics.**
