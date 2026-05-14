import type { ApolloEvent } from "../events/types.js";
import type { SkillRun, SkillRunAnalysis, SkillRunSnapshot } from "./types.js";

export interface SkillRunState {
  start(skillName: string): SkillRunSnapshot;
  append(event: ApolloEvent): void;
  markAwaitingUser(): void;
  complete(): SkillRunSnapshot | undefined;
  fail(error: unknown): SkillRunSnapshot | undefined;
  attachAnalysis(runId: string, analysis: SkillRunAnalysis): void;
  current(): SkillRunSnapshot | undefined;
  all(): SkillRunSnapshot[];
}

export function createSkillRunState(): SkillRunState {
  const runs: SkillRun[] = [];

  return {
    start(skillName) {
      const run: SkillRun = {
        id: crypto.randomUUID(),
        skillName,
        status: "active",
        startedAt: new Date().toISOString(),
        events: [],
      };
      runs.push(run);
      return snapshot(run);
    },
    append(event) {
      const run = activeRun(runs);
      if (run) run.events.push(event);
    },
    markAwaitingUser() {
      const run = activeRun(runs);
      if (run && run.status === "active") run.status = "awaiting_user";
    },
    complete() {
      const run = activeRun(runs);
      if (!run) return undefined;
      run.status = "completed";
      run.endedAt = new Date().toISOString();
      return snapshot(run);
    },
    fail(error) {
      const run = activeRun(runs);
      if (!run) return undefined;
      run.status = "failed";
      run.endedAt = new Date().toISOString();
      run.error = error instanceof Error ? error.message : String(error);
      return snapshot(run);
    },
    attachAnalysis(runId, analysis) {
      const run = runs.find((candidate) => candidate.id === runId);
      if (run) run.analysis = analysis;
    },
    current() {
      const run = activeRun(runs);
      return run ? snapshot(run) : undefined;
    },
    all() {
      return runs.map(snapshot);
    },
  };
}

function activeRun(runs: SkillRun[]): SkillRun | undefined {
  for (let index = runs.length - 1; index >= 0; index -= 1) {
    const run = runs[index]!;
    if (run.status === "active" || run.status === "awaiting_user") return run;
  }
  return undefined;
}

function snapshot(run: SkillRun): SkillRunSnapshot {
  return { ...run, events: run.events.map((event) => ({ ...event })) };
}
