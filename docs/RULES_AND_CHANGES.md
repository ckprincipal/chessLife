# Rules and change ledger — one active gameplay contract

Status words: **BASELINE** = executable v0.5.10; **REQUESTED** = user intent, not implemented; **PROVISIONAL** = implementation proposal, not user-approved detail;
**OPEN DEFECT** = reported behavior not yet reproduced; **DEFERRED** = do not add now.

## A. Frozen baseline: port this without redesign

| Area | Authoritative behavior |
|---|---|
| Organizations | Traditional K1 Q1 R2 N2 B2 P2 (10); Middle K1 N2 P6 (9); Flatten K1 P9 (10). Default opponent mirrors. Legacy rosters remain available. |
| Intentional asymmetry | Traditional has only TWO end-to-end pawn-workers despite many managers. User explicitly wants this corporate inefficiency; do not add rescue workers, free camps or equalizing buffs. |
| Infrastructure | Standard starts with ZERO camps. Optional Quick Start creates one per side. No independent invulnerable engineer. No new camp-count cap. |
| CP | Default 3; opening P/N/B/K=1, R=2, Q=3. One normal activation per unit/turn, with only actual implemented explicit bonuses. Old 2-CP comparison preserved. |
| Board/vision | 50x50 default, 30/70 alternatives; seeded terrain. Black/mist/current sight; remembered terrain controls previews, hidden true state resolves execution. Sliders need explored legal rays; forest soft-stop. |
| Victory | King is sole royal; capture wins; no stalemate draw, blocked side may pass. |
| Pawns | One square forward-left/forward/forward-right into empty passable tile; capture only forward diagonals. Vulnerable soldiers/scouts/workers, not invulnerable engineers. |
| Work | L1 forest, L2 bridge/watchtower, L3 mountain, L4 camp. Preserve timing, locks, legal adjacent work and skill modifiers. |
| Recruitment | King spends unspent XP and CP at eligible camp. L4 pawn at an idle owned camp can stay 5 friendly ticks or sacrifice for 2 ticks: 2 pawns OR 1 knight OR 1 bishop. No extra King XP for pawn batches. 20-unit cap including reserved queues; blocked exits delay deployment. |
| Camp/tower vision | Eight-neighbor sight; qualifying pawn laborer on camp adds outer ring, with actual terrain LOS rules. |
| XP | King starts with 3 XP, royal multiplier 1.5; nonroyal military base-XP share is 20% before king multiplier. No XP solely for elapsed idle turns. Preserve actual level/spend order. |
| Skills | Starting slots P/N/B/R/Q/K=0/1/1/2/3/2; pawn draft/slot every 3 levels (3,6,...99), three options, 36 authored prototype skills. Preserve exact catalogue/loadouts/cooldowns. Full non-pawn authored trees are NOT complete. Route labels have no invented hidden perks. |
| Saves | Schema 15; imports 5–14 preserve actual old armies/camps and migrations rather than applying new-game rosters. Canonical comparisons distinguish semantic state from JSON key order. |
| Flags | Classic one-hit default; existing pips, legacy HP, Fission, experimental camp capture remain opt-in in baseline. |

Primary executable: `reference/js-v0.5.10/prototype/engine.js`; UI: `prototype/app.js`; exact skills: baseline `SKILL_CATALOGUE.md`.
Do not implement from stale Unity v0.5.8 opening JSON, old concept counts or historical `doc/` design.

## B. New requests — separate rules revision, never corrupt the oracle

### BUG-001 — Sacrifice pawn -> two pawns button (OPEN DEFECT, P0)
User says the button does not seem to work. Existing engine/browser fixtures and nine additional staged positive controls pass;
this neither reproduces nor refutes the real-play failure. No fix has been established.

C02 owns diagnosis: capture the actual save/turn/side/unit/camp/CP/acted/busy/queue/confirmation/browser trace; reach L4 and a camp
through legal normal play, not only artificially raised levels. Test cancelled/blocked confirm, moving onto camp already consuming
activation, ownership, 20-unit capacity, two free exit squares, rapid clicks, ended games and midqueue save/load.
Two friendly training ticks, not two arbitrary player clicks, are required; at zero remaining ticks but blocked exits the queue waits.
C05 owns training implementation fixes; C06 owns useful feedback. A reproduction yields a failing regression before a fix. Without
reproduction, status stays OPEN/UNREPRODUCED; an observability improvement is not a proven bug fix. Baseline stays immutable.

### CR-001 — Free King movement (REQUESTED)
User's exact intent: **King movement costs 0 CP and happens at most once per friendly turn.** It must work with team CP already zero.
Recruiting, commands and unrelated abilities are not automatically free; never set the King's global activation price to zero.

Unresolved details must be presented to C00 before implementation: does move-to-capture also cost zero, and is the free move separate
from or shared with a normal command activation? R1.1's suggested shared-activation and free-capture interpretation was an assistant
proposal, NOT an additional user-confirmed rule. Preserve baseline shared activation until an explicit delta decision; do not silently
spend it differently. No double move through bonus actions, save/load, blocked-move retries or side changes. Old-save ruleset migration
must be versioned and explicit. C04 owns behavior, C03 its state contract, C02 adversarial tests, C06 UI.

### CR-002 — Capture/burn enemy facilities (REQUESTED capability)
Both sides must be able to capture or burn opponent facilities. Baseline only has optional camp capture, default OFF; no burn.
First proposed scope: camps and watchtowers. Capture flips ownership and handles queues/sight; burn removes facility and its
production/sight effects without deleting unrelated occupants. Remembered fog must not reveal unseen changes. AI and save/load
must use the same legality. Shrines are objectives, not automatically burnable structures.

**PROVISIONAL, not fixed:** surviving an opponent response turn, 1 CP/one activation, queue cancellation/no refund, and how the new
feature is enabled. C04/C05 jointly propose exact action, ownership, occupancy, queue, worker-lock, terrain and fog semantics to C00.
Bridge/tunnel demolition is DEFERRED pending underlying-terrain provenance and occupant safety, not quietly implemented as plain terrain.

### UI-001 — Explain yellow squares (REQUESTED clarification)
Solid yellow/gold shrine terrain: +5 base XP claim with seven-round repeat cooldown, and learned loadout access away from King.
Royal XP modifiers may affect received XP. Baseline also has legacy shrine gold bookkeeping; do not expand the economy around it.
Gold piece border = selection; gold dots = currently seen legal moves; dashed blue = remembered-mist orders; target gold outline =
selected action target; minimap gold rectangle = viewport. C06 supplies legend/inspection and action rejection/queue feedback.
No shrine bonus change is authorized.

## C. Preserved design intent / deferred work

The King/Queen/managers/workers theme and exact phrase **"executing royal plans"** remain. Pawns can build, scout AND fight.
Pairing is valuable emergent play; don't replace it with invented auras. Work, Baby, Work! remains historical/future mode context;
its old five-engineer illustration must not resurrect an invulnerable class. Higher work CP and delegation bonuses have no finalized
price/system and are NOT part of baseline parity. No camp proliferation cap now. No blanket balance equalization.
Skill-route disclosure (hidden/hints/explicit) remains reversible; no final route-locking or new skill trees without a design task.

## D. Scope discipline

Baseline parity and changed-rule tests are separate. Every defect repair/rule delta has its own identifier, tests and ruleset version.
C00 must publish an exact decision before unresolved semantics become code. No feature proposal becomes accepted merely because
it appeared in an earlier assistant message. Preserve rejected hypotheses and regressions with their original context.
