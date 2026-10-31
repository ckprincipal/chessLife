# C01 current portability proposal check

Command: `python tools/integration/check_portability_proposal.py --log-dir evidence/SM-C01/2026-10-31-g0-portability-proposal-r3`.
Exit **0**, Windows Python 3.14.8 / Node 24.20.0. The harness explicitly supplies child environment `PYTHONUTF8=1`,
addressing C06's independently reported cp932 fixture-reader failure. This setting is recorded in `proposal-check.json`.

The exact export source is `0fcacf9bae0e9b53764f7c3377cf718016e7fe72`, based on accepted intake
`83a0baa8a4486562c5c67144324cede402f29cf7`. All 39 included file hashes match; the proposed normalizer and root-verifier insertion
are overlaid only in the disposable export and identified by SHA-256. Eleven child commands return 0; strict rebuilt HTML SHA-256
is `f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297`.
Negative controls for changed content/protected paths and idempotence pass. The live original root verifier remains unchanged.

The preserved original working-checkout and native Windows builder runs remain overall failures.
This result validates the proposed pipeline, not the unchanged intake wrapper or C# gameplay.
The proposal has not been independently accepted by C02 or C00. Browser, Unity Editor, Test Runner, platform builds and C# parity are NOT RUN.
CONTRACT SHA NOT FROZEN; production HOLD; BUG-001 OPEN / UNREPRODUCED.
