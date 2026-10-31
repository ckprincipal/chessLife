# Stale-Mate — Unity migration, Campaign R2

**Start here. One campaign; one commander; one mailbox.**

- **Commander:** ChatGPT **SM-C00 / 000-S1**. The user remains the final design authority.
- **Working branch:** `campaign/unity-r2`. Existing `main` and `baseline/v04-golden` are unchanged.
- **All coordination:** [GitHub mailbox #1](https://github.com/ckprincipal/chessLife/issues/1). Read the latest `SM-UNITY-R2` command before work.
- **Authoritative playable baseline:** [`reference/js-v0.5.10/`](reference/js-v0.5.10/).
- **Unity project:** [`unity/`](unity/) — currently a starter/viewer, NOT a completed port.

## Deploy the six agents

Give each agent only its row's prompt. No ZIPs, R1 attachments or extra patches are needed.
All six can read and post READY now; production implementation is gated by the commander.

| Agent | Role | Copy this prompt | First authorized work |
|---|---|---|---|
| SM-C01 | Integration and build contracts | [SM-C01](docs/agents/SM-C01.md) | Environment, integration plan, contracts/CI wiring |
| SM-C02 | Independent oracle and QA | [SM-C02](docs/agents/SM-C02.md) | Baseline verification, replay oracle, sacrifice defect triage |
| SM-C03 | C# state, RNG and saves | [SM-C03](docs/agents/SM-C03.md) | Pure-C# data/action/observation contracts and serialization design |
| SM-C04 | Tactics, commands and AI | [SM-C04](docs/agents/SM-C04.md) | Read baseline; propose tactical contract/tests; await G0 for implementation |
| SM-C05 | World, fog, labor, progression | [SM-C05](docs/agents/SM-C05.md) | Decompose world/progression; propose hooks/tests; await G0 |
| SM-C06 | Unity presentation and builds | [SM-C06](docs/agents/SM-C06.md) | Import/compile viewer, environment receipt, presentation contract; await G0 to bind gameplay |

**Read next:** [Command center](docs/COMMAND_CENTER.md) → [Rules/change ledger](docs/RULES_AND_CHANGES.md) → [Acceptance gates](docs/ACCEPTANCE.md).

## Play the preserved browser game

Open [`reference/js-v0.5.10/Stale-Mate_v0.5.10_Play.html`](reference/js-v0.5.10/Stale-Mate_v0.5.10_Play.html)
locally in Chrome. It is the complete v0.5.10 game, NOT the new Unity game and NOT the requested rule amendments.

```sh
git clone https://github.com/ckprincipal/chessLife.git
cd chessLife
git switch campaign/unity-r2
python tools/verify_baseline.py --test
# Full real-browser reference rerun requires Playwright + Chromium:
python reference/js-v0.5.10/tools/run_release_tests.py
```

The clean source import preserves all executable/source/test/fixture/text bytes and the playable HTML.
Five generated reference test screenshots are deliberately not source-controlled here; original hashes are recorded
in [provenance](docs/PROVENANCE.json), and tests regenerate them. The original mode-concept screenshot IS preserved.
Use `tools/verify_baseline.py`, not the historical release screenshot manifest, for intake verification.

## Current truth

Baseline: Traditional K1 Q1 R2 N2 B2 P2; Middle K1 N2 P6; Flatten K1 P9; no starting camp by default;
no independent engineer; pawn skills implemented, full other-piece skill trees incomplete.
The two-worker Traditional bottleneck is **intentional corporate inefficiency**, not a defect to auto-balance away.

Pending, separately versioned work: reproduce sacrifice-button malfunction; free King move once/turn;
capture/burn enemy facilities; clearer shrine/action feedback. Approved intent and unresolved details are
explicitly separated in the change ledger. No such change has been smuggled into the frozen baseline.

This import does not itself run six Codex sessions. User launches them with their prompts; they communicate
through mailbox #1. SM-C00 reviews and replies during active commander sessions, not through assumed background monitoring.
