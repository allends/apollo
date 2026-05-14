export interface ApolloConfig {
  /** Path to the local SQLite database or host-provided store identifier. */
  storePath?: string;
  /** Disable background distillation when the host editor wants manual control. */
  background?: boolean;
}
