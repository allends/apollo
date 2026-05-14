export type ApolloEventType = "tool_call" | "tool_result" | "turn_end" | "agent_end" | "ask_user";

export interface ApolloEvent {
  type: ApolloEventType;
  timestamp: string;
  toolName?: string;
  toolCallId?: string;
  isError?: boolean;
  summary?: string;
}
