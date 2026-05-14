import type { ApolloEvent } from "../events/types.js";
import type { SkillRun, SkillRunAnalysis, SkillRunSnapshot, StartSkillRunInput } from "./types.js";

export interface SkillRunState {
  startRun(input: StartSkillRunInput): SkillRun;
  appendEvent(runId: string, event: ApolloEvent): void;
  markAwaitingUser(runId: string): void;
  completeRun(runId: string): SkillRunSnapshot;
  failRun(runId: string, error: unknown): SkillRunSnapshot;
  attachAnalysis(runId: string, analysis: SkillRunAnalysis): void;
  listRuns(): SkillRunSnapshot[];
  getRun(runId: string): SkillRunSnapshot | undefined;
  getActiveRun(): SkillRunSnapshot | undefined;
}

export function createSkillRunState(): SkillRunState {
  const runs: SkillRun[] = [];

  function find(runId: string): SkillRun {
    const run = runs.find((candidate) => candidate.id === runId);
    if (!run) throw new Error(`Unknown skill run: ${runId}`);
    return run;
  }

  return {
    startRun(input) {
      const run: SkillRun = {
        id: crypto.randomUUID(),
        sessionId: input.sessionId,
        skillName: input.skillName,
        skillFilePath: input.skillFilePath,
        status: "active",
        startedAt: new Date().toISOString(),
        events: [],
      };
      runs.push(run);
      return snapshot(run) as SkillRun;
    },
    appendEvent(runId, event) {
      const run = find(runId);
      run.events.push(event);
    },
    markAwaitingUser(runId) {
      const run = find(runId);
      if (run.status === "active") run.status = "awaiting_user";
    },
    completeRun(runId) {
      const run = find(runId);
      run.status = "completed";
      run.endedAt = new Date().toISOString();
      return snapshot(run);
    },
    failRun(runId, error) {
      const run = find(runId);
      run.status = "failed";
      run.endedAt = new Date().toISOString();
      run.error = error instanceof Error ? error.message : String(error);
      return snapshot(run);
    },
    attachAnalysis(runId, analysis) {
      find(runId).analysis = analysis;
    },
    listRuns() {
      return runs.map(snapshot);
    },
    getRun(runId) {
      const run = runs.find((candidate) => candidate.id === runId);
      return run ? snapshot(run) : undefined;
    },
    getActiveRun() {
      for (let index = runs.length - 1; index >= 0; index -= 1) {
        const run = runs[index]!;
        if (run.status === "active" || run.status === "awaiting_user") return snapshot(run);
      }
      return undefined;
    },
  };
}

function snapshot(run: SkillRun): SkillRunSnapshot {
  return { ...run, events: run.events.map((event) => ({ ...event, payload: event.payload ? { ...event.payload } : undefined })) };
}
