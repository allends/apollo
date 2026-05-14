import { APOLLO_EXTENSION, createApollo } from "../src/index.js";

const apollo = createApollo({ storePath: "./apollo.db" });
const extension = APOLLO_EXTENSION(apollo);

console.log(`Register ${extension.name} with ${extension.tools.length} tools in the host Pi editor.`);
