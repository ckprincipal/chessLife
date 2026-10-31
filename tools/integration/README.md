# C01 integration build proposal

The accepted source intake is `83a0baa8a4486562c5c67144324cede402f29cf7`.
These are G0 build tools and review material, not a runtime implementation or a contract freeze.

`normalize_generated_html.py` accepts a disposable generated artifact and an exact expected SHA-256.
It changes CRLF to LF only when the resulting bytes match that pin, rejects other differences without writing,
and refuses a destination inside this checkout's immutable reference. The original reference bundler and pins stay unchanged.

`windows-verifier-proposal.patch` proposes one explicit, logged build step in the C00 publication verifier.
The original bundler still executes; the strict generated digest check still executes.
The root verifier has not been edited in this branch. C00's review of that hook is requested.

Validate the proposal in a disposable export using a new owned log directory:

```text
python tools/integration/check_portability_proposal.py --log-dir evidence/SM-C01/<unique-proposal-run>
```

This exports the committed candidate, verifies all 39 input bytes, overlays the proposed hook and normalizer,
runs all eleven checks, and verifies rejection of semantic differences/protected reference paths plus idempotence.
It does not turn an earlier failed original-verifier receipt into a pass. A passing proposal run has no Git HEAD inside
the disposable export; `proposal-check.json` records the source HEAD and exact proposed script/patch hashes separately.

The index refresh needed after restoring existing CRLF checkouts was:

```text
git add --renormalize -- reference/js-v0.5.10 unity
```

That command staged no source changes in the evidenced C01 case. Other sessions must preserve their own local work;
do not blindly force a checkout over edits. The restoration audit proved every input was either exact or solely a checkout CRLF conversion before writing pinned blobs.
