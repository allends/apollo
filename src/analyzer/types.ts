import type { SkillRunAnalysis, SkillRunSnapshot } from "../session/types.js";

export type SkillRunAnalyzer = (snapshot: SkillRunSnapshot) => Promise<SkillRunAnalysis>;
