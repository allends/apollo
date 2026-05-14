import type { ApolloEvent } from "./events/types.js";
import { redactEvent } from "./events/redaction.js";
import { createSkillRunState, type SkillRunState } from "./session/skill-run-state.js";
import { createMemoryStore } from "./store/memory-store.js";
import type { ApolloStore } from "./store/types.js";
import type { ApolloConfig } from "./types.js";

export interface ApolloRuntime {
  readonly config: ApolloConfig;
  readonly skillRuns: SkillRunState;
  /** Legacy generic event store kept while the first observer slice is being built. */
  readonly store: ApolloStore;
  recordSessionEvent(event: ApolloEvent): Promise<void>;
}

export function createApollo(
  config: ApolloConfig = {},
  store: ApolloStore = createMemoryStore(),
  skillRuns: SkillRunState = createSkillRunState(),
): ApolloRuntime {
  return {
    config,
    skillRuns,
    store,
    async recordSessionEvent(event: ApolloEvent): Promise<void> {
      await store.appendEvent(redactEvent(event));
    },
  };
}
