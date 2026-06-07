import { AgentSkill } from './types.js';

const skillRegistry = new Map<string, AgentSkill<any, any>>();

export function registerSkill<Input, Output>(skill: AgentSkill<Input, Output>): void {
  if (skillRegistry.has(skill.name)) {
    throw new Error(`Skill "${skill.name}" is already registered`);
  }
  skillRegistry.set(skill.name, skill);
}

export function getSkill<Input, Output>(name: string): AgentSkill<Input, Output> | undefined {
  return skillRegistry.get(name) as AgentSkill<Input, Output> | undefined;
}

export function unregisterSkill(name: string): boolean {
  return skillRegistry.delete(name);
}

export function listSkills(): string[] {
  return Array.from(skillRegistry.keys());
}

export function getSkillCount(): number {
  return skillRegistry.size;
}
