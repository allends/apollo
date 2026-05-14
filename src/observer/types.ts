import type { ApolloEvent } from "../events/types.js";

export interface ObservableHarnessEvent {
  type: string;
  prompt?: string;
  resources?: { skills?: Array<{ name: string; filePath?: string }> };
  toolCallId?: string;
  toolName?: string;
  input?: Record<string, unknown>;
  content?: unknown;
  details?: unknown;
  isError?: boolean;
  nextTurnCount?: number;
}

export interface ObservableHarness {
  subscribe(listener: (event: ObservableHarnessEvent) => Promise<void> | void): () => void;
}

export function harnessEventToApolloEvent(event: ObservableHarnessEvent, sessionId: string): ApolloEvent {
  return {
    type: "host.event",
    sessionId,
    payload: { ...event },
  } as ApolloEvent;
}
