# SM-C01 G0 intake receipt

- Role: integration engineer and build/contracts owner; C00 remains commander.
- Persisted session: `01a191e1-33b1-71c2-8619-f68521e5b025` (existing session retained).
- ACK OF: https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543631079
- Decision: `STLM-C00-S2-G0-INTAKE-2026-10-31-01`.
- Accepted intake and HEAD at verification: `83a0baa8a4486562c5c67144324cede402f29cf7`.
- Branch/worktree: `sm/c01-r2-integration`, `D:/projects/Stale-Mate/worktrees/SM-C01`.
- CONTRACT SHA: **NOT FROZEN**. Production implementation remains on HOLD.
- Result: **BLOCKED for working-copy byte verification; G0 preparation can continue**.

## Incorporation and input checks

The role branch was clean at launch HEAD `7c0b113807b154902de284c6650c61d9e047a583`.
`git fetch origin campaign/unity-r2` exited 0. The launch HEAD was an ancestor of
the authorized intake; `git merge --ff-only 83a0baa8a4486562c5c67144324cede402f29cf7`
exited 0. No reset, replacement worktree/session, or discarded changes were used.
The branch was clean at the beginning of verification. New files are confined to
this role's evidence directory. The required guides, reference and Unity starter
are present. AGENTS.md and the five other required role-intake documents were read
at the exact intake, together with the live activation/mailbox.

## Executed verification

Command (process-only Git trust and UTF-8 settings were supplied):

```text
python tools/verify_baseline.py --test --starter --log-dir evidence/SM-C01/2026-10-31-g0-intake
```

Exit **1**, before any child test command. The first error is
`Baseline mismatch: reference\js-v0.5.10\CURRENT_HANDOFF.md`.
The unmodified wrapper's receipt is `receipt.json`; its static verifier label names
the C00 wrapper author, while this execution and diagnosis were performed by C01.

Read-only diagnosis exited 0: all **39** included reference/starter Git blobs at
the intake match provenance; **38** working files differ solely by LF-to-CRLF
checkout conversion. `git config --show-origin --get core.autocrlf` reports
`true` from `C:/Program Files/Git/etc/gitconfig`. `git ls-files --eol` reports
`i/lf w/crlf` for sampled reference and starter text. Full hashes, sizes and paths
are in `line-ending-diagnosis.json`. This is a checkout-byte blocker, not evidence
that the accepted committed source is corrupt. Reference content was not edited.

## Environment and limits

Version/inventory commands each exited 0: Node 24.20.0, npm 12.2.1,
Python 3.14.8, uv 0.12.23; .NET SDKs 3.1.426 and 5.0.408.
Unity/Unity Hub were not found on PATH or in the standard Windows locations checked.
The starter input pins Editor 6000.3.0f1; no installed Editor or compatibility is claimed.
GitHub CLI is absent; the mailbox can be accessed through the REST API.
Browser reruns, Unity Editor compilation, platform builds and C# parity: **NOT RUN**.
No Node mechanical checks ran because the integrity precondition failed.
BUG-001 remains OPEN / UNREPRODUCED.

## Next owned G0 output

C01 will prepare an evidenced byte-preserving checkout/build configuration remedy
within its allowed configuration lane, preserve this failed run, and rerun into a
new directory. Then publish one assembly/CI/ownership plan and one contract
candidate combining C03's data semantics with C02's replay schema and C04/C05/C06
interface reviews. C00 alone can freeze a revision and open the next named scope;
C02 independently verifies an exact integration candidate.
