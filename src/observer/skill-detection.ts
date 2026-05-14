export function detectSkillCommand(input: string): string | undefined {
  const match = /^\/skill:([^\s]+)/.exec(input.trim());
  return match?.[1];
}

export function detectExpandedSkill(prompt: string, skills: Array<{ name: string; filePath?: string }> = []): string | undefined {
  const match = /^<skill name="([^"]+)" location="[^"]*">/.exec(prompt.trimStart());
  if (match?.[1]) return match[1];

  const namedSkill = skills.find((skill) => prompt.includes(`<skill name="${skill.name}"`));
  return namedSkill?.name;
}
