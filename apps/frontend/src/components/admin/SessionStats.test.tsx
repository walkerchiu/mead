/**
 * SessionStats Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionStats } from './SessionStats';
import React from 'react';

// Mock the hooks
vi.mock('@/hooks/useSessionStatistics', () => ({
  useSessionStatistics: vi.fn(),
}));

vi.mock('@/components/auth/ProtectedRoute', () => ({
  useAuthReady: vi.fn(() => true),
}));

import { useSessionStatistics } from '@/hooks/useSessionStatistics';

describe('SessionStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading skeleton when loading', () => {
    vi.mocked(useSessionStatistics).mockReturnValue({
      statistics: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    });

    const { container } = render(<SessionStats />);

    // Check for skeleton components
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render all stat cards with data', () => {
    const mockStats = {
      totalSessions: 150,
      activeSessions: 42,
      totalRevoked: 5,
      totalExpired: 103,
      todayLogins: 10,
      todayRevocations: 2,
      byScope: [],
      topActiveUsers: [],
      topDevices: [
        {
          deviceInfo: 'Chrome Browser',
          count: 25,
        },
      ],
      recentActivities: [],
    };

    vi.mocked(useSessionStatistics).mockReturnValue({
      statistics: mockStats,
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    render(<SessionStats />);

    // Check if stat values are rendered
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('103')).toBeInTheDocument();
    expect(screen.getByText('Chrome Browser')).toBeInTheDocument();
    expect(screen.getByText(/25.*sessions/)).toBeInTheDocument();
  });

  it('should display zero values correctly', () => {
    const zeroStats = {
      totalSessions: 0,
      activeSessions: 0,
      totalRevoked: 0,
      totalExpired: 0,
      todayLogins: 0,
      todayRevocations: 0,
      byScope: [],
      topActiveUsers: [],
      topDevices: [],
      recentActivities: [],
    };

    vi.mocked(useSessionStatistics).mockReturnValue({
      statistics: zeroStats,
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    render(<SessionStats />);

    // Check for zero values
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle large numbers correctly', () => {
    const largeStats = {
      totalSessions: 95555,
      activeSessions: 50000,
      totalRevoked: 1234,
      totalExpired: 44321,
      todayLogins: 500,
      todayRevocations: 10,
      byScope: [],
      topActiveUsers: [],
      topDevices: [
        {
          deviceInfo: 'Safari Browser',
          count: 15000,
        },
      ],
      recentActivities: [],
    };

    vi.mocked(useSessionStatistics).mockReturnValue({
      statistics: largeStats,
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    render(<SessionStats />);

    // Numbers should be formatted with locale
    expect(screen.getByText('50,000')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('44,321')).toBeInTheDocument();
  });

  it('should render 4 stat cards', () => {
    const mockStats = {
      totalSessions: 17,
      activeSessions: 10,
      totalRevoked: 2,
      totalExpired: 5,
      todayLogins: 3,
      todayRevocations: 1,
      byScope: [],
      topActiveUsers: [],
      topDevices: [{ deviceInfo: 'Chrome', count: 5 }],
      recentActivities: [],
    };

    vi.mocked(useSessionStatistics).mockReturnValue({
      statistics: mockStats,
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    const { container } = render(<SessionStats />);

    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBe(4);
  });

  it('should show no data message when byDevice is empty', () => {
    const mockStats = {
      totalSessions: 17,
      activeSessions: 10,
      totalRevoked: 2,
      totalExpired: 5,
      todayLogins: 3,
      todayRevocations: 1,
      byScope: [],
      topActiveUsers: [],
      topDevices: [],
      recentActivities: [],
    };

    vi.mocked(useSessionStatistics).mockReturnValue({
      statistics: mockStats,
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    render(<SessionStats />);

    // Should show placeholder for device
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
