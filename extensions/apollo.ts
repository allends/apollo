import { createApollo, installApolloSkillTurnObserver } from "../src/index.js";
import type { PiExtensionAPI } from "../src/observer/types.js";

export default function apolloExtension(pi: PiExtensionAPI): void {
  const apollo = createApollo();
  installApolloSkillTurnObserver({ pi, apollo });
}
