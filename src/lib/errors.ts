export class AppError extends Error {
  public statusCode: number;
  public userFriendlyMessage: string;

  constructor(message: string, statusCode: number = 500, userFriendlyMessage?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.userFriendlyMessage = userFriendlyMessage || "An unexpected error occurred. Please try again later.";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AgentServiceError extends AppError {
  constructor(agentName: string, originalError: any) {
    const message = `Agent [${agentName}] failed: ${originalError.message || originalError}`;
    const userFriendlyMessage = `The ${agentName} agent encountered an issue while processing your request. We're working on it!`;
    super(message, 500, userFriendlyMessage);
  }
}

export class SkillError extends AppError {
  constructor(skillName: string, originalError: any) {
    const message = `Skill [${skillName}] failed: ${originalError.message || originalError}`;
    const userFriendlyMessage = `A specialized tool (${skillName}) failed to complete its task. This might affect the quality of your recommendations.`;
    super(message, 500, userFriendlyMessage);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, message);
  }
}

export function handleApiError(res: any, error: any) {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      userMessage: error.userFriendlyMessage,
    });
  }

  // Default error response
  return res.status(500).json({
    error: error.message || "Internal Server Error",
    userMessage: "Something went wrong on our end. Please try again.",
  });
}
