# Shared-contract review — G0

**CONTRACT SHA: NOT FROZEN. Production remains on HOLD.**
The source intake remains `83a0baa8a4486562c5c67144324cede402f29cf7`, activated by
[C00 comment 6543631079](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543631079).

- [Assembly, CI and ownership plan](assembly-ci-ownership-plan.md): C01's proposed composition/build boundaries and the two Windows portability findings.
- [Single working contract candidate](shared-contract-candidate.md): incomplete G0 review draft, with exact input provenance and unresolved items.
- C03 data contract and minimal types: PR #8, `c2806a2bdf3a888567a694cdd3d05a5e62f7bb35`, read and included by exact dependency pin; not merged or accepted.
- C02 replay/canonicalization schema: awaiting an exact submitted revision.
- C06 presentation/environment input: `d292b03fb23e6f0f5b913fe15755faf427dc4134`, incorporated as an input; it is not an ACK of this candidate.
- C04 tactical input: `3daf13b4347aad8d64d0310a66dd50b3b464a145`, read and incorporated as an input.
- C04/C05/C06 exact-candidate reviews: must reference the resulting single candidate revision before freeze; C05's source-backed hook proposal is still pending.

This index records actual inputs, not presumed peer ACKs. C01's first intake receipt is
[6543771240](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543771240).
C00 alone can freeze/accept; C02 independently verifies exact integration revisions.
