# SM-C04 G0 tactical interface review

Status: proposal for C01/C03/C02 review; **CONTRACT SHA NOT FROZEN**. No production C# implementation.

- Activation: [C00 decision 6543631079](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543631079).
- First intake ACK: [BLOCKED receipt 6543763183](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543763183), posted before this analysis.
- Session: `01a191e1-34fe-77e0-84fd-0a2b9a6328bb`; existing worktree and `sm/c04-r2-tactics` retained.
- Intake/base: `83a0baa8a4486562c5c67144324cede402f29cf7`.
- Executable: `reference/js-v0.5.10/prototype/engine.js`, SHA-256 `7e0253b99b339611c5e149ccf3a7e527f62d31df008bb3e7fe0145d541b89776`.
- Scope: source trace, proposed boundaries and staged JS observations. This is not independent C02 acceptance, C# parity, ordinary-play BUG-001 reproduction, an accepted contract or a defect repair.

## Evidence and reproducibility

The role branch was clean at `7c0b113807b154902de284c6650c61d9e047a583`, then fast-forwarded to exactly the intake. No reset, replacement session, competing import or shared configuration edit occurred. New files are confined to `evidence/SM-C04/`.

| Run | Actual result |
|---|---|
| `g0-intake-20261031-01/receipt.json` | Wrapper exit 1 before any child command: Windows `core.autocrlf=true` converted frozen LF inputs to CRLF. |
| `g0-canonical-20261031-01/receipt.json` | Ordinary `git archive` also applied checkout conversion; same failure, preserved. |
| `g0-canonical-20261031-02/receipt.json` | Command-local LF archive matched 29 reference and 10 starter inventory files. 173 focused checks and 8,412 randomized actions passed; fixture validator exited 1 on CP932 decoding. Wrapper exit 1. |
| `g0-canonical-20261031-03/receipt.json` | Same hash-verified LF source with process-local `PYTHONUTF8=1`: all ten original child commands exit 0, including fixture/schema validation. Wrapper still exits 1 on rebuilt HTML byte mismatch. |
| `g0-tactical-probe-results-01.json` | 22/22 staged behavioral observations pass, including an explicitly labeled baseline anomaly. |

The focused checks are 41 organization + 23 regression + 54 worker + 55 skill cases. Randomized checks cover 5,495 + 2,917 actions on 36 + 24 maps, including staged levels. These are C04 executions, separate from C00 and C02 results. The unmodified wrapper's static `verifier` string identifies its C00 author, not the executing role.

Canonical export command:

```powershell
git -c core.autocrlf=false -c core.eol=lf archive --format=zip --output=<temporary.zip> 83a0baa8a4486562c5c67144324cede402f29cf7
# Extract to a disposable directory, leaving this role's reference/ untouched.
$env:PYTHONUTF8 = '1'
python <disposable>/tools/verify_baseline.py --test --starter --log-dir <new-owned-log-directory>
node evidence/SM-C04/g0-tactical-probes.cjs <disposable>/reference/js-v0.5.10 <new-results.json>
```

Each canonical run records its export command, archive hash and disposable location in `execution-context.json`. The export has no `.git`; its wrapper Git context is therefore null. The companion execution context pins its source to the intake and records the actual role branch/HEAD. It is a disposable export, not another role checkout.

Original HTML: 150,856 bytes, SHA-256 `f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297`. Original Windows bundler output: 152,378 bytes, SHA-256 `f63998403057a8bd8ab4e70969d41fc26f0204de76ad381e0a0c37a93974bdf8`. The original `Path.write_text` has no explicit newline policy. C04 has neither normalized this result into a pass nor changed the original builder. C01/C03 independently reported the same portability issues in [6543771240](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543771240) and [6543805331](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543805331).

Environment: Windows, Git 2.45.2.windows.1, Node v24.20.0, Python 3.14.8; .NET SDKs 3.1.426/5.0.408. Unity and `gh` absent on PATH. Browser scripts, Unity compilation, C# compilation and platform builds NOT RUN. No Unity availability claim beyond the bounded PATH observation. BUG-001 remains OPEN / UNREPRODUCED.

## Proposed ownership and hooks

These names describe required responsibilities; they are not existing/frozen C# APIs. C01 publishes one reviewed contract; C03 owns its data types. No separate C04 game loop or new authoritative state model is proposed.

| Proposed hook/responsibility | C04 output and required dependency |
|---|---|
| `GetOrders(state, unitId)` | Stable destination order using the unit's own observer knowledge, known occupancy and remembered terrain. C05 supplies fog/terrain/passability hooks; C03 supplies ordered units, IDs and coordinates. Never substitute truth-based `moves()` in C06 previews. |
| `GetActionBudget(state, action)` | Separate base activation cost, move-only bonus cost, current CP, used activation and terminal/busy eligibility. Preserve exceptional dispatch for free choices and building. A single unit-level `canAct` or `effectiveCost` is insufficient. |
| `ResolveMove` under C01's facade | Validate known order, then resolve the true ray in sequence. Return the original outcome and preserve actual partial effects. C05 owns objective/XP, capture cleanup, world/queue and sight effects at the specified call sites. |
| `ResolveCaptureContact` | C04 orders protections, CP/bonus charging, optional combat, death and King victory. C05 supplies guard-support XP, worker/queue cancellation, grief, capture XP, objectives and observer refresh; C03 supplies persisted transient state. |
| `FinishOutgoingTacticalTurn` | Clear outgoing bonuses only after C05 builder/training ticks. C01 then advances side/serial/round and requests incoming CP calculation and later observer refresh in the exact order below. |
| `ChooseNextBlackAction` | Return an action or null **and preserve consumed authoritative RNG**. The same facade executes the chosen action. C05 supplies skill/work/camp candidates; observer-safe knowledge is mandatory. |

Choose either synchronous module effects under one authoritative facade or an equivalent ordered effect protocol. Do not precompute an unordered batch from stale state, add an unconditional final refresh, globally roll back every `ok:false`, or run a second combat/turn loop. Those alternatives change observable baseline behavior. A future cleaned-up API needs an explicit versioned decision where it differs from the oracle.

## Exact action dispatch and rejection

Anchors: `engine.js:1046–1083`, `:432–443`, `:137–151`, `:566–592`.

| Order | Baseline operation |
|---|---|
| 1 | Null game or existing winner returns finished-game rejection; missing action/type returns unknown-action rejection. Neither clears `lastEvent`. |
| 2 | Clear `g.lastEvent`. This happens before most later validation failures. |
| 3 | `end` runs end-turn directly and returns success; it needs no unit or CP. |
| 4 | Resolve a living unit by ID and require its side to equal the active side. |
| 5 | `chooseSkill` and `milestone` dispatch before busy/activation/CP gates. They are free but do not reset spent activation. `chooseSkill` calls skill preparation before some rejections. |
| 6 | `build` dispatches to its own worker, level, visible-site, busy, acted and CP checks, then returns directly. Retired `work` rejects. |
| 7 | Generic actions reject a committed project. Already-acted units reject except `move` with `bonus>0`. |
| 8 | Gate cost is 0 for that bonus move, 1 for `claimCamp`, otherwise `activationCost`. Insufficient CP rejects before handler-specific geometry/ability checks. |
| 9 | Dispatch handler; normally its returned error decides `ok`. The default local error is `Unknown action type.` |

`canAct` checks side/alive/project/legacy injury/acted-or-bonus only. It checks neither available CP nor winner. `orders` also does not establish affordability, active-side ownership or game continuation. `effectiveCost` is unit-level and returns 0 for an acted unit with a bonus; the action dispatcher permits that bonus only for movement. C06 must use an action-specific facade/projection.

**Baseline anomaly reproduced, T09:** the `maester` case at `:1073` sets `job='maester'`, marks the bishop acted, deducts CP and logs, but never clears the switch's default error. It returns `{ok:false,error:'Unknown action type.'}` after those mutations. The probe stages a level-15 bishop, observes AP 3→2 and future command power 4, and deliberately does not fix it. C02 should independently reproduce; C00 must decide whether baseline parity retains this behavior or a separate authorized repair is introduced. No defect ID or acceptance is self-assigned here.

Consequently, rejection is not universally a no-op: even an invalid-unit request clears an old event; some handlers normalize fields; `maester` has stronger partial effects. Outcome success, committed state changes, consumed activation and presentation diagnostics must be represented distinctly. Preserve the raw oracle outcome in C02 traces.

## Movement, contact and capture ordering

Anchors: `engine.js:604–667`, `:739–850`.

1. `moves` reads live passability and true occupancy. `orders` reads explored knowledge, current observable occupants and remembered terrain. Black/unexplored tiles terminate a ray. A known forest soft-stops sliders unless `forestStride`. An unobserved enemy or live hidden terrain mutation must not shorten previews.
2. Pawn orders enumerate forward-left, forward, forward-right. Empty passable diagonals are moves; only diagonals capture. Black advances toward increasing rows; White toward decreasing rows. Other direction/destination iteration order must match the exported constants.
3. `moveAction` rechecks acted/busy/legacy injury and membership in `orders` before examining a true execution path. It records the original position.
4. At each ray square: reject true impassability first; then stop before an unobserved enemy; then stop before an intermediate true occupant; then update the last safe square; then enter and stop on an intervening forest. A hidden soldier on a forest takes precedence over entering that forest.
5. On interruption: charge the move, optionally move and append interrupted history (only if position changed), claim an objective if moved, set `lastEvent` with actual/attempted endpoint, log, refresh both observers with actor identity, and return success. Even a zero-distance interruption consumes CP/activation. Ninja first-action bonus RNG still runs.
6. With no interruption: recheck destination ally; dissolve a destination enemy decoy; append attacker-origin battle echo for a real military target.
7. Protection priority: Pawn `skillWard`, mercy `ward`, local War Queen guard, bonded protector Knight. Each absorbed strike spends the move, leaves attacker and target in place, and returns success. Pawn-ward support XP occurs before charging; that branch refreshes sight. Mercy/War/protector branches return without the same refresh. Preserve those branch-specific calls.
8. Then charge the regular move. A normal activation deducts the **current** `activationCost` and sets `acted=serial`; a bonus decrements `bonus` without CP. A Ninja rolls once on its first charged move per serial, including an interruption, and never recursively on a bonus.
9. Optional `pips`: subtract one, returning early with neither unit moving if protection remains. Optional HP: apply damage, award first attacker/target hit XP once, and return early if the target survives. Both produce their actual `lastEvent` and refresh.
10. Lethal capture: set victim dead, run capture cleanup (cancel its worker training, clear project, apply lover grief), replace echo with destination contact, award capture XP (including recent-recruit reduction), then set winner if the victim is King.
11. Move attacker, append normal history (newest first, cap 10), claim shrine objective, log, then refresh both observers with actor identity. This completion still occurs after setting winner. Later actions/end-turn cannot tick queues or advance a finished game.

Classic normal moves/captures do not synthesize a `lastEvent` object; it remains null after dispatch. `log` is newest-first and capped at 90. If presentation needs richer events, define a separate filtered projection without rewriting oracle state or adding hidden victim/blocker details to ordinary UI output.

Capture XP, shrine XP, first contact and exploration can level units/King and change later costs/vision. Refresh is therefore effectful, not an interchangeable repaint. Preserve exact actor attribution, call count and order. C03/C02 must not canonicalize these fields away.

## CP, clocks and end-turn hooks

Anchors: `engine.js:37–39`, `:204–230`, `:445–548`, `:1034–1044`.

Opening costs P/N/B/K=1, R=2, Q=3 in roomy mode; original Queen cost 2. Rank adds cost at levels 20/50/80; discounts subtract; final cost is clamped to at least 1 and at most current side command power and 5. Do not make every King action free. Default CP is 3; King milestone base plus command-mode offset, developed local War Queen and Maester can raise it, capped at 9.

End-turn is not an automatic consequence of reaching zero CP:

| Phase | Owner/call order required in the single facade |
|---|---|
| Terminal guard | If winner exists, do nothing. |
| Outgoing effects | C05 `tickBuilders(outgoingSide)`, then `tickTraining(outgoingSide)` with the old side/serial/round still active. Completion and observer effects occur inside those routines. |
| Tactical expiry | C04 clears outgoing-side bonuses. Used activation is not mass-reset; it is compared against serial. |
| Clock advance | Switch side, increment serial, increment round only when returning to White. |
| Incoming budget | Calculate incoming command power after outgoing effects and install `g.ap`. |
| Incoming bookkeeping | Shrine gold for incoming occupants, expire beacons/decoys/echo whose `until < newSerial`, update incoming Queen fatigue from grief. No idle-turn XP. |
| Observation/log | Refresh both with no actor, then prepend the incoming command-phase log. |

Queue graduates are marked acted using the outgoing serial. Worker death/queue disruption must occur at the capture site before a later turn tick; finished games do not progress training. Clock boundaries, inclusive expiries, serial-based cooldowns and round-based history cannot be collapsed into one turn counter.

For shared queue terminology, `spawnAtCamp` at `:519–521` considers the camp tile first, then adjacent cells in King-direction order. A two-Pawn batch needs two legal/free placements from that list, not necessarily two adjacent squares. C06 independently highlighted this in [6543856113](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543856113). C04's tactical death/occupancy hooks must preserve that ordering for C05 and C02.

## AI contract

Anchor: `engine.js:1085–1140`.

- Return null after winner or outside Black. First handle pending Pawn drafts, even when ordinary activation/CP is unavailable.
- Then consider affordable available camp trainers (stable ascending activation-cost order), first-camp construction, and King recruitment. The recruitment chance uses RNG and differs in opening rounds.
- Build objectives from known shrines and known occupants; build enemy targets from observable military units. Enumerate each affordable eligible unit in stored array order and each `orders` destination in its stable order.
- Score progress toward objectives/contact, apparent captures (King +10000), shrine terrain, King exposure and recent backtracking; consume an RNG draw per move option. Add supported Pawn skill/work and Maester candidates in the actual order.
- No candidates returns `{type:'end'}`. Otherwise stable-sort descending score, then consume one draw: with probability 0.1 choose index `min(3,last)`, otherwise index 0. This is not uniform sampling among the top four.
- `aiChoice` consumes authoritative RNG **before** action execution. Repeatedly asking a live game for a hint changes future choices. C03 must clone/persist RNG exactly; C02 should trace chooser output and post-choice RNG separately from executing a supplied action. Avoid double-running a chooser during replay.
- Existing AI does not choose every exposed action (for example general Queen abilities, Fission and camp claim are absent from this chooser). Preserve this limited baseline; future facility AI is a separately approved delta.

## Executed adversarial observations

All 22 cases are staged, deterministic source probes; none is an ordinary-progression sacrifice reproducer. Exact requests/outcomes and state samples are in `g0-tactical-probe-results-01.json`; executable source is `g0-tactical-probes.cjs`.

| ID | Observation verified |
|---|---|
| T01 | Hidden enemy removal does not change `orders`; true `moves` differs. |
| T02–T03 | Adjacent/far unseen enemies cause successful, charged interruption without blind capture; history changes only after actual displacement. |
| T04–T06 | Remembered plain/live water blocks before the tile; new forest stops on the tile; a hidden soldier in forest stops before it. |
| T07–T08 | Malformed input versus invalid-unit event clearing differs; terminal actions/direct end-turn preserve state. |
| T09 | Maester's false result with committed job/CP/activation reproduced, not repaired. |
| T10 | `canAct` and `orders` alone cannot enforce CP/terminal validity. |
| T11–T12 | Saved Ninja bonus permits only movement at zero CP; interrupted first move rolls once, bonus never rerolls. |
| T13–T14 | Pawn ward precedes mercy; mercy branch writes echo and spends activation without refreshing sight. |
| T15–T17 | King death wins after movement/history completion; Queen death does not; surviving pips keep both pieces in place. |
| T18 | Passing at zero CP advances the right clocks, clears outgoing bonus and expires effects without idle XP. |
| T19–T20 | AI mutates RNG at selection, repeats from identical state, returns pass with no affordable actions and null when inactive/terminal. |
| T21 | Free Pawn draft bypasses busy/activation/CP gates without resetting those fields. |
| T22 | Fission charges the pre-reset cost, resets both pieces to level 1, marks both acted and persists lineage use. |

Additional contract/QA scenarios are required below; they are **proposed, not newly executed coverage claims**:

| Scenario | Exact fixture/action and required comparison |
|---|---|
| P01 Pawn symmetry | Both sides, central Pawn, three empty forward cells: all three moves; enemy directly ahead excludes straight capture; enemy diagonals permit capture; sideways/backward excluded. Compare ordered destinations and CP/activation/outcome after each request. |
| P02 Ray knowledge | R/B/Q with explored passable ray ending at a black tile, remembered forest, `forestStride`, visible/cloaked enemy and decoy variants. Compare previews before hidden mutation, real endpoint after execution and both observers' post-state. |
| P03 Cost boundaries | Both modes; each type at levels 1/19/20/49/50/79/80/99; discounts at floor; King CP milestones and War/Maester bonuses at cap. Compare gate cost versus charged cost, zero-CP rejection, normal versus move-only bonus, CP unchanged by mere level-up until the actual relevant hook. |
| P04 Remaining protection/HP | Q protected by bonded N at distance 2 versus 3, repeat attacks in the same serial, ward stacking, lethal versus nonlethal HP/pips and `battleEcho` expiry. Compare dead/position/CP/XP/ward/observer state at every branch. |
| P05 Save mid-action state | Save after interruption, after first Ninja move, after guard contact and before/after AI choice; load v15 then continue the same requests. Preserve used activation, bonus, RNG, ninjaRolled, history, wards, hit/support awards and timers; compare any load-time refresh separately. |
| P06 Capture with queues | Capture a training/project Pawn; assert worker project/assigned queue cancellation occurs before outgoing ticks. Capture King with live queues; subsequent `end` must reject and queues remain unchanged. |
| P07 Turn phase causality | Builder with one remaining tick plus a queue with one tick, outgoing bonus and expiring echo; end each side. Record completion/XP/vision before switching, new serial/round, incoming CP and final observer data. |
| P08 Optional camp claim | Capture mode off/on, same-round arrival/next friendly turn, Rook actor at 1 CP, active queue/teacher, cap reservations and both sides. Compare exact 1-CP charge, ownership, cleared queue/teacher project, echo and no victory. This is baseline optional claim only. |
| P09 Ordinary BUG-001 | C02's legal progression/camp/UI path with actual confirm/CP/acted/cap/two-exit/queue state; none of this report's staged probes closes it. |
| P10 Cross-configuration | Run the action/outcome/state/observation trace matrix on 30/50/70 boards, all three current organizations and seeds 43971/112233/88001, with mirrored and independently selected opponents. Keep source and ruleset pins attached. |

## C03/C02 data requirements and candidate review status

The single candidate must retain ordered unit arrays/IDs; `side`, `ap`, `serial`, `round`, `winner`; uint32 RNG and draw order; current/remembered/seen terrain; `lastEvent`; log/history order and caps; acted/bonus/ninjaRolled; project/queue ownership and progress; ward/guard/protector state; battle echoes and inclusive expiries; hit/support XP award registries; lineage/Fission state; and action-relevant absent/null distinctions. An enriched outcome cannot silently change the raw JS `{ok,error}` result or treat every false outcome as rollback.

At the reviewed remote snapshots `sm/c01-r2-integration@5269695acff36d9269f67d785ff44cdff829e68b` and `sm/c03-r2-state@6e9f7e75c0283a2551c82cb16cb66d39bba8e047`, only intake/blocker evidence was published; no `docs/contracts/` candidate or Core types existed. Their exact evidence was read, not merged. C02's current-intake receipt [6543767565](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543767565) reports independent blob diagnosis and pending oracle work. No complete candidate/schema review or contract ACK is claimed yet. This report supplies C04's requirements for C01 to incorporate into that single candidate.

Requests to C00, with affected owners in CC:

1. C01/C03: preserve action-specific dispatch, rejection side effects, charged interruption, branch-specific refresh and chooser RNG in the shared contract. Publish an exact candidate SHA for C04 review; C02 supplies independent canonical replay/observer coverage.
2. C02/C00: independently triage T09 Maester. Decide a separately versioned repair or explicit baseline retention; do not silently repair it while porting.
3. C01/C00: address checkout LF, default Python encoding and generated-output newline portability within the authorized shared configuration lane. Retain all failed runs and raw hashes; no oracle edit or weakened verifier is requested.
4. CR-001 remains a later rules revision: decide move-to-capture price, shared versus separate command activation, how a charged zero-displacement interruption counts against the once-per-friendly-turn allowance, and save migration. The King global activation cost stays paid in baseline. Bonus/save/load cannot permit two free moves.
5. CR-002 remains a later rules revision: decide eligible units/facilities, CP/activation, occupation/response-turn requirement, feature gating, queues/refunds/worker locks and legacy migration. C04 validates; C05 applies ownership/queue/terrain/sight consequences. Hidden changes do not update stale memory. Bridge/tunnel demolition remains deferred; shrines are not automatically burnable.

Traditional K1 Q1 R2 N2 B2 P2, Middle K1 N2 P6 and Flatten K1 P9; intentional two-worker inefficiency, no-camp Standard, no independent engineer and no new camp cap remain unchanged. C00 alone freezes the reviewed revision and opens a named G1 scope after exact implementer ACKs.
