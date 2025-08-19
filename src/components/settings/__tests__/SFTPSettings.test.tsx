
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SFTPSettings } from '../SFTPSettings';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

// Mock the Telegram auth context
vi.mock('@/context/TelegramAuthContext', () => ({
  useTelegramAuth: vi.fn()
}));

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

describe('SFTPSettings', () => {
  beforeEach(() => {
    (useTelegramAuth as any).mockReturnValue({
      user: { id: 123, first_name: 'Test User' },
      isAuthenticated: true
    });
  });

  it('renders SFTP settings form', () => {
    render(<SFTPSettings />);
    expect(screen.getByText('SFTP Configuration')).toBeInTheDocument();
  });

  it('shows provision button when not provisioned', () => {
    render(<SFTPSettings />);
    expect(screen.getByText('Provision SFTP Access')).toBeInTheDocument();
  });

  it('handles provision button click', async () => {
    render(<SFTPSettings />);
    const provisionButton = screen.getByText('Provision SFTP Access');
    
    fireEvent.click(provisionButton);
    
    await waitFor(() => {
      expect(provisionButton).toBeInTheDocument();
    });
  });
});
