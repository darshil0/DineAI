export interface AgentSkill<Input, Output> {
  name: string;
  description: string;
  run: (input: Input, context?: SkillContext) => Promise<Output>;
}

export interface SkillContext {
  userId?: string;
  city?: string;
}

export interface SkillError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Type guard for runtime validation
export function isAgentSkill<Input, Output>(obj: unknown): obj is AgentSkill<Input, Output> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as any).name === 'string' &&
    'description' in obj &&
    typeof (obj as any).description === 'string' &&
    'run' in obj &&
    typeof (obj as any).run === 'function'
  );
}
