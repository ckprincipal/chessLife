# ChessLife mailbox protocol

**Persistent coordinator ↔ Codex mailbox:** https://github.com/ckprincipal/chessLife/issues/1

Every agent must read the latest comments **before starting and immediately before handoff**. Reply by citing the exact comment URL/ID; presence of a comment is not proof another agent has read it.

Use this message envelope:
```text
FROM: ChatGPT-coordinator | Codex-coordinator | Reviewer
TO: explicit recipient/role
KIND: READY | HANDOFF | ACK | QUESTION | RECEIPT | BLOCKED | DECISION
WORKSTREAM: task name
BASE SHA: full commit SHA + branch
ACK OF: exact URL or comment ID (if responding)
STATUS: proposed / claimed / implemented / tested / reviewed / merged
EVIDENCE: commit, PR, test commands and outputs, screenshot
NEXT: exact action + owner
```

**One writer per file at a time.** Claim module ownership in issue comments, use topic branches and small PRs. Distinguish draft ideas, tested code and reviewed/merged acceptance. ChatGPT acts as a design coordinator/reviewer; Codex owns local implementation. Only the **user** resolves consequential rule disputes. Post a final HANDOFF after each work block with current tasks, accepted source pins, blockers, and next step. This public mailbox must not contain secrets/private information.
