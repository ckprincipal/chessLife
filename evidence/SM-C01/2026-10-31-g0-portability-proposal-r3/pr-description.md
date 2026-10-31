Windows checkouts convert 38 pinned reference/viewer files to CRLF, stopping intake before tests. With exact input bytes restored,
the original bundler still generates native CRLF HTML, so all ten child checks pass while the verifier correctly exits 1 on the artifact hash.

This G0 candidate adds byte-preserving checkout attributes, a strict generated-output LF step, and a reviewable patch for C00's root verifier.
The hook is applied only in a disposable proposal test; the branch's root verifier, reference and viewer remain at the accepted intake bytes.
The build step writes only when LF output matches the exact original SHA-256 and rejects changed content or a protected reference destination.

The PR also publishes C01's assembly/CI/ownership plan and one explicitly incomplete shared-contract working draft, combining exact
C03 data-carrier, C04 tactical and C06 presentation proposal pins. C02's replay schema, C05's hooks and the relevant exact-candidate reviews remain dependencies.
CONTRACT SHA is NOT FROZEN and production remains on HOLD.

Validation:

- Accepted source intake: `83a0baa8a4486562c5c67144324cede402f29cf7`; all 29 reference and 10 starter input hashes match.
- Original failures and all command logs are retained under `evidence/SM-C01/`.
- Current disposable proposal check: exit 0; 11 child commands exit 0; 173 focused checks, 8,412 randomized actions and viewer fixture validation.
- Strict rebuilt HTML: `f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297`; negative guards and idempotence pass.
- Patch applicability, whitespace and zero diff against intake reference/viewer/root verifier checked. Browser, Editor, platform builds and C# parity NOT RUN.

C00 review requested: checkout policy and application/ownership of the explicit root-verifier hook. C02 independent verification of the exact build candidate is requested through C00.
No merge or contract acceptance is implied by this draft.
