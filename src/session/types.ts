import type { ApolloEvent } from "../events/types.js";

export type SkillRunStatus = "active" | "awaiting_user" | "completed" | "failed";

export interface SkillRunAnalysis {
  summary: string;
  outcome: "completed" | "asked_user" | "tool_error" | "unknown";
  signals: string[];
}

export interface SkillRun {
  id: string;
  skillName: string;
  status: SkillRunStatus;
  startedAt: string;
  endedAt?: string;
  events: ApolloEvent[];
  analysis?: SkillRunAnalysis;
  error?: string;
}

export type SkillRunSnapshot = Readonly<Omit<SkillRun, "events"> & { events: readonly ApolloEvent[] }>;
