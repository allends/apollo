import { APOLLO_EXTENSION, createApollo, installApolloSkillTurnObserver } from "../src/index.js";

const apollo = createApollo({ sessionId: "current" });
const extension = APOLLO_EXTENSION(apollo);

// In a real Pi editor, pass the AgentHarness instance here.
const harness = {
  subscribe() {
    return () => undefined;
  },
};

installApolloSkillTurnObserver({ harness, apollo });

console.log(`Register ${extension.name} with ${extension.tools.length} optional inspection tools.`);
