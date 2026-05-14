import type { ApolloRuntime } from "../apollo.js";

export interface PiToolCall {
  input?: Record<string, unknown>;
}

export interface PiToolDefinition {
  name: string;
  description: string;
  execute(call: PiToolCall): Promise<unknown>;
}

export interface PiToolExtension {
  name: string;
  tools: PiToolDefinition[];
}

export function APOLLO_EXTENSION(apollo: ApolloRuntime): PiToolExtension {
  return {
    name: "apollo",
    tools: [
      {
        name: "apollo_search_sessions",
        description: "Search Apollo's local session summaries and sanitized events.",
        async execute({ input }) {
          return apollo.store.searchSessions(String(input?.query ?? ""), Number(input?.limit ?? 10));
        },
      },
      {
        name: "apollo_get_session",
        description: "Retrieve a bounded sanitized session record by id.",
        async execute({ input }) {
          return apollo.store.getSession(String(input?.sessionId ?? ""));
        },
      },
      {
        name: "apollo_record_outcome",
        description: "Record whether a task succeeded, failed, or needs follow-up.",
        async execute({ input }) {
          await apollo.recordSessionEvent({
            type: "task.outcome_recorded",
            sessionId: String(input?.sessionId ?? "unknown"),
            payload: input ?? {},
          });
          return { ok: true };
        },
      },
      {
        name: "apollo_list_proposals",
        description: "List staged instruction/skill update proposals.",
        async execute() {
          return apollo.store.listProposals();
        },
      },
      {
        name: "apollo_propose_instruction_update",
        description: "Stage a reviewable instruction or skill update proposal with evidence.",
        async execute({ input }) {
          return apollo.store.stageProposal({
            target: String(input?.target ?? ""),
            rationale: String(input?.rationale ?? ""),
            diff: String(input?.diff ?? ""),
            risk: input?.risk === "high" || input?.risk === "medium" ? input.risk : "low",
          });
        },
      },
    ],
  };
}
