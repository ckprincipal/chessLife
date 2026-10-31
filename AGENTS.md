# Stale-Mate agent instructions — SM-UNITY-R2

## Authority and current command

The user is final design authority. **ChatGPT SM-C00 / 000-S2** owns assignments, contract freezes, gates and exact-revision acceptance.
**codex-maya** is first deputy for local launch, relay and receipt collection. **SM-C01 integrates; SM-C02 independently verifies.**
Use the [single mailbox](https://github.com/ckprincipal/chessLife/issues/1). Read its latest applicable C00 decision before work,
after a milestone, before taking a dependency and before handoff. ACK the exact comment URL and any accepted contract SHA.

The [preparation/HOLD decision](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543518615) records the six launched sessions.
Preserve those sessions/worktrees and local changes. The launch base `7c0b113807b154902de284c6650c61d9e047a583` is partial staging.
C00 owns current source publication recovery; do not create a competing import or `.import/READY` trigger.
A published source candidate needs an exact C00 intake activation before G0 source-dependent work. Production begins only after
C00's reviewed contract freeze, the implementer's exact ACK, and the named next scope. Documents and READY receipts do not open gates.

## Read and verify

Read `README.md`, `docs/COMMAND_CENTER.md`, `docs/RULES_AND_CHANGES.md`, `docs/ACCEPTANCE.md` and your `docs/agents/SM-C0N.md`.
Historical drafts in `docs/history/` and the dated S1 handoff retain provenance; later C00 decisions govern current coordination.

`reference/js-v0.5.10/` is the immutable behavior oracle. Preserve source, old fixtures, saves and original evidence byte-for-byte.
Use `python tools/verify_baseline.py --test` for JS checks in a disposable copy. Initial intake adds `--starter` for original Unity files
and fixture/schema checks; this does not compile Unity or permanently freeze its development. Optional `--browser` requires browser
dependencies and must report missing execution as NOT RUN. Keep current logs distinct from S1's historical receipts.
A JS hotfix requires a separately authorized writer/workstream; never repair the frozen oracle in place.

## Exclusive write ownership

Associated `.meta` files follow their owner; shared `.asmdef` and project configuration remain C01's lane.

| Owner | Paths and scope |
|---|---|
| C00 | Command center, authoritative design/change statuses, status and gate/acceptance records |
| C01 | `docs/contracts/` publication/index; `tools/integration/`; `.github/`; root build/CI configuration; `unity/Packages/`, `unity/ProjectSettings/` and shared assembly registry; `unity/Assets/Scripts/Runtime/`; `evidence/SM-C01/` |
| C02 | `tools/parity/`, `tests/parity/`, `tests/triage/`, `unity/Assets/Tests/Parity/`, `evidence/SM-C02/` |
| C03 | `unity/Assets/Scripts/Core/`, `unity/Assets/Tests/EditMode/SMC03/`, `evidence/SM-C03/` |
| C04 | `unity/Assets/Scripts/Rules/Tactics/`, `unity/Assets/Scripts/Rules/AI/`, `unity/Assets/Tests/EditMode/SMC04/`, `evidence/SM-C04/` |
| C05 | `unity/Assets/Scripts/Rules/World/`, `unity/Assets/Scripts/Rules/Progression/`, `unity/Assets/Tests/EditMode/SMC05/`, `evidence/SM-C05/` |
| C06 | `unity/Assets/Scripts/Presentation/`, `unity/Assets/Editor/`, `unity/Assets/Scenes/`, `unity/Assets/Resources/`, existing `StaleMateBootstrap.cs`, UI/art/input assets, PlayMode UI tests, `tools/build/`, `evidence/SM-C06/` |

Request cross-owner edits through C00. C03 defines core contracts; C01 publishes the reviewed contract and composes Runtime.
C04 owns tactics/AI and C05 owns world/progression; freeze their exact validation/effect ordering at G0.
Pure rules must not depend on `UnityEngine`. Presentation must consume filtered observations and cannot mutate authoritative state.
Use one composed game facade, not separate competing loops. C05 delivers world/fog, then labor/training, then XP/skills in stages.
C02 may author oracle fixtures/tests and reproducers, but not the runtime candidate it independently certifies.

## Delivery and preservation

Use the existing role branch/worktree from the pinned intake. PRs target `campaign/unity-r2`; no force pushes, destructive resets,
unapproved main/golden changes or historical PR merges. C01 assembles accepted revisions; C02 verifies the exact composition;
C00 accepts a named SHA and supported scope. Preserve failures and unsupported scope in receipts.

A delivery identifies branch/base/contract/dependency/HEAD SHAs, changed owned paths, actual commands and exit codes,
committed test/log/build evidence, limitations and the next decision needed. Write new run logs in your owned `evidence/SM-C0N/` directory;
do not overwrite C00 or peer receipts. Do not infer Unity gameplay or platform success from JS checks.
No automatic polling or background supervision is established.

Preserve the approved rosters, intentional Traditional two-worker inefficiency, no-camp Standard, no independent engineer and no new camp cap.
BUG-001 remains open until supported by a real diagnosis. Free King movement and facility capture/burning require the outstanding semantic decisions;
do not convert provisional R1.1 interpretations into approved rules. The change ledger and frozen source retain the detailed contract.
Never commit credentials, license tokens, caches, private conversation dumps or unrelated material.
