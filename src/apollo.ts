import type { ApolloConfig } from "./types.js";
import type { ApolloEvent } from "./events/types.js";
import type { ApolloStore } from "./store/types.js";
import { createMemoryStore } from "./store/memory-store.js";
import { redactEvent } from "./events/redaction.js";

export interface ApolloRuntime {
  readonly config: ApolloConfig;
  readonly store: ApolloStore;
  recordSessionEvent(event: ApolloEvent): Promise<void>;
}

export function createApollo(config: ApolloConfig = {}, store: ApolloStore = createMemoryStore()): ApolloRuntime {
  return {
    config,
    store,
    async recordSessionEvent(event: ApolloEvent): Promise<void> {
      await store.appendEvent(redactEvent(event));
    },
  };
}
