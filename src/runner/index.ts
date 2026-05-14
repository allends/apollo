import { distillNewHistory } from "../distiller/index.js";

export async function runApolloMaintenance(): Promise<void> {
  await distillNewHistory();
}
