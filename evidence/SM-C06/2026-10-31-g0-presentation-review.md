# C06 G0 presentation and desktop review

Status: proposal for C01's single shared-contract candidate; **not a contract freeze or production implementation**.

- Author/session: SM-C06 / `01a191e1-3785-74b0-9230-c98605e5e1eb`.
- Authority: [C00 G0 activation 6543631079](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543631079).
- Intake/base and every source anchor below: `83a0baa8a4486562c5c67144324cede402f29cf7`.
- Contract SHA: **NOT FROZEN**. No C01/C03 candidate revision is claimed reviewed.
- First intake ACK/BLOCKED receipt: [6543760251](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543760251).
- Changed scope: new `evidence/SM-C06/` files only. No reference, viewer, package, project, assembly, or gameplay edits.

## Executed evidence and precise blockers

| Run | Executed result | Limit |
|---|---|---|
| Normal role checkout: `python tools/verify_baseline.py --test --starter --log-dir evidence/SM-C06/2026-10-31-g0-intake` | Exit 1, first manifest mismatch `CURRENT_HANDOFF.md`; zero child tests | Checkout uses system `core.autocrlf=true`; 29 reference and 9 viewer working files differ from their pinned bytes |
| Read-only provenance comparison | All 29 reference and 10 viewer Git blobs match intake provenance | Object integrity does not make the working-copy wrapper pass |
| Initial disposable `git archive` without newline overrides | Export integrity failed before tests | This host also applied newline conversion during that export; failure retained in `g0-intake/export-attempts.txt` |
| Corrected disposable export, `python evidence/SM-C06/2026-10-31-g0-intake/verify_exact_export.py` | Export manifests 29/29 and 10/10 match; Node syntax checks, 173 focused checks, 8,412 randomized actions, and builder command exit 0; original fixture validator exits 1 | Complete wrapper FAIL: fixture reader defaults to cp932 and cannot decode UTF-8 JSON. The export helper uses per-process `core.autocrlf=false`/`core.eol=lf`; no Git configuration file changes |
| Targeted original fixture validator with process `PYTHONUTF8=1` | Exit 0; all three historical fixture/schema checks pass | JSON/source validation only; Editor NOT RUN |
| Targeted original builder with process `PYTHONUTF8=1` | Builder exits 0; output is 152,378 bytes | Raw byte identity FAIL: original is 150,856 bytes. Rebuild has 1,522 CRLF pairs; replacing those pairs with LF exactly reproduces original bytes. This diagnostic normalization is not an accepted replacement for the required byte comparison |
| Editor / Test Runner / Windows build / launch | **NOT RUN** | No Editor executable was located or usable license verified |

The focused counts are 41 organization + 23 regression + 54 worker + 55 skill checks. Randomized suites performed 5,495 + 2,917 actions on 36 + 24 seeded maps, including staged-level scenarios. These are this C06 execution, not C02 acceptance or evidence of balance, BUG-001 closure, C# parity, or playability.

Raw logs/receipts are under `2026-10-31-g0-intake/`, `2026-10-31-g0-exact-export/`, and `2026-10-31-g0-windows-followups/`. The wrapper's static `verifier` field names its C00 author; C06 executed these runs. The exact export has no `.git`, so its wrapper Git context is null; `export-context.json` supplies the exact archive command/pin and manifest results.

Environment: Windows 11 Home x64 `10.0.26200`, Node `v24.20.0`, Python `3.14.8`; .NET SDKs `3.1.426` and `5.0.408`, host/runtime `8.0.8`. VS Build Tools 2022 `17.7.34202.233` registers the desktop VC x64/x86 tools component. Windows SDK include versions are recorded in `environment-inventory.txt`. This inventory is not a Unity toolchain compatibility/build pass.

`Unity`/`UnityHub` are absent from PATH, checked machine/user uninstall entries, checked standard C:/D:/F: Editor locations and checked Hub editor/secondary-install registrations. An unexamined custom installation is not ruled out. The actual project pins `6000.3.0f1`; that file does not establish installation or license availability.

C01 requests: include an explicit byte-preserving Windows checkout policy in the shared intake/build plan; use UTF-8 for the original viewer validator's environment; keep the Windows standalone newline difference visible. The original builder uses `Path.write_text` without a newline argument (`reference/.../tools/build_standalone.py:9`). Do not change immutable reference bytes or loosen expected hashes. Decide a canonical execution platform or separately authorized portability treatment through C00/C01.

## Actual viewer inspection

| Source anchor | Observed implementation | Consequence for the proposed adapter |
|---|---|---|
| `unity/Assets/Scripts/StaleMateBootstrap.cs:17` | `OpeningState` contains full terrain/units and white-only sight/memory arrays | This fixture DTO must not become the production observation DTO |
| `StaleMateBootstrap.cs:76` | Loads `Resources/openings_v058` | Static historical input, not current new-game state or a live facade |
| `StaleMateBootstrap.cs:159` | Immediate-mode GUI; viewport culling, zoom/pan, piece inspection | Camera/input/layout can inform later presentation work; no dynamic action execution exists |
| `StaleMateBootstrap.cs:205` | Misted terrain is a uniform color; `rememberedWhite` is not used for tile inspection/rendering beyond array validation | Adapter needs an explicit last-observed terrain projection, not a current-terrain fallback |
| `StaleMateBootstrap.cs:212` | Uses white side and sight to decide whether a fixture unit is drawn | Not the v0.5.10 `canObserveUnit` contract, which additionally handles cloaked Phantom behavior |
| `StaleMateBootstrap.cs:264` | Any in-bounds clicked tile assigns `current.terrain[pos]` to inspection text before visibility is checked | Static source finding: unseen/misted tile inspection reads hidden true terrain. This is not a Unity-run reproduction, and no fix is claimed. The live adapter must never receive hidden true terrain |
| `unity/Assets/Editor/StaleMateSceneMenu.cs:15` | Creates `Assets/Bootstrap.unity` and writes `EditorBuildSettings.scenes` | Scene creation also mutates C01-owned ProjectSettings; coordinate that part of a real import/build receipt with C01 |
| `unity/Packages/manifest.json:2` | Only IMGUI/JSON serialization module dependencies are declared | Do not claim Test Runner readiness; let C01 select any test/package/assembly changes after a real Editor inspection |

Original fixtures retain Traditional 8, Middle 7, Flatten 6 units per side. They must remain labeled historical. The live v0.5.10 setup must come from the composed facade: Traditional K1 Q1 R2 N2 B2 P2; Middle K1 N2 P6; Flatten K1 P9; zero Standard camps. Do not patch historical fixtures into apparent gameplay or equalize the deliberate two-worker Traditional opening.

## Proposed adapter boundary for C01/C03 review

Names below describe required capabilities, not new C# types or a competing facade. C01 publishes one candidate after C03/C02/C04/C05 review.

| Capability crossing the boundary | Minimum presentation information | Ownership / restriction |
|---|---|---|
| New game / load / save | Configuration and ruleset/save identifiers; opaque save payload; success/rejection and resulting observation | C01 facade/C03 state-save logic. UI must not construct authority from fixtures or rewrite loaded armies/camps |
| Observe active player | Board size, side, serial/round/version, CP/turn/winner; filtered own/observable entities; per-cell unknown/remembered/current state with permitted terrain; permitted ghosts/decoys/objectives | C03 DTO; C05 filtering and C04 interactions. No `GameState`, full enemy list, current hidden terrain, enemy private queues, or raw hidden log in presentation |
| Inspect selected entity/tile | Only observable details, own activation/busy/skills/work/queue information, and permitted shrine information | Do not dereference true state or render hidden types/IDs through tooltips, accessibility labels, minimap, selection, cached view objects, or rejection text |
| Query actions/targets | Knowledge-based legal order/target descriptors, current permitted costs, enabled state and safe disabled reasons | C04 legality / C05 effects through C01. UI does not rebuild chess rays, CP discounts, camp capacity, or hidden blocker checks |
| Submit intent | Selected unit/action identifiers and chosen targets/options; a local correlation for input handling | Runtime validates and commits once. UI does not charge CP, consume activations, move authoritative units, decrement work ticks, or award XP |
| Receive result | Accepted/rejected result; observer-safe event/reason data; fresh observation/version after processing | C03/C01 contract. Do not assume every rejected action is a total no-op: JS `action` clears `lastEvent` before several rejection paths (`engine.js:1046`) |
| Observer handover | Explicit active-side observation and a private handover screen | Clear old selection, target mode, piece/tooltip/minimap caches and pending confirmation before displaying the next side. Center from permitted own units |

The adapter owns only camera, zoom, viewport, selection ID, target/confirmation state and input-in-flight state. It consumes immutable observation data and sends intents. The composed runtime remains the only game loop. Rules stay independent of `UnityEngine`; changing the UI package is not required to decide these boundaries.

Snapshot/order freshness is a candidate question: C01/C03 should expose enough serial/version information to reject stale confirmations and invalidate previews. UI double-click suppression is local input handling; it is not a new game rule, automatic retry, or a proposed state transaction mechanism.

Observer fidelity anchors: `engine.js:608` remembered terrain; `:635` knowledge-based orders; `:716` `canObserveUnit`; `:717` sight/memory refresh; `app.js:21` remembered terrain rendering. Currently visible terrain alone is insufficient to filter cloaked units. Legal mist orders stay distinguishable from observed legal moves without consulting true hidden blockers.

## Proposed action and queue feedback

1. Selection and hover query permitted actions for the active observation. Show a concrete disabled reason for insufficient CP, an already-used activation, a busy worker/camp, level eligibility or reserved capacity only when the facade can disclose that reason safely. A preview is not an execution promise.
2. A sacrifice request opens a modal naming the actual own Pawn ID/level and chosen batch: permanent loss of that Pawn's XP/upgrades; two friendly training ticks; no extra King XP charge. Cancel closes the modal without dispatching a game action. Confirm submits once and revalidates against current runtime state; no optimistic removal/queue mutation.
3. Successful sacrifice selects the camp or queue after the Pawn is removed. Display queue start immediately rather than retaining a dead selected Pawn. `app.js:66` clears a removed selection; its camp controls at `:170` are selected-Pawn dependent. This is a source-backed feedback concern, not a diagnosis or closure of BUG-001.
4. Show actual remaining friendly work ticks, mode and batch from the permitted queue projection. Tick on the originating side's end-turn processing, not wall time, every click, or either player's turn (`engine.js:1034`). Keep stationed 5 / Instructor 4 distinct from sacrifice 2.
5. At zero remaining, distinguish ready/waiting from completion; never fabricate graduates or remove the queue. `spawnAtCamp` (`engine.js:519`) considers the unoccupied camp tile itself before neighboring cells. Two-Pawn production needs two legal placements from that actual list; it does not impose two neighboring squares when the camp itself is available. Preserve source order and ask C00/C02 to keep terminology precise.
6. Display queue completion, cancellation or pause only from permitted result/observation information. Do not expose a hidden blocking unit or update a remembered facility tile from true state. Safe visibility of own-queue status after unseen facility changes needs C05/C02/C03 review.
7. Movement execution may legitimately spend the action and stop at forest/hidden obstruction. Distinguish those accepted outcomes from rejection using safe runtime result/event data (`app.js:66`); do not automatically retry or refund.
8. Explain UI-001 without changing mechanics: gold shrine terrain means +5 base XP on eligible claim with seven-round repeat cooldown and learned loadout access; royal modifiers may affect XP. Gold selection border, visible-move dots, action-target outline and minimap viewport are separate; remembered-mist orders use dashed blue. Unknown cells must not disclose shrine existence through inspection.

No free-King-move cost/activation interpretation or facility capture/burn policy is implemented or inferred. CR-001 capture price/shared activation and CR-002 costs/occupation/queues/migration remain C00 decisions for a separate rules revision.

## Candidate questions and later acceptance scenarios

For C01/C03/C05/C02: freeze coordinates and serialized side/terrain/action identifiers; distinguish actual units from observer ghosts/decoys; define observation ownership and safe event/log/rejection filtering; define snapshot freshness and pending-confirmation behavior; expose authoritative CP/activation/skill/queue descriptors; define how unseen facility changes interact with queue feedback. These are review requests, not frozen API names.

After C00 freezes the exact candidate, this role ACKs that revision and implements only the named scope. Proposed interaction evidence for that future scope:

- Both hot-seat sides on 30/50/70 boards; current 10/9/10 armies, no-camp Standard and optional Quick Start, with state coming from real facade calls.
- Unknown/misted tile click, tooltip, minimap and screen-reader text disclose only permitted information; hidden terrain/facility mutation leaves memory unchanged until sight returns; cloaked units/decoys/ghosts follow observation semantics.
- Visible versus mist legal orders; rejected requests, accepted forest-stop and hidden-blocker interruption; no double activation/CP charge from rapid clicks or stale target mode.
- Sacrifice confirm/cancel, move-onto-camp already acted, busy or wrong-side worker/camp, full/reserved capacity, zero-tick blocked deployment, a free camp tile plus one valid neighbor, save/load midqueue, completion and cancellation. Pair C02's ordinary-play reproducer with C05's runtime evidence; staged level grants do not close BUG-001.
- Real pass/handover, King capture/end state, load/save, Pawn offer/loadout/cooldown flows, and UI-001 legend/inspection with no hidden-data path.
- Named Editor version, actual compile/Console logs, Unity Test Runner results when configured, Windows build artifact and actual launch/smoke. Fixture validation and Node tests cannot satisfy any of those receipts.

Next decisions: provide an installed/licensed Editor path/environment; C01 addresses the shared Windows intake/verification policy and publishes the single candidate; C00 reviews/freezes an exact revision and names a subsequent implementation scope. C06 remains blocked on Editor execution and available for candidate review.
