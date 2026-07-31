import { describe, it, expect } from 'vitest';
import { AgentRole } from '@ai-agency/contracts';
import {
  isValidAgentRole,
  validateCreateAgentRequest,
  validateUpdateAgentRoleRequest,
} from '../index';

describe('isValidAgentRole', () => {
  it('should return true for DIRECTOR', () => {
    expect(isValidAgentRole(AgentRole.DIRECTOR)).toBe(true);
  });

  it('should return true for DEVELOPER', () => {
    expect(isValidAgentRole(AgentRole.DEVELOPER)).toBe(true);
  });

  it('should return true for DESIGNER', () => {
    expect(isValidAgentRole(AgentRole.DESIGNER)).toBe(true);
  });

  it('should return true for CONTENT', () => {
    expect(isValidAgentRole(AgentRole.CONTENT)).toBe(true);
  });

  it('should return true for TESTER', () => {
    expect(isValidAgentRole(AgentRole.TESTER)).toBe(true);
  });

  it('should return false for an empty string', () => {
    expect(isValidAgentRole('')).toBe(false);
  });

  it('should return false for random string', () => {
    expect(isValidAgentRole('INVALID_ROLE')).toBe(false);
  });

  it('should return false for lowercase values', () => {
    expect(isValidAgentRole('developer')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isValidAgentRole(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidAgentRole(undefined)).toBe(false);
  });

  it('should return false for a number', () => {
    expect(isValidAgentRole(123)).toBe(false);
  });
});

describe('validateCreateAgentRequest', () => {
  it('should pass for valid DIRECTOR role', () => {
    const result = validateCreateAgentRequest({ role: AgentRole.DIRECTOR });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should pass for valid DEVELOPER role', () => {
    const result = validateCreateAgentRequest({ role: AgentRole.DEVELOPER });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail for empty object', () => {
    const result = validateCreateAgentRequest({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].field).toBe('role');
  });

  it('should fail for invalid role', () => {
    const result = validateCreateAgentRequest({ role: 'CEO' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].field).toBe('role');
  });

  it('should fail for null', () => {
    const result = validateCreateAgentRequest(null);
    expect(result.valid).toBe(false);
  });

  it('should fail for undefined', () => {
    const result = validateCreateAgentRequest(undefined);
    expect(result.valid).toBe(false);
  });

  it('should fail for non-object', () => {
    const result = validateCreateAgentRequest('invalid');
    expect(result.valid).toBe(false);
  });

  it('should fail when role is null', () => {
    const result = validateCreateAgentRequest({ role: null });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('role');
  });
});

describe('validateUpdateAgentRoleRequest', () => {
  it('should pass for valid DIRECTOR role', () => {
    const result = validateUpdateAgentRoleRequest({ role: AgentRole.DIRECTOR });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should pass for valid TESTER role', () => {
    const result = validateUpdateAgentRoleRequest({ role: AgentRole.TESTER });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail for empty object', () => {
    const result = validateUpdateAgentRoleRequest({});
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('role');
  });

  it('should fail for invalid role', () => {
    const result = validateUpdateAgentRoleRequest({ role: 'MANAGER' });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('role');
  });

  it('should fail for null body', () => {
    const result = validateUpdateAgentRoleRequest(null);
    expect(result.valid).toBe(false);
  });

  it('should fail for undefined body', () => {
    const result = validateUpdateAgentRoleRequest(undefined);
    expect(result.valid).toBe(false);
  });

  it('should fail for non-object body', () => {
    const result = validateUpdateAgentRoleRequest(42);
    expect(result.valid).toBe(false);
  });

  it('should fail when role is null', () => {
    const result = validateUpdateAgentRoleRequest({ role: null });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('role');
  });
});
