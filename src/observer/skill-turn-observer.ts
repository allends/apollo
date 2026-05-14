import type { ApolloRuntime } from "../apollo.js";
import { analyzeSkillRun } from "../analyzer/basic-analyzer.js";
import type { SkillRunAnalyzer } from "../analyzer/types.js";
import { detectExpandedSkill, detectSkillCommand } from "./skill-detection.js";
import type { PiExtensionAPI } from "./types.js";

export interface InstallApolloSkillTurnObserverOptions {
  pi: PiExtensionAPI;
  apollo: ApolloRuntime;
  analyzer?: SkillRunAnalyzer;
}

export function installApolloSkillTurnObserver({
  pi,
  apollo,
  analyzer = analyzeSkillRun,
}: InstallApolloSkillTurnObserverOptions): void {
  let pendingSkillName: string | undefined;

  pi.on("input", async (event) => {
    pendingSkillName = detectSkillCommand(event.text);
  });

  pi.on("before_agent_start", async (event) => {
    const skillName = pendingSkillName ?? detectExpandedSkill(event.prompt, event.systemPromptOptions?.skills ?? []);
    pendingSkillName = undefined;
    if (skillName) apollo.skillRuns.start(skillName);
  });

  pi.on("tool_call", async (event) => {
    if (!apollo.skillRuns.current()) return;
    const isAskUser = isAskUserTool(event.toolName);
    apollo.skillRuns.append({
      type: isAskUser ? "ask_user" : "tool_call",
      timestamp: new Date().toISOString(),
      toolName: event.toolName,
      toolCallId: event.toolCallId,
    });
    if (isAskUser) apollo.skillRuns.markAwaitingUser();
  });

  pi.on("tool_result", async (event) => {
    if (!apollo.skillRuns.current()) return;
    apollo.skillRuns.append({
      type: "tool_result",
      timestamp: new Date().toISOString(),
      toolName: event.toolName,
      toolCallId: event.toolCallId,
      isError: event.isError,
    });
  });

  pi.on("turn_end", async () => {
    if (!apollo.skillRuns.current()) return;
    apollo.skillRuns.append({ type: "turn_end", timestamp: new Date().toISOString() });
  });

  pi.on("agent_end", async () => {
    const snapshot = apollo.skillRuns.complete();
    if (!snapshot || apollo.config.analyzeSkillRuns === false) return;
    queueMicrotask(() => {
      void analyzer(snapshot)
        .then((analysis) => apollo.skillRuns.attachAnalysis(snapshot.id, analysis))
        .catch((error: unknown) => {
          apollo.skillRuns.fail(error);
        });
    });
  });

  pi.registerCommand?.("apollo", {
    description: "Show Apollo skill-run observations for this session",
    handler: async (_args, ctx) => {
      const runs = apollo.skillRuns.all();
      const latest = runs.at(-1);
      const message = latest
        ? `Apollo observed ${runs.length} skill run(s). Latest: ${latest.skillName} → ${latest.analysis?.outcome ?? latest.status}`
        : "Apollo has not observed any skill runs in this session.";
      ctx.ui?.notify(message, "info");
    },
  });
}

function isAskUserTool(toolName: string): boolean {
  const normalized = toolName.toLowerCase().replace(/[_\s-]/g, "");
  return normalized === "askuser" || normalized === "askuserquestion";
}
