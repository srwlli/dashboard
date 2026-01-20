/**
 * Unit tests for useBoards hook
 *
 * Tests board fetching with loading/error states and refetch functionality.
 * Note: Full cache testing skipped due to global state complexity.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useBoards } from '../useBoards';
import type { Board } from '@/types/boards';

// Mock fetch globally
global.fetch = jest.fn();

describe('useBoards', () => {
  const mockBoards: Board[] = [
    {
      id: 'board-1',
      name: 'Project Alpha',
      description: 'Main project board',
      projectId: 'proj-1',
      linkedPath: '/home/user/project-alpha',
      lists: [],
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should initialize with loading state', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useBoards());

    expect(result.current.loading).toBe(true);
    expect(result.current.boards).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useBoards());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.boards).toEqual([]);
    expect(result.current.error).toEqual(new Error('Network error'));

    consoleErrorSpy.mockRestore();
  });

  it('should handle API error responses', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Database connection failed',
      }),
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.boards).toEqual([]);
    expect(result.current.error).toEqual(
      new Error('Database connection failed')
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle non-ok HTTP responses', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.boards).toEqual([]);
    expect(result.current.error).toEqual(
      new Error('Failed to fetch boards: Internal Server Error')
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle empty boards array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.boards).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle missing data field in response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }), // No data field
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.boards).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should provide refetch function', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockBoards }),
    });

    const { result } = renderHook(() => useBoards());

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });
});
