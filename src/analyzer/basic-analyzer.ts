import type { SkillRunAnalysis, SkillRunSnapshot } from "../session/types.js";

export async function analyzeSkillRun(snapshot: SkillRunSnapshot): Promise<SkillRunAnalysis> {
  if (snapshot.events.some((event) => event.isError === true)) {
    return {
      outcome: "tool_error",
      summary: `${snapshot.skillName} hit a tool error during the run.`,
      signals: ["tool_error"],
    };
  }

  if (snapshot.events.length > 0) {
    return {
      outcome: "completed",
      summary: `${snapshot.skillName} completed after ${snapshot.events.length} observed lifecycle events.`,
      signals: ["completed"],
    };
  }

  return {
    outcome: "unknown",
    summary: `${snapshot.skillName} ended without enough observed events to classify.`,
    signals: [],
  };
}
