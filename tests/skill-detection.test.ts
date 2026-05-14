import * as assert from "node:assert/strict";
import { test } from "node:test";
import { detectExpandedSkill, detectSkillCommand } from "../src/observer/skill-detection.js";

test("detects raw skill commands", () => {
  assert.equal(detectSkillCommand("/skill:review check this"), "review");
  assert.equal(detectSkillCommand("hello"), undefined);
});

test("detects expanded skill prompts", () => {
  assert.equal(detectExpandedSkill('<skill name="review" location="/tmp/SKILL.md">\nBody</skill>'), "review");
});
