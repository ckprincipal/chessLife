# R1.1 — Additional scoped assignments by existing Codex workstream

| Workstream | Priority | Additional deliverable | Acceptance owner |
|---|---|---|---|
| **SM-C01** Integration | P0 | Append this delta to frozen contract, track exact source vs new rule versions, triage bug before claiming Unity parity, require user decision on burn/capture balance and old-save policy | User/coordinator |
| **SM-C02** Oracle QA | **P0** | Reproduce user sacrifice symptom from normal UI and real save (or mark *unreproduced*); add deterministic test and positive controls, inspect queue/CP/exit; independent v0.5.10/next-version trace comparison | C01 |
| **SM-C03** C# State | P1 | Versioned `FacilityAction`/ownership/damage/queue state, King move-cost action distinction and saved `KingMovedThisTurn` if separate activation is later chosen; preserve legacy saves/oracle | C01 & C02 |
| **SM-C04** Tactics | P1 | Free King `move` 0 CP once, command remains priced; tactical facility occupancy/hold/capture/burn validations; keep move/attack legality and King win | C02 |
| **SM-C05** World/progression | P0 QA, P1 feature | Inspect Pawn-sacrifice queue/exit failure including 2-turn ticking; facility capture/burn changes to terrain, structures, sight, worker jobs, training and AI state, both sides | C02 |
| **SM-C06** Unity UI | P0 QA, P1 feature | Honest confirmation and queue feedback; distinguish waiting vs blocked from no-op; King 0 CP movement at CP=0; facility actions/ownership/burn status; shrine/selection/minimap distinction | C02 |

**Dependency rule:** C01/02/03 finish authoritative baseline and stable model contracts first. User-reported sacrifice defect is tracked now but must be reproduced before 'fixed' is reported. Free King movement + facility rules are **post-baseline rules**, and must never be retroactively represented as original v0.5.10 behavior.

**Receipts:** exact SHA/branch/PR, commands/test logs, (un)reproduced status, before-and-after state diff, UI screenshots, Unity compilation status, independent parity results, and remaining limitations. Do not write to `main` or public source until the owner authorizes import.
