import type { ApolloEvent } from "../events/types.js";

export interface SessionRecord {
  id: string;
  summary?: string;
  updatedAt: string;
}

export interface ProposalRecord {
  id: string;
  target: string;
  rationale: string;
  diff: string;
  risk: "low" | "medium" | "high";
  status: "pending" | "approved" | "applied" | "rejected";
}

export interface ApolloStore {
  appendEvent(event: ApolloEvent): Promise<void>;
  searchSessions(query: string, limit?: number): Promise<SessionRecord[]>;
  getSession(sessionId: string): Promise<{ session: SessionRecord; events: ApolloEvent[] } | null>;
  listProposals(): Promise<ProposalRecord[]>;
  stageProposal(proposal: Omit<ProposalRecord, "id" | "status">): Promise<ProposalRecord>;
}
