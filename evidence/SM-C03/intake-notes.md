# SM-C03 G0 intake: preserved failures

Session `01a191e1-3413-7c52-927d-715ec7c628fb`; exact intake
`83a0baa8a4486562c5c67144324cede402f29cf7`; activation
https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543631079.
The existing clean role branch fast-forwarded from `7c0b113807b154902de284c6650c61d9e047a583`.
The first receipt was posted before any contract candidate work:
https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543754802.

1. `python tools/verify_baseline.py --test --starter --log-dir evidence/SM-C03/intake-20261031-6543631079`
   returned 1 before any child command. System `core.autocrlf=true` converted LF blobs to CRLF;
   sampled `git ls-files --eol` entries show `i/lf w/crlf` without attributes.
   The wrapper's `receipt.json` records a clean working tree at execution start.
2. The first disposable `git archive` attempt also returned 1 before child commands.
   Contrary to the initial export assumption recorded in that run's metadata, Git archive
   also honors newline configuration. Its exported engine hash was the CRLF checkout hash.
   Keep this failed attempt; do not call it a canonical-byte verification pass.
3. An export with **per-command** `git -c core.autocrlf=false -c core.eol=lf archive --format=tar INTAKE`
   preserves the pinned bytes without changing Git configuration or the role worktree.
   The unmodified verifier confirmed all 29 included reference and 10 starter files.
   Engine/app/original HTML match their published SHA-256 identities.
   All ten child commands exited 0: syntax checks, 173 focused checks, 8,412 randomized
   actions and the original viewer fixture check. The overall wrapper nevertheless returned 1:
   Windows text-mode writing made the rebuilt HTML 152,378 bytes instead of 150,856.
   The original bundler uses `Path.write_text` without a newline policy.

The `canonical-lf-intake-.../receipt.json` is an overall **FAIL**, not a baseline pass.
The wrapper's static author label names C00; these are C03 executions, not C00 or C02 acceptance.
The exported disposable directory has no `.git`, so its wrapper `git_context` is null;
the companion `git-export-receipt.json` records the exact export pin and command.

`probe_windows_bundle.py` runs only the original bundler on exact Git blobs in a disposable
directory. Its separately labeled diagnostic tests whether replacing generated CRLF with LF
recovers the original HTML. This does not alter the immutable reference or waive the wrapper's check.

C01 owns the shared checkout/build configuration remedy; C00 retains acceptance authority.
C03 can trace the independently hash-verified Git source and prepare its authorized G0 proposal.
No production implementation, contract freeze, JS hotfix, importer trigger, Unity compilation,
browser result, platform result or BUG-001 closure is claimed.
