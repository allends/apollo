export interface ApolloConfig {
  /** Optional logical session id supplied by the host Pi editor. */
  sessionId?: string;
  /** Disable asynchronous post-skill analysis when the host wants manual control. */
  analyzeSkillRuns?: boolean;
}
