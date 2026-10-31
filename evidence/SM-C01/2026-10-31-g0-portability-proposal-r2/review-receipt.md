# C01 G0 portability proposal validation

Intake: `83a0baa8a4486562c5c67144324cede402f29cf7`.
Source export HEAD: `0fcacf9bae0e9b53764f7c3377cf718016e7fe72`.
Contract: **NOT FROZEN**; production **HOLD**.

The original exact-intake failure is preserved in `../2026-10-31-g0-intake/`.
After byte restoration, the original verifier ran all ten child commands successfully but still exited 1 on Windows-generated CRLF HTML;
that distinct failure is preserved in `../2026-10-31-g0-intake-lf/`.
Neither failure has been overwritten or relabeled a pass.

The first proposal harness run is preserved in `../2026-10-31-g0-portability-proposal/`.
Git apply in a non-repository export skipped the target while returning 0; the resulting unchanged verifier still ran only ten commands and failed.
The harness now checks the patch against the real repository, inserts its single hunk explicitly into the disposable file and asserts the hook exists before execution.
No live root verifier was changed by either proposal run.

Executed current proposal:

```text
python tools/integration/check_portability_proposal.py --log-dir evidence/SM-C01/2026-10-31-g0-portability-proposal-r2
```

Exit **0**. Native Windows Git export with the committed `.gitattributes` preserved all 39 original input file hashes.
The disposable patched verifier executed **11** child commands, all exit 0: the ten original checks plus one declared generated-output normalization step.
It retained 173 focused checks, 8,412 randomized actions and original viewer fixture validation.
Generated output recovered the strict original SHA-256 `f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297`.
Negative controls rejected semantic differences without changing their files, rejected an immutable-reference destination, and left canonical LF output unchanged.

`proposal-check.json` records the exact source HEAD, script/patch hashes and resulting proposed verifier hash.
`proposed-wrapper/receipt.json`, eleven command logs and `proposed-wrapper-console.txt` record the proposed execution.
The export has no Git repository, so the wrapper's own Git context is null; the separate export receipt supplies its provenance.
The unmodified root verifier has SHA-256 `a5a6f71d180341f6400580859949ad0610ae47ae3dfdc6fd1791fb2ff3c48454` before and after.

Scope: build proposal and integrity checks only. Browser, C# parity, Unity Editor compilation and platform builds **NOT RUN**.
BUG-001 remains **OPEN / UNREPRODUCED**. C02 verification and C00 acceptance of the exact proposed configuration are pending.
