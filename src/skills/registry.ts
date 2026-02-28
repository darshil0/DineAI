import { AgentSkill } from "./types.js";

const skillRegistry = new Map<string, AgentSkill<any, any>>();

export function registerSkill<Input, Output>(skill: AgentSkill<Input, Output>) {
  skillRegistry.set(skill.name, skill);
}

export function getSkill<Input, Output>(
  name: string,
): AgentSkill<Input, Output> | undefined {
  return skillRegistry.get(name) as AgentSkill<Input, Output> | undefined;
}

export function listSkills() {
  return Array.from(skillRegistry.keys());
}
