export interface DetectedSkillInvocation {
  skillName: string;
  skillFilePath?: string;
}

export interface SkillResource {
  name: string;
  filePath?: string;
}

const SKILL_PROMPT_RE = /^<skill name="([^"]+)" location="([^"]*)">/;

export function detectSkillInvocation(prompt: string, skills: SkillResource[] = []): DetectedSkillInvocation | null {
  const match = SKILL_PROMPT_RE.exec(prompt.trimStart());
  if (!match) return null;

  const skillName = match[1]!;
  const promptPath = match[2] || undefined;
  const resource = skills.find((skill) => skill.name === skillName);

  return {
    skillName,
    skillFilePath: resource?.filePath ?? promptPath,
  };
}
