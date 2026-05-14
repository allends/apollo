export type ApolloEventType =
  | "session.started"
  | "message.received"
  | "message.sent"
  | "tool.called"
  | "tool.completed"
  | "task.outcome_recorded"
  | "summary.generated"
  | "proposal.staged"
  | "proposal.applied"
  | "host.event";

export interface ApolloEvent {
  id?: string;
  type: ApolloEventType;
  sessionId: string;
  timestamp?: string;
  payload?: Record<string, unknown>;
}
