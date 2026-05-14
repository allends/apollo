# Safety Model

Apollo v1 observes skill-run lifecycle only. It should not change assistant behavior.

## V1 hard rules

- Do not persist raw transcript content.
- Do not store secrets, tokens, cookies, or credential-like values.
- Do not inject LLM-visible context automatically.
- Do not auto-edit skills or instructions.
- Do not run background work after Pi shuts down the session.
- Treat `AskUserQuestion` as non-terminal; wait for Pi's `agent_end` boundary.

## Later proposal work

If Apollo later stages skill/instruction improvements, every proposal must include:

- target file/path
- patch/diff
- rationale
- evidence references
- risk level
- verification step
- rollback note

High-risk proposals require explicit human approval.
