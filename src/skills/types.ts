export interface AgentSkill<Input, Output> {
  name: string;
  description: string;
  run: (input: Input) => Promise<Output>;
}

export interface SkillContext {
  userId?: string;
  city?: string;
}
