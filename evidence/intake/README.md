# Source-publication recovery evidence

Owner: **SM-C00 / 000-S2**, 2026-10-31. This directory records recovery of the
original game and viewer into Git, not a gameplay change or C# parity acceptance.

## Inputs and recovered bytes

`docs/PROVENANCE.json` records exact input-archive identities and every included
or intentionally omitted path. Verification before extraction/omission passed
32 handoff-bundle manifest entries, all 33 original JS manifest entries, and
all nine Unity starter manifest entries. ZIP CRC checks passed. The clean tree
contains 29 byte-exact JS files and ten byte-exact Unity files. Five generated
test screenshots remain in the original archive and their hashes are recorded.
The historical Work, Baby, Work! concept image is retained separately.

The partial `.import/part-*.b64` stream was not used, validated or executed.
Its staging files and importer were removed only after recovery from the original
archives succeeded. Their previous commits remain in Git history.

## S2 checks actually executed

Command from the repository root:

```sh
python tools/verify_baseline.py --test --starter --log-dir evidence/intake/c00-source-recovery
```

`c00-source-recovery/receipt.json` and ten adjacent command logs report the exact
environment, command exits and identities. This first recovery receipt was made
on the prepared worktree before the import commit; its recorded HEAD is the old
staging parent and `worktree_clean_at_start` is false. It must not be described as
a test of the old staging tree. The source is pinned by the recorded file hashes.
The C00 publication mailbox receipt identifies the final committed clean-checkout
verification and source intake SHA.

- 173 focused Node checks passed: 41 organization + 23 regression + 54 workers
  + 55 skills.
- 8,412 randomized actions passed across 60 seeded maps: 5,495 ordinary/staged
  smoke actions and 2,917 staged-skill actions. Some maps grant levels directly;
  these are not all ordinary-progression playthroughs.
- Standalone HTML rebuilt byte-identically to SHA-256
  `f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297`.
- Original v0.5.8 Unity fixture/schema checks passed. This validates viewer data
  only. The Editor and platform builds were **NOT RUN**.
- Browser checks were **NOT RUN** in this S2 environment, which has no Python
  Playwright/Chromium installation. The original browser scripts remain unchanged
  and support `CHROMIUM_PATH`; C02 should run them in its available environment
  using `--test --browser`. A requested browser failure is a failed command.

The wrapper runs test/build commands in a disposable copy and rechecks the
immutable reference afterward. Use `--starter` only when checking the original
viewer intake; later authorized Unity implementation may change that live tree.

## Evidence that belongs to S1

`../SM-C00/s1-handoff/` preserves S1's separate source-integrity receipt, full
rerun logs (including 132 Chromium checks) and nine staged sacrifice controls.
Original release evidence is also retained inside `reference/js-v0.5.10/`.
These are inherited results, not S2 or future C02 executions.

BUG-001 remains **OPEN / UNREPRODUCED**. No test here establishes human balance,
fun, resolved King/facility delta semantics, C# gameplay parity or platform support.

## Exact clean-checkout follow-up

The published source candidate `3e478dbcd918a198747910a692823e4cb4b83b82`
was fetched into a new detached worktree. `git status --porcelain` was empty
before and after verification. The same ten commands ran successfully using
`--test --starter`; standalone bytes and all source hashes matched.

`c00-clean-checkout/receipt.json` and its adjacent logs preserve this exact run.
Its receipt records `worktree_clean_at_start: true` and the tested source SHA.
The follow-up publication adds only these receipts, this evidence note and the
status update (including C03's actual launch-base receipt); game, viewer and
verification-tool bytes are identical to the tested source candidate.
