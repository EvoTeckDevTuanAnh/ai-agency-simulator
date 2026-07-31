import { describe, it, expect } from 'vitest';
import { AgentRole, AgentStatus } from '../enums';

describe('AgentRole', () => {
  it('should have DIRECTOR role', () => {
    expect(AgentRole.DIRECTOR).toBe('DIRECTOR');
  });

  it('should have DEVELOPER role', () => {
    expect(AgentRole.DEVELOPER).toBe('DEVELOPER');
  });

  it('should have DESIGNER role', () => {
    expect(AgentRole.DESIGNER).toBe('DESIGNER');
  });

  it('should have CONTENT role', () => {
    expect(AgentRole.CONTENT).toBe('CONTENT');
  });

  it('should have TESTER role', () => {
    expect(AgentRole.TESTER).toBe('TESTER');
  });

  it('should have exactly 5 roles', () => {
    expect(Object.keys(AgentRole).length).toBe(5);
  });
});

describe('AgentStatus', () => {
  it('should have ENTERING status', () => {
    expect(AgentStatus.ENTERING).toBe('ENTERING');
  });

  it('should have WALKING_TO_DESK status', () => {
    expect(AgentStatus.WALKING_TO_DESK).toBe('WALKING_TO_DESK');
  });

  it('should have WORKING status', () => {
    expect(AgentStatus.WORKING).toBe('WORKING');
  });

  it('should have WALKING_AROUND status', () => {
    expect(AgentStatus.WALKING_AROUND).toBe('WALKING_AROUND');
  });

  it('should have RETURNING_TO_DESK status', () => {
    expect(AgentStatus.RETURNING_TO_DESK).toBe('RETURNING_TO_DESK');
  });

  it('should have exactly 5 statuses', () => {
    expect(Object.keys(AgentStatus).length).toBe(5);
  });
});
