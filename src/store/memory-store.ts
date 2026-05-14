import type { ApolloEvent } from "../events/types.js";
import type { ApolloStore, ProposalRecord, SessionRecord } from "./types.js";

export function createMemoryStore(): ApolloStore {
  const events: ApolloEvent[] = [];
  const proposals: ProposalRecord[] = [];

  return {
    async appendEvent(event) {
      events.push({ ...event, id: event.id ?? crypto.randomUUID() });
    },
    async searchSessions(query, limit = 10) {
      const q = query.toLowerCase();
      const ids = [...new Set(events.filter((e) => JSON.stringify(e).toLowerCase().includes(q)).map((e) => e.sessionId))];
      return ids.slice(0, limit).map((id) => sessionFromEvents(id, events));
    },
    async getSession(sessionId) {
      const sessionEvents = events.filter((e) => e.sessionId === sessionId);
      if (sessionEvents.length === 0) return null;
      return { session: sessionFromEvents(sessionId, sessionEvents), events: sessionEvents };
    },
    async listProposals() {
      return [...proposals];
    },
    async stageProposal(proposal) {
      const record: ProposalRecord = { ...proposal, id: crypto.randomUUID(), status: "pending" };
      proposals.push(record);
      return record;
    },
  };
}

function sessionFromEvents(id: string, source: ApolloEvent[]): SessionRecord {
  const last = source[source.length - 1];
  return { id, updatedAt: last?.timestamp ?? new Date(0).toISOString() };
}
