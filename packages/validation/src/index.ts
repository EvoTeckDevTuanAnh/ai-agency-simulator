import { AgentRole } from '@ai-agency/contracts';

export function isValidAgentRole(value: unknown): value is AgentRole {
  return Object.values(AgentRole).includes(value as AgentRole);
}

export interface ValidationResult {
  valid: boolean;
  errors: { field: string; message: string }[];
}

export function validateCreateAgentRequest(data: unknown): ValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body is required' }] };
  }

  const body = data as Record<string, unknown>;

  if (!('role' in body) || body.role === undefined || body.role === null) {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!isValidAgentRole(body.role)) {
    errors.push({ field: 'role', message: `Invalid role: ${String(body.role)}` });
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateAgentRoleRequest(data: unknown): ValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body is required' }] };
  }

  const body = data as Record<string, unknown>;

  if (!('role' in body) || body.role === undefined || body.role === null) {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!isValidAgentRole(body.role)) {
    errors.push({ field: 'role', message: `Invalid role: ${String(body.role)}` });
  }

  return { valid: errors.length === 0, errors };
}
