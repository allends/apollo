# Safety Model

Apollo changes assistant behavior only through reviewable proposals.

## Hard rules

- Keep raw history local by default.
- Redact credential-like keys and values before storage.
- Never silently mutate active instructions or skills.
- Never broaden tool permissions automatically.
- Preserve rationale, evidence, risk level, diff, verification, and rollback notes for proposals.

## Risk levels

- **Low:** wording clarifications, trigger improvements, recovery notes.
- **Medium:** new workflow instructions, changed defaults, new tool policy.
- **High:** permission changes, external side effects, deletion behavior, security/auth handling.

High-risk proposals require explicit human approval outside the background loop.
