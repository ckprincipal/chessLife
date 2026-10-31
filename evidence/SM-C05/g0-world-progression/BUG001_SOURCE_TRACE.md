# BUG-001: source trace for C02/C06

Status: **OPEN / UNREPRODUCED**. This is C05 code analysis at intake `83a0baa8a4486562c5c67144324cede402f29cf7`, not a new ordinary-play reproducer, a browser result or a proven repair. CONTRACT SHA: NOT FROZEN; production HOLD.

## UI-to-engine path

1. `app.js:95-105` locates/inspects the selected Pawn. UI `canAct` uses `E.canAct`, White turn and `effectiveCost <= ap`; the production controls further require `canOperateCamp` and batch capacity. A camp section appears only on a currently owned camp tile at the Pawn's position (`170-179`). An existing queue replaces the buttons with queue text.
2. The sacrifice button's click handler calls synchronous `confirm`. A canceled or blocked dialog never calls `act` and never creates a queue. An accepted dialog sends `{type:'trainCamp', unitId, piece, mode:'sacrifice'}`. Confirm behavior must be captured in the real browser; staged engine calls do not test it.
3. `action` (`engine.js:1046-1070`) rejects ended games, invalid/other-side/dead units, current projects, used activation and insufficient CP before reaching pawn training. The special bonus permission is for `move`, not `trainCamp`.
4. `startPawnCampTraining` (`496-511`) requires a living eligible Pawn (L4), output P/N/B, explicit stay/sacrifice mode, idle/unacted operator, and an eligible idle owned camp under it. It computes P count2 or N/B count1; sacrifice duration2, Instructor stay4, ordinary stay5; it requires `trainingCapacity + 1 >= count` for sacrifice and normal activation CP.
5. Only after checks pass does it charge CP and mark acted. Sacrifice sets `alive=false`, runs `onUnitKilled`, then sets `campSacrifice=true`. It creates a workerless queue `{kind:'pawn',mode:'sacrifice',type,count,remaining:2,total:2,started:serial,workerId:null,founderId:operatorId}`. It refreshes sight without discovery credit. No King XP is spent and no graduates appear yet.
6. `app.js:66` clears selection if `byId(selected)` is now null. Therefore the selected Pawn panel disappearing is an expected consequence of successful sacrifice. Queue feedback remains in the economy panel (`225-226`) even though the dead operator is no longer selectable. This is a diagnostic distinction, not evidence that this was the user's failure.
7. Friendly end turn runs builders and then `tickTraining` before changing side/serial (`1034-1044`). The start turn's end is tick1 (2 -> 1); the next same-side end is tick2 (1 -> 0). Ending the opposing turn does not tick this camp. Any real UI trace must distinguish end-turn clicks from actual friendly training ticks and AI phase changes.
8. At readiness, `tickTraining` (`523-548`) checks the live-count cap and calls `spawnAtCamp`. The **entire batch** needs enough exits. If not, remaining stays0 and no recruit is emitted; a later friendly tick retries. It must not partially graduate, drop, or duplicate the second Pawn.

## Exits and capacity details that matter to the diagnosis

- `reservedRecruits` counts all queued recruits of that side; `trainingCapacity = 20 - living military - reserved`. The sacrificed operator frees one live slot. A two-Pawn batch can still fail the capacity check; King XP does not fix that route.
- `spawnAtCamp` (`519-521`) checks the camp's **center first**, then NW,N,NE,W,E,SW,S,SE in the source KING order. It uses actual emptiness and passability for a fresh unskilled unit. Water and mountain exits do not inherit the veteran's traversal skills.
- “Two free exits” means two accepted cells in that list, including the center when empty. After sacrifice the center will usually be free, so **one additional legal neighboring cell may suffice**. With a stationed teacher occupying the center, two neighboring exits are needed for a Pawn batch. Do not diagnose a missing second neighboring tile without counting the center.
- If an enemy occupies the camp, the queue pauses before decrementing. A missing/displaced teacher cancels stay mode, but a dead sacrificed founder with `workerId=null` is valid and does not cancel its queue.
- Capturing the King ends the game; later public end-turn actions reject and queues no longer advance.

## Cases to distinguish in a real trace

| Observed stage | Evidence needed | Interpretation allowed only after tracing |
|---|---|---|
| Button missing | Selected unit, live level, position, current tile/camp owner, queue | Selection/eligibility or queue display; not proof the command vanished |
| Button disabled | Side, winner, project, acted/bonus, CP, computed activation cost, exact live/reserved counts | Reasonable eligibility rejection versus UI availability mismatch |
| Click leaves operator alive and no queue | Dialog shown/result, browser exception/console, whether `act` was invoked and its returned error | Canceled confirmation, handler failure or engine rejection are separate cases |
| Operator gone, queue remaining2/1 | Exact action result, queue object and subsequent side/end-turn sequence | Successful queue start; no claim of a production defect yet |
| Queue at0, no graduates | Live unit cap, reserved counts, ordered exit list with actual terrain and occupants | Ready batch waiting versus an inconsistent capacity/exit transition |
| Queue disappears unexpectedly | Camp terrain/owner changes, assigned teacher state, ended-game state, cancellation log, before/after save | Reproduced cancellation path or real state-loss defect; preserve the failing trace |
| Duplicate/incorrect graduates | Click sequence, queue/ID history, exact new unit defaults and output type/count | Requires a failing regression before C05 can propose a repair |

The UI's generic `canAct` allows a legacy Ninja movement bonus, while training's dispatcher still rejects already-used normal activation. That is a source-backed branch to include if the actual save contains legacy professions; it is **not** a reproduced explanation of the user's report. Ordinary new Pawns do not receive that legacy job automatically.

## Ordinary-play trace request to C02

Reach L4 and construct/enter a camp through legal normal play in the actual Standard setup; do not directly raise level or insert a camp in the primary reproduction. Quick Start and staged fixtures remain separately labeled isolators. Record the seed, organization, source identity and complete legal action list from an agreed starting state.

For the triggering attempt preserve:

- Before/after raw save for independent oracle use; side, round, serial, CP and winner; operator ID/type/level/alive/pos/acted/bonus/project; its relevant learned/equipped skills and legacy job.
- Camp position, owner, actual terrain and complete queue; live unit count, reserved recruits, trainingCapacity; the ordered center-plus-neighbor exit analysis including occupancy and newborn passability.
- UI selection, enabled/disabled reason, requested output/mode, confirmation result, exact request/result, page errors and game log.
- Each end-turn event with the ending side and queue remaining before/after. Include save/load midqueue, a ready blocked queue, released exit, canceled confirmation, double click, moved-onto-camp earlier this turn and post-victory attempt as separate cases.

Existing pawn-worker/skill suites and supplied historical staged controls passing do not reproduce or refute the user symptom. In C05's explicit LF export the existing 54 worker and 55 skill checks passed; no browser interaction or ordinary progression was newly executed. C02 owns diagnosis, C05 a separately authorized engine repair if reproduced, and C06 useful confirmation/rejection/queue feedback. Keep the immutable JS oracle unchanged and any future repaired ruleset/version separate.
