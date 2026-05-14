import { createSkillRunState, type SkillRunState } from "./session/skill-run-state.js";
import type { ApolloConfig } from "./types.js";

export interface ApolloRuntime {
  readonly config: ApolloConfig;
  readonly skillRuns: SkillRunState;
}

export function createApollo(config: ApolloConfig = {}, skillRuns: SkillRunState = createSkillRunState()): ApolloRuntime {
  return { config, skillRuns };
}
