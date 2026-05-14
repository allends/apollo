import type { ApolloStore } from "./types.js";

/**
 * Placeholder for the durable SQLite-backed store.
 * The public interface is fixed first so Pi editor integrations can wire against Apollo
 * without depending on a specific SQLite package.
 */
export function createSqliteStore(_path: string): ApolloStore {
  throw new Error("createSqliteStore is not implemented yet; use createMemoryStore for scaffolding.");
}
