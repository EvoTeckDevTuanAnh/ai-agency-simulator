import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OfficePage } from '../pages/OfficePage';

vi.mock('../scene/OfficeGeometry', () => ({
  OfficeGeometry: () => null,
}));

vi.mock('@react-three/fiber', () => {
  const R3F = ({ children }: { children?: React.ReactNode }) =>
    <div data-testid="r3f-canvas">{children}</div>;
  return {
    Canvas: R3F,
    useThree: () => ({ camera: {} }),
  };
});

vi.mock('@react-three/drei', () => {
  const MockOrbitControls = vi.fn(({ enableRotate, enableZoom, enablePan }) => (
    <div
      data-testid="orbit-controls"
      data-rotate={String(enableRotate)}
      data-zoom={String(enableZoom)}
      data-pan={String(enablePan)}
    />
  ));

  const MockFloat = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  const MockText = ({ children }: { children?: React.ReactNode }) => <span>{children}</span>;

  return {
    OrbitControls: MockOrbitControls,
    Float: MockFloat,
    Text: MockText,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('OfficePage', () => {
  it('mounts without error', () => {
    expect(() => {
      render(
        <MemoryRouter>
          <OfficePage />
        </MemoryRouter>
      );
    }).not.toThrow();
  });

  it('renders R3F canvas', () => {
    const { container } = render(
      <MemoryRouter>
        <OfficePage />
      </MemoryRouter>
    );
    const canvas = container.querySelector('[data-testid="r3f-canvas"]');
    expect(canvas).toBeTruthy();
  });

  it('renders OrbitControls with no rotation', () => {
    const { container } = render(
      <MemoryRouter>
        <OfficePage />
      </MemoryRouter>
    );
    const controls = container.querySelector('[data-testid="orbit-controls"]');
    expect(controls?.getAttribute('data-rotate')).toBe('false');
  });

  it('renders OrbitControls with no zoom', () => {
    const { container } = render(
      <MemoryRouter>
        <OfficePage />
      </MemoryRouter>
    );
    const controls = container.querySelector('[data-testid="orbit-controls"]');
    expect(controls?.getAttribute('data-zoom')).toBe('false');
  });

  it('renders OrbitControls with pan enabled', () => {
    const { container } = render(
      <MemoryRouter>
        <OfficePage />
      </MemoryRouter>
    );
    const controls = container.querySelector('[data-testid="orbit-controls"]');
    expect(controls?.getAttribute('data-pan')).toBe('true');
  });

  it('unmounts without errors or leaked listeners', () => {
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(
      <MemoryRouter>
        <OfficePage />
      </MemoryRouter>
    );
    expect(() => act(() => unmount())).not.toThrow();
    expect(consoleErr).not.toHaveBeenCalled();
    consoleErr.mockRestore();
  });

});
