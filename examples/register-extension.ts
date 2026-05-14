import { createApollo, installApolloSkillTurnObserver } from "../src/index.js";
import type { PiContext, PiExtensionAPI } from "../src/observer/types.js";

const handlers = new Map<string, Array<(event: never, ctx: PiContext) => void | Promise<void>>>();
const pi = {
  on(event: string, handler: (event: never, ctx: PiContext) => void | Promise<void>) {
    handlers.set(event, [...(handlers.get(event) ?? []), handler]);
  },
  registerCommand(name: string) {
    console.log(`registered /${name}`);
  },
} satisfies PiExtensionAPI;

const apollo = createApollo();
installApolloSkillTurnObserver({ pi, apollo });

console.log("Apollo extension observer installed", handlers.size);
