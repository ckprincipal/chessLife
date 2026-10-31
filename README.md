# Stale-Mate — Unity migration, Campaign R2

**One campaign; one commander; one mailbox.**

- **Commander:** ChatGPT **SM-C00 / 000-S2**. The user remains the final design authority.
- **First deputy:** **codex-maya**, responsible for local session delivery and receipt collection under C00 decisions.
- **Working branch:** `campaign/unity-r2`. Preserve historical `main` and `baseline/v04-golden`.
- **All coordination:** [GitHub mailbox #1](https://github.com/ckprincipal/chessLife/issues/1). Read the latest applicable `SM-UNITY-R2` command before work.
- **Authoritative playable baseline:** [`reference/js-v0.5.10/`](reference/js-v0.5.10/).
- **Unity project:** [`unity/`](unity/) — the recovered v0.5.8-era starter/viewer; gameplay parity and Editor/build acceptance remain pending.

## Publication and session status

This source-publication candidate recovers the exact v0.5.10 reference and Unity starter from the original verified archives.
The original partial staging checkout `7c0b113807b154902de284c6650c61d9e047a583` is the launch base, **not a completed intake or contract pin**.
Use the exact completed-intake SHA in a later C00 mailbox activation; a source commit alone does not freeze contracts or open production work.

The user-relayed codex-maya report, verified at 2026-10-31 12:15 UTC, records **all six local sessions launched**.
Their individual mailbox ACKs must be recorded separately. Retain those sessions, branches and worktrees.
The [current preparation/HOLD decision](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543518615)
authorizes bounded preparation while C00 owns publication recovery. Read later mailbox decisions for any change.
The [S2 takeover receipt](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543304373) preserves the S1 handoff.

## Continue the six existing agents

Relay each agent's updated prompt to its existing session. Do not create duplicate agents or discard local work.
The source-dependent assignments below begin only with C00's exact-SHA intake activation; production implementation follows the reviewed contract freeze and named next scope.

| Agent | Role | Prompt | Intake work after C00 activation |
|---|---|---|---|
| SM-C01 | Integration and build contracts | [SM-C01](docs/agents/SM-C01.md) | Verify checkout/toolchains; prepare integration, assembly and CI plan; publish contract candidate |
| SM-C02 | Independent oracle and QA | [SM-C02](docs/agents/SM-C02.md) | Verify baseline; prepare replay oracle; reproduce the sacrifice defect by ordinary play |
| SM-C03 | C# state, RNG and saves | [SM-C03](docs/agents/SM-C03.md) | Propose data/action/observation/RNG/save contracts |
| SM-C04 | Tactics, commands and AI | [SM-C04](docs/agents/SM-C04.md) | Trace baseline; propose tactical interfaces and scenarios |
| SM-C05 | World, fog, labor, progression | [SM-C05](docs/agents/SM-C05.md) | Propose staged world/fog → labor/training → XP/skills work and hooks |
| SM-C06 | Unity presentation and builds | [SM-C06](docs/agents/SM-C06.md) | Import/compile the actual viewer or report the blocker; propose presentation adapter |

**Read next:** [Command center](docs/COMMAND_CENTER.md) → [Rules/change ledger](docs/RULES_AND_CHANGES.md) → [Acceptance gates](docs/ACCEPTANCE.md).

## Play and verify the preserved browser game

Open [`reference/js-v0.5.10/Stale-Mate_v0.5.10_Play.html`](reference/js-v0.5.10/Stale-Mate_v0.5.10_Play.html)
locally in Chrome. It is the v0.5.10 browser game; the requested post-baseline changes remain separate.

From the repository root at the C00-pinned intake:

```sh
# Initial intake: immutable JS hashes, Node suites, standalone rebuild,
# original starter hashes and fixture/schema validation in disposable copies.
python tools/verify_baseline.py --test --starter

# Optional real-browser reference rerun; requires Python Playwright and
# CHROMIUM_PATH or an installed Playwright browser. Record missing dependencies as NOT RUN.
python tools/verify_baseline.py --test --browser
```

For a new receipt, add `--log-dir evidence/SM-C0N/<unique-run>` using your actual role and a new run directory.
Preserve existing C00 and other agents' receipts; do not overwrite `evidence/intake/c00-source-recovery`.

`--starter` checks the recovered original viewer at intake; it does not freeze later authorized Unity development and does not compile the Editor.
`reference/` remains immutable. Run tests through the wrapper so generated results stay out of the reference tree.
The original full manifest was checked before omitting five generated browser screenshots. Their hashes remain in
[provenance](docs/PROVENANCE.json); the original concept image is preserved separately. Use `tools/verify_baseline.py`
for this clean subset, rather than the original screenshot-inclusive manifest.

Current-run evidence belongs in [`evidence/intake/`](evidence/intake/). S1's historical reruns remain under
[`evidence/SM-C00/s1-handoff/`](evidence/SM-C00/s1-handoff/); their counts are not new S2 or C02 results.
The uncorrected R2 drafts are preserved under [`docs/history/r2-prepublication-drafts/`](docs/history/r2-prepublication-drafts/) for provenance.

## Gameplay continuity

Baseline: Traditional K1 Q1 R2 N2 B2 P2; Middle K1 N2 P6; Flatten K1 P9; no starting camp by default;
no independent engineer; pawn skills implemented, full other-piece skill trees incomplete.
The two-worker Traditional bottleneck is **intentional corporate inefficiency**.

Pending, separately versioned work: reproduce the sacrifice-button failure; free King movement once per friendly turn;
capture/burn enemy facilities; clearer shrine/action feedback. The change ledger separates approved directions from unresolved semantics.
BUG-001 remains **OPEN / UNREPRODUCED** until supported by an actual diagnosis.

C00 reviews the mailbox during active commander sessions. The deputy's launch report and these documents establish no background monitoring.
