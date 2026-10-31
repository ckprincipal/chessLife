# G0 assembly, CI and ownership plan — C01 candidate

Status: **proposal for review; CONTRACT SHA NOT FROZEN; production HOLD**.
Authority: [C00 activation 6543631079](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543631079).
Accepted intake: `83a0baa8a4486562c5c67144324cede402f29cf7`.
The containing Git revision, identified in C01's delivery receipt, is the plan revision.
It is not a source-intake replacement, contract freeze, module acceptance or merge authorization.

## Ownership and changes

| Owner | Writes and responsibility |
|---|---|
| C00 | Command/change/status/gate records; resolve disagreements; freeze and accept exact revisions |
| C01 | `docs/contracts/`, `tools/integration/`, `.github/`, shared root build/CI settings, Unity Packages/ProjectSettings and shared assembly registry, Runtime composition, `evidence/SM-C01/` |
| C02 | Oracle/replay/triage tools and fixtures, independent parity tests and `evidence/SM-C02/`; does not author the runtime it verifies |
| C03 | `unity/Assets/Scripts/Core/`, SMC03 EditMode tests and `evidence/SM-C03/`; data, numeric/RNG and save semantics |
| C04 | Rules/Tactics and Rules/AI, SMC04 tests and `evidence/SM-C04/`; tactical legality, action budgets, capture and AI |
| C05 | Rules/World and Rules/Progression, SMC05 tests and `evidence/SM-C05/`; world/fog, then work/training, then XP/skills |
| C06 | Presentation, Editor, Scenes, Resources, bootstrap viewer, UI/assets/PlayMode tests, `tools/build/`, `evidence/SM-C06/`; actual Editor and desktop results |

Associated `.meta` files follow their owner. Shared `.asmdef` and package/project settings go through C01 even when placed next to another owner's code.
Request cross-owner changes through C00. The root intake verifier originated in C00's publication work; the proposed generated-output hook is supplied as a reviewable patch rather than silently editing it.
`reference/js-v0.5.10/` is immutable. No game source, original expected hash, old fixture or historical evidence changes are part of this proposal.

## Proposed assembly registry

These names and edges are a review proposal. No new assemblies or production modules have been created.
Language/framework versions, public/internal type visibility and test package pins require C03/C06 review against the actual Editor.

| Proposed assembly | Source owner/path | Allowed dependencies |
|---|---|---|
| `StaleMate.Core` | C03, Scripts/Core | Pure .NET primitives/serialization only; no UnityEngine |
| `StaleMate.Rules.Tactics` | C04, Scripts/Rules/Tactics | Core; explicit world/progression interfaces supplied through the reviewed core contract |
| `StaleMate.Rules.World` | C05, Scripts/Rules/World | Core; no presentation or tactics implementation dependency |
| `StaleMate.Rules.Progression` | C05, Scripts/Rules/Progression | Core; world/tactical effects cross explicit hooks composed in Runtime |
| `StaleMate.Rules.AI` | C04, Scripts/Rules/AI | Core and reviewed query interfaces; its proposal must account for RNG consumption |
| `StaleMate.Runtime` | C01, Scripts/Runtime | Core plus the accepted rule modules; sole composed game facade |
| `StaleMate.Presentation` | C06, Scripts/Presentation | Runtime's observer/action facade and public contract DTOs; Unity presentation APIs |
| `StaleMate.Editor` | C06, Assets/Editor | Presentation and UnityEditor; Editor-only |
| `StaleMate.Tests.EditMode.SMC03/04/05` | Respective owners | Their pure modules and test framework; Editor/test-only |
| `StaleMate.Tests.Parity` | C02 | Runtime and public contracts; independent test-only assembly |
| `StaleMate.Tests.PlayMode` | C06 | Presentation/Runtime and test framework; test-only |

Set `noEngineReferences` on the pure rule/core/runtime assemblies after confirming the final registry and target Editor.
Use assembly boundaries and the reviewed facade to prevent presentation from writing authority or receiving raw hidden state.
Do not create World→Tactics→World cycles or multiple turn loops. Hook signatures and state access belong in C03's reviewed proposal;
this plan does not invent their final C# names or visibility.

The starter currently has only IMGUI/JSON module dependencies, no shared assembly registry and no Unity Test Framework pin.
Its `openings_v058.json` and fixture validator intentionally contain historical 8/7/6 openings.
Keep that intake check distinct from new-game v0.5.10 parity (10/9/10), rather than rewriting the historical fixture to make it look current.

## Composition and order to preserve

Runtime dispatches one authoritative action flow. C04 supplies tactical checks/intents, C05 supplies world/queue/progression effects,
and C03 supplies the exact state/numeric/save contract. Presentation submits requests and consumes observer-filtered results.
The exact operation order must come from the source and peer review, not a generic validate-then-commit abstraction.

Source anchors at the intake:

- `engine.js:1034–1045`: end-turn ticks builders, ticks training, clears outgoing bonuses, changes side/serial/round, recomputes CP,
  applies incoming shrine bookkeeping/temporary-state expiry/queen fatigue, refreshes sight, then logs the new phase.
- `engine.js:1046–1080`: action dispatch has special paths for end/skill choices/milestones/build before the general project/activation/CP guard.
  `lastEvent` is cleared before several rejected actions. A rejected action cannot be assumed to leave every state field unchanged.
- `engine.js:1085–1140`: AI selection participates in authoritative RNG consumption. It must not be exposed as a harmless UI polling query.
- `engine.js:1148–1213`: dump/load, source migrations and post-load sight refresh define save behavior; new-game defaults do not replace old armies/camps.
- `engine.js:716–739`: observer filtering and remembered terrain differ from true authority. UI errors, previews, events and replay traces must respect that split.

These are integration constraints for review, not a production implementation or a new gameplay policy.
CR-001 activation/capture questions and CR-002 eligibility/cost/occupation/queue questions remain explicit post-baseline decisions.

## Proposed dependency sequence after C00's freeze and named gate

1. C03's accepted minimal contracts, numeric/RNG behavior, cloning and save envelope; C02's pinned replay/canonicalization schema.
2. C05 world/fog and C04 ordinary tactics/turn/capture interfaces for the named G1 slice, against the same seeds and traces.
3. C01 composes accepted exact module SHAs in Runtime; C06 binds real interactions to that facade and reports an actual Editor result.
4. C02 independently verifies the exact assembled revision, including per-action authority and observations; C00 accepts or requests revision.
5. Later named scopes add C05 labor/training and XP/skills sequentially, then the remaining selected baseline behavior and approved deltas.

This is a proposed build dependency order under the existing C00 assignments, not a reassignment or authorization to begin production now.
PRs target `campaign/unity-r2`. An integration receipt records exact intake, contract, dependency and HEAD SHAs. No automatic main/golden updates or historical PR merges.

## CI commands and current execution limits

Baseline command, retaining the original verifier and strict pins:

```text
python tools/verify_baseline.py --test --starter --log-dir evidence/SM-C01/<unique-ci-run>
```

Optional browser lane, when Python Playwright and a usable browser are actually present:

```text
python tools/verify_baseline.py --test --browser --log-dir evidence/SM-C01/<unique-browser-run>
```

Run from the candidate repository root. Each job must record OS, Python/Node versions, HEAD, dirty status, exact command, child exit codes and logs;
upload artifacts even on failure. Give CI read-only repository permission; do not push source, update expected results or publish a release from these jobs.
Set process/job environment `PYTHONUTF8=1`: C06 independently observed the unchanged viewer validator failing under cp932 and passing in UTF-8 mode.
This is an explicit environment setting; it does not address the separate native-newline behavior of the bundler.
The proposed required matrix is native Windows plus Linux for mechanical/reference checks. Browser and Unity are separate named lanes;
neither missing execution nor a viewer fixture pass substitutes for an Editor compile or platform build.
Do not add a required Windows green check by ignoring the known overall verifier failure.

Current C01 execution:

| Run | Exact result |
|---|---|
| Exact intake, original Windows checkout | Overall exit 1 before tests: system `core.autocrlf=true` changed 38 working files; all 39 Git blobs match provenance |
| C01 byte-preserving checkout candidate | 29 reference and 10 starter hashes pass; all ten child commands exit 0; 173 focused checks and 8,412 randomized actions; overall exit 1 on generated HTML CRLF bytes |
| C00 source/clean-checkout receipts | Inherited evidence at the accepted intake; not C01's execution or C02's independent acceptance |
| Browser / C# parity / Editor / platform builds | NOT RUN by C01 |

`.gitattributes` disables text conversion for the immutable reference and keeps Unity text LF while detecting binary assets.
Existing CRLF working files were restored only after verifying every file against the exact pinned blob or its sole CRLF checkout conversion.
No committed reference/viewer file changed. Refreshing the index with `git add --renormalize -- reference/js-v0.5.10 unity`
staged no source differences; the failed receipt and restoration audit remain preserved.

The original Python bundler uses native `Path.write_text` newlines. On Windows its output is 152,378 bytes,
SHA-256 `f63998403057a8bd8ab4e70969d41fc26f0204de76ad381e0a0c37a93974bdf8`.
The original 150,856-byte LF artifact pin remains `f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297`.
The proposed extra build step in `tools/integration/normalize_generated_html.py` only writes disposable generated HTML if LF conversion
produces that exact supplied original pin. It rejects semantic differences and refuses to write into the immutable reference.
`tools/integration/windows-verifier-proposal.patch` adds that declared, logged step after the unmodified bundler and before the unchanged strict digest check.
C00 review/application of the root-verifier hook is pending; the original overall FAIL remains a FAIL.

No pure-C# project or actual Editor executable currently exists for a C01 build command.
Observed SDKs 3.1.426/5.0.408 are inventory, not a selected Unity-compatible target. C06's Editor/build receipt and C03's target proposal
must precede concrete C# and Unity test jobs. No platform readiness is claimed.

## Reviews and next decisions

C03's state/action/observation/outcome/RNG/save proposal and C02's exact replay schema are required inputs to the single shared-contract candidate.
C04 reviews legality/ordering/AI, C05 reviews observation/work/queues/progression, and C06 reviews presentation/feedback/Editor constraints.
Each review must name the candidate SHA, accepted/rejected interfaces, exact evidence and unresolved items. A greeting or a diagnosis is not a contract review.

Current known peer evidence includes C03's [Windows diagnosis](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543805331)
at `6e9f7e75c0283a2551c82cb16cb66d39bba8e047`; it is not a submitted data contract.
C06's [presentation/environment input](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543856113)
at `d292b03fb23e6f0f5b913fe15755faf427dc4134` was read at that exact revision and is incorporated into the working candidate.
It proposes observer-safe action/queue descriptors, stale-confirmation handling and cache clearing at handover. Its Editor compilation remains blocked.
The combined candidate cannot honestly be marked reviewed/freeze-ready until the actual proposal and all relevant reviews are available.
C01 publishes that candidate revision; C00 alone freezes it, collects implementer ACKs and opens a named scope. C01 never accepts its own assembly.
