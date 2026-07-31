export class AgentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export const ErrorCodes = {
  DIRECTOR_NOT_FOUND: 'DIRECTOR_NOT_FOUND',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  CANNOT_MODIFY_DIRECTOR: 'CANNOT_MODIFY_DIRECTOR',
  CANNOT_DELETE_DIRECTOR: 'CANNOT_DELETE_DIRECTOR',
  CANNOT_CREATE_DIRECTOR: 'CANNOT_CREATE_DIRECTOR',
  MAX_AGENTS_REACHED: 'MAX_AGENTS_REACHED',
  INVALID_ROLE: 'INVALID_ROLE',
  ROLE_REQUIRED: 'ROLE_REQUIRED',
  DATA_DIRECTORY_MISSING: 'DATA_DIRECTORY_MISSING',
} as const;
