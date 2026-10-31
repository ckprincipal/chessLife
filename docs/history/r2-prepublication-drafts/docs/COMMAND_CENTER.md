# Command center — SM-UNITY-R2

## Authority and scope

**SM-C00 = this ChatGPT coordinator / 000-S1, centralized commander.** The user owns game design and overrides all decisions.
C00 assigns scope, resolves cross-module decisions, freezes contracts, opens gates and accepts/rejects exact deliveries.
**SM-C01 is integration engineer, not a second commander.** C01 may prepare an integration candidate, but may not self-approve,
reassign other agents, change mechanics, merge to `main`, or advance a phase without an explicit C00 receipt.
C02 is the independent verifier and must not author the candidate it independently accepts.

This campaign consolidates the complete v0.5.10 rules reference, Unity starter and R1/R1.1 requests.
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

## Initial activation matrix

| Agent | Status on user deployment | Allowed immediately | Not yet authorized |
|---|---|---|---|
| C01 | READY requested / G0 | Validate checkout, toolchain inventory, contract index, integration and CI plan | Merge, change rules, invent a new commander |
| C02 | READY requested / G0 | Rerun reference, build oracle/replay fixtures, reproduce sacrifice defect | Rewrite runtime, silently update goldens |
| C03 | READY requested / G0 | Shared data/action/observation/save/RNG proposal and minimal types | Unilateral schema freeze or rule implementations |
| C04 | READY requested / G0 review | Trace tactics functions, acceptance scenarios, contract review | Production tactics implementation before C00 G0 acceptance |
| C05 | READY requested / G0 review | World/progression decomposition and interface review | Concurrent monolithic port or gameplay amendments |
| C06 | READY requested / environment check | Import actual Unity project; compile viewer; capture Editor version/errors; presentation contract | Pretend viewer is gameplay parity; edit core rules |

G0 ends only when C00 freezes an exact shared-contract revision after C02's oracle/schema review and all implementers ACK it.
Independent environment checks and defect reproduction may proceed concurrently; no dependency waiting ceremony is necessary.

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

Each agent uses `sm/c0N-r2-<topic>` and an isolated worktree from the pinned campaign intake SHA.
Pull requests target `campaign/unity-r2`, not `main`. No force pushes, rebases over others' published evidence, or automatic merging.
C01 assembles accepted exact SHAs on an integration candidate; C02 verifies that exact composition; C00 accepts or requests repair.
Preserve history and failed evidence. A later main merge/release is a separate decision, not implied by agent activation.

## Gates

G0 contracts/toolchain/oracle → G1 playable default-rules slice → G2 full selected baseline parity → G3 approved gameplay deltas → G4 platform release candidate.
Detailed deliverables and evidence are in `ACCEPTANCE.md`. Preparing future designs/tests is allowed; claiming them complete or bypassing gates is not.
