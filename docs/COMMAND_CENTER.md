# Command center — SM-UNITY-R2

## Authority and scope

**SM-C00 = ChatGPT coordinator / 000-S2, centralized commander.** The user owns game design and overrides all decisions.
C00 assigns scope, resolves cross-module decisions, freezes contracts, opens gates and accepts/rejects exact deliveries.
**SM-C01 is integration engineer, not a second commander.** C01 may prepare an integration candidate, but may not self-approve,
reassign other agents, change mechanics, merge to `main`, or advance a phase without an explicit C00 receipt.
C02 is the independent verifier and must not author the runtime candidate it independently verifies.
**codex-maya is the first deputy:** relay C00 decisions to the existing local sessions, collect receipts and coordinate local environment work.
The deputy does not freeze contracts, change gameplay or accept integration candidates.

This source-publication candidate recovers the v0.5.10 rules reference and Unity starter and consolidates the R1/R1.1 requests.
No gameplay change is implemented by this consolidation. The user has now authorized publication into the existing public
`ckprincipal/chessLife` repository. Never publish credentials, private conversation dumps or unrelated files.
Historical `main`, the v0.4 golden ref and draft PRs #3/#4 are preserved. Work occurs on `campaign/unity-r2`.

## Single mailbox

All coordination occurs in [https://github.com/ckprincipal/chessLife/issues/1](https://github.com/ckprincipal/chessLife/issues/1). Agent task branches/PRs contain code and evidence, not parallel command channels.
Read it before beginning, after completing a milestone, before taking a dependency, and before handoff. No assumption that another
session saw a message. The latest C00 `ACTIVATE`, `CONTRACT-FREEZE`, `GATE-OPEN`, `ACCEPT`, `REVISE` or `HOLD` identifies the exact scope and SHA.
Cross-agent questions are addressed to C00 with the relevant agent in CC. ACK exact messages and commit pins.

```text
FROM: SM-C0N / session-id
TO: SM-C00
CC: (affected agents, or none)
KIND: READY | QUESTION | BLOCKED | DELIVERY | REVIEW | HANDOFF
CAMPAIGN: SM-UNITY-R2
TASK / GATE: ...
ACK OF: exact mailbox comment URL/ID
BASE SHA / CONTRACT SHA: ...
BRANCH / HEAD SHA / PR: ...
OWNED PATHS CHANGED: ...
TESTS: exact commands, exit codes, test source and artifact paths
RESULT: what is implemented/verified, not just intended
LIMITATIONS / NOT RUN: ...
NEXT / DECISION REQUESTED: ...
```

C00 decision records add `DECISION ID`, accepted/rejected SHA, scope and next authorized gate. No approval by silence.
When returning to this ChatGPT conversation, the user can say **"review the mailbox"**; C00 reads live receipts and responds.
No autonomous background review or polling is promised by this document.

## Current preparation and intake

The user-relayed codex-maya handover, verified at 2026-10-31 12:15 UTC, reports six local sessions launched.
Their launch base was `7c0b113807b154902de284c6650c61d9e047a583`, a partial source-staging checkout, not an accepted intake.
Keep launch, individual READY/ACK receipts, source intake, contract freeze and production authorization as separate states.
The [S2 takeover](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543304373) and
[preparation/HOLD decision](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543518615) are continuity anchors;
later applicable mailbox decisions govern actual work.

**C00 is the single owner of the current source recovery/import.** C01 verifies the published candidate and retains the integration lane.
No competing import or `.import/READY` trigger is authorized. Source recovery does not change the permanent six-role ownership below.

| Agent | Preparation authorized under the linked HOLD decision | Work after exact-SHA G0 intake activation |
|---|---|---|
| C01 | Checkout/local-change and toolchain inventory; assembly/CI plan | Verify the candidate; publish reviewed contract candidate and integration plan |
| C02 | Replay/canonicalization questions and ordinary-play sacrifice reproduction matrix | Independently rerun the JS reference; build oracle fixtures and reproduce BUG-001 |
| C03 | State/RNG/save requirements and provisional schema questions | Inspect exact JS and old fixtures; propose shared contracts and minimal types |
| C04 | Tactical/AI boundaries and adversarial scenarios | Trace exact source; review hooks and contract; retain unresolved King semantics |
| C05 | Three-stage world/progression plan and dependency questions | Trace fog/work/training/skills; propose hooks and assist sacrifice diagnosis |
| C06 | Actual Editor and desktop toolchain inventory | Import/compile the exact viewer or report blocker; propose presentation adapter |

Each agent resumes its existing session/worktree, preserves local changes, reads the current command and ACKs its exact comment URL.
If no completed-intake SHA is named, continue only the authorized preparation and report source-dependent work BLOCKED.
Do not infer authorization from a newly published file or another agent's READY receipt.

After source publication and a clean verification receipt, C00 can activate G0 at one exact intake SHA.
G0 ends when C00 freezes the reviewed shared-contract revision and implementers ACK that exact revision.
The C00 freeze/gate decision names the bounded implementation scope opened next; it does not authorize an unrestricted port.
Independent environment checks and defect reproduction may proceed within their assigned scope.

## Ownership map (including each file's .meta)

| Agent | Exclusive writes |
|---|---|
| C00 | This command center, design authority/change statuses and acceptance receipts |
| C01 | `docs/contracts/` publication/index; `tools/integration/`; `.github/`; root CI/build config; Unity package/project config and assembly-definition registry; `unity/Assets/Scripts/Runtime/`; integration evidence |
| C02 | `tools/parity/`, `tests/parity/`, `tests/triage/`, `evidence/SM-C02/`, independent parity Unity tests under `unity/Assets/Tests/Parity/` |
| C03 | `unity/Assets/Scripts/Core/`, `unity/Assets/Tests/EditMode/SMC03/`, `evidence/SM-C03/` |
| C04 | `unity/Assets/Scripts/Rules/Tactics/`, `unity/Assets/Scripts/Rules/AI/`, `unity/Assets/Tests/EditMode/SMC04/`, `evidence/SM-C04/` |
| C05 | `unity/Assets/Scripts/Rules/World/`, `unity/Assets/Scripts/Rules/Progression/`, `unity/Assets/Tests/EditMode/SMC05/`, `evidence/SM-C05/` |
| C06 | `unity/Assets/Scripts/Presentation/`, `unity/Assets/Editor/`, `unity/Assets/Scenes/`, `unity/Assets/Resources/`, UI/art/input assets, PlayMode UI tests, `tools/build/`, `evidence/SM-C06/`; the existing `StaleMateBootstrap.cs` viewer |

C01 owns shared `.asmdef`, Packages and ProjectSettings changes; C06 proposes environment fixes instead of concurrently editing them.
C03 defines core DTOs/contracts; C01 publishes them after review and supplies composition/facade orchestration in Runtime.
C04 supplies tactical legality and CP/capture intent; C05 supplies fog/world/queue/XP effects. All cross-owner modifications are requests,
not casual edits to a shared engine. Within C05, world/fog, labor/training, then progression/skills are separate sequential deliveries.
`reference/` is read-only for everyone. A needed JS hotfix is a separate C00-authorized workstream with exactly one named writer.

## Branch, PR and integration policy

Each agent retains its existing `sm/c0N-r2-<topic>` branch and isolated worktree. Inspect HEAD and local changes before bringing in the C00-pinned intake.
Preserve divergent work; report it rather than resetting or recreating another session's branch.
Pull requests target `campaign/unity-r2`, not `main`. No force pushes, rebases over others' published evidence, or automatic merging.
C01 assembles accepted exact SHAs on an integration candidate; C02 verifies that exact composition; C00 accepts or requests repair.
Preserve history and failed evidence. A later main merge/release is a separate decision, not implied by agent activation.

## Gates

Verified source publication and exact intake activation → G0 contracts/toolchain/oracle → G1 playable default-rules slice → G2 full selected baseline parity → G3 approved gameplay deltas → G4 platform release candidate.
Detailed deliverables and evidence are in `ACCEPTANCE.md`. Preparing future designs/tests is allowed; claiming them complete or bypassing gates is not.
