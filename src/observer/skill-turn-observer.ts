import type { ApolloRuntime } from "../apollo.js";
import { analyzeSkillRun } from "../analyzer/basic-analyzer.js";
import type { SkillRunAnalyzer } from "../analyzer/types.js";
import { redactEvent } from "../events/redaction.js";
import { detectSkillInvocation } from "./skill-detection.js";
import { harnessEventToApolloEvent, type ObservableHarness } from "./types.js";

export interface InstallApolloSkillTurnObserverOptions {
  harness: ObservableHarness;
  apollo: ApolloRuntime;
  analyzer?: SkillRunAnalyzer;
}

export function installApolloSkillTurnObserver({
  harness,
  apollo,
  analyzer = analyzeSkillRun,
}: InstallApolloSkillTurnObserverOptions): () => void {
  return harness.subscribe((event) => {
    const active = apollo.skillRuns.getActiveRun();

    if (event.type === "before_agent_start") {
      const detected = detectSkillInvocation(event.prompt ?? "", event.resources?.skills ?? []);
      if (detected) {
        apollo.skillRuns.startRun({
          sessionId: apollo.config.sessionId ?? "current",
          skillName: detected.skillName,
          skillFilePath: detected.skillFilePath,
        });
      }
      return;
    }

    if (!active) return;

    if (event.type === "tool_call" || event.type === "tool_result" || event.type === "save_point") {
      const apolloEvent = redactEvent(harnessEventToApolloEvent(event, active.sessionId));
      apollo.skillRuns.appendEvent(active.id, apolloEvent);
      if (event.toolName && isAskUserToolName(event.toolName)) apollo.skillRuns.markAwaitingUser(active.id);
      return;
    }

    if (event.type === "settled") {
      const snapshot = apollo.skillRuns.completeRun(active.id);
      if (apollo.config.analyzeSkillRuns === false) return;
      queueMicrotask(() => {
        void analyzer(snapshot)
          .then((analysis) => apollo.skillRuns.attachAnalysis(snapshot.id, analysis))
          .catch((error: unknown) => {
            apollo.skillRuns.failRun(snapshot.id, error);
          });
      });
    }
  });
}

function isAskUserToolName(toolName: string): boolean {
  const normalized = toolName.toLowerCase().replace(/[_\s-]/g, "");
  return normalized === "askuser" || normalized === "askuserquestion";
}
