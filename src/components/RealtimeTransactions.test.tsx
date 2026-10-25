import { act, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RealtimeTransactions from './RealtimeTransactions';

const { mockGetRecentContributions, mockUseCms } = vi.hoisted(() => ({
  mockGetRecentContributions: vi.fn(),
  mockUseCms: vi.fn(),
}));

vi.mock('@/api/contributions', () => ({
  getRecentContributions: mockGetRecentContributions,
}));

vi.mock('@/cms/CmsProvider', () => ({
  useCms: mockUseCms,
}));

describe('RealtimeTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mockGetRecentContributions.mockResolvedValue([]);
    mockUseCms.mockReturnValue({ state: { site: { budgetGoal: 416000 } } });
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

  it('uses the CMS budget goal for the progress bar', async () => {
    mockUseCms.mockReturnValue({ state: { site: { budgetGoal: 10000 } } });
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

    expect(await screen.findByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
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
      vi.advanceTimersByTime(30000);
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
    expect(screen.queryByRole('heading', { name: /live visitors/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /mission ends/i })).not.toBeInTheDocument();
  });

  it('keeps supporters with the same masked name in separate cards', async () => {
    mockGetRecentContributions.mockResolvedValue([
      {
        id: 1,
        donor_name: 'A**',
        amount: 5000,
        status: 'completed',
        created_at: '2026-08-01T10:00:00.000Z',
      },
      {
        id: 2,
        donor_name: 'A**',
        amount: 3000,
        status: 'completed',
        created_at: '2026-08-01T10:01:00.000Z',
      },
    ]);

    render(<RealtimeTransactions />);
    await screen.findAllByText('First gift');

    const supportersWall = screen.getByRole('heading', { name: /supporters wall/i }).closest('.glass-card');

    expect(supportersWall).not.toBeNull();
    expect(within(supportersWall as HTMLElement).getAllByText('A**')).toHaveLength(2);
  });
});
