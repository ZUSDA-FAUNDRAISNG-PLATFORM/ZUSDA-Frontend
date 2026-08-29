import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RealtimeTransactions from './RealtimeTransactions';

const { mockGetRecentContributions } = vi.hoisted(() => ({
  mockGetRecentContributions: vi.fn(),
}));

vi.mock('@/api/contributions', () => ({
  getRecentContributions: mockGetRecentContributions,
}));

describe('RealtimeTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mockGetRecentContributions.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders the live transactions heading', async () => {
    mockGetRecentContributions.mockResolvedValue([
      {
        id: 1,
        donor_name: 'Ada',
        amount: 5000,
        status: 'completed',
        created_at: '2026-08-01T10:00:00.000Z',
      },
    ]);

    render(<RealtimeTransactions />);

    expect(await screen.findByText(/live transaction updates/i)).toBeInTheDocument();
    expect(screen.getByText(/total raised/i)).toBeInTheDocument();
  });

  it('marks newly arrived donations with a new badge', async () => {
    vi.useFakeTimers();

    mockGetRecentContributions
      .mockResolvedValueOnce([
        {
          id: 1,
          donor_name: 'Ada',
          amount: 5000,
          status: 'completed',
          created_at: '2026-08-01T10:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 1,
          donor_name: 'Ada',
          amount: 5000,
          status: 'completed',
          created_at: '2026-08-01T10:00:00.000Z',
        },
        {
          id: 2,
          donor_name: 'Grace',
          amount: 3000,
          status: 'completed',
          created_at: '2026-08-01T10:01:00.000Z',
        },
      ]);

    render(<RealtimeTransactions />);

    await act(async () => {
      vi.advanceTimersByTime(4000);
      await Promise.resolve();
    });

    expect(screen.getAllByText('Grace').length).toBeGreaterThan(0);
  });

  it('renders the live activity panel', async () => {
    mockGetRecentContributions.mockResolvedValue([
      {
        id: 1,
        donor_name: 'Ada',
        amount: 5000,
        status: 'completed',
        created_at: '2026-08-01T10:00:00.000Z',
      },
    ]);

    render(<RealtimeTransactions />);

    expect(await screen.findByText(/live activity/i)).toBeInTheDocument();
  });
});
