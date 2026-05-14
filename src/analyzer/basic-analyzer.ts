import type { SkillRunAnalysis, SkillRunSnapshot } from "../session/types.js";

export async function analyzeSkillRun(snapshot: SkillRunSnapshot): Promise<SkillRunAnalysis> {
  const usedAskUser = snapshot.events.some((event) => isAskUserTool(String(event.payload?.toolName ?? event.payload?.name ?? "")));
  if (usedAskUser) {
    return {
      outcome: "asked_user",
      summary: `${snapshot.skillName} asked the user for more context during the turn.`,
      signals: ["ask_user"],
    };
  }

  const hadToolError = snapshot.events.some((event) => event.payload?.isError === true);
  if (hadToolError) {
    return {
      outcome: "tool_error",
      summary: `${snapshot.skillName} encountered a tool error during the turn.`,
      signals: ["tool_error"],
    };
  }

  if (snapshot.events.length > 0) {
    return {
      outcome: "completed",
      summary: `${snapshot.skillName} completed with ${snapshot.events.length} observed events.`,
      signals: ["completed"],
    };
  }

  return {
    outcome: "unknown",
    summary: `${snapshot.skillName} completed without enough observed events to classify the outcome.`,
    signals: [],
  };
}

export function isAskUserTool(toolName: string): boolean {
  const normalized = toolName.toLowerCase().replace(/[_\s-]/g, "");
  return normalized === "askuser" || normalized === "askuserquestion";
}
