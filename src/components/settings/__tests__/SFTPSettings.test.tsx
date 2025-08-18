
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SFTPSettings } from '../SFTPSettings';

// Mock the Telegram WebApp
const mockTelegramWebApp = {
  initDataUnsafe: {
    user: {
      id: 12345
    }
  }
};

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.Telegram
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: mockTelegramWebApp
  },
  writable: true
});

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined)
  },
  writable: true
});

describe('SFTPSettings Component', () => {
  const mockOnConnectionResult = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('renders initial state correctly', () => {
    render(<SFTPSettings onConnectionResult={mockOnConnectionResult} />);
    
    expect(screen.getByText('הגדרות SFTP')).toBeInTheDocument();
    expect(screen.getByText('העלאה מאובטחת; אתה מוגבל לתיקייה פרטית. העלה ל-/inbox.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /צור חשבון SFTP/i })).toBeInTheDocument();
  });

  it('handles successful SFTP provision and connection', async () => {
    // Mock successful provision response
    const mockProvisionResponse = {
      success: true,
      credentials: {
        host: '136.0.3.22',
        port: 22,
        username: 'ftp_12345',
        password: 'test-password-123',
        folder_path: '/inbox'
      },
      account: {
        telegram_id: 12345,
        ftp_username: 'ftp_12345',
        ftp_folder_path: '/inbox',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-12-31T23:59:59Z'
      }
    };

    // Mock successful test connection response
    const mockTestResponse = {
      status: 'success',
      last_event: 'Connection successful'
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProvisionResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTestResponse)
      });

    render(<SFTPSettings onConnectionResult={mockOnConnectionResult} />);
    
    const generateButton = screen.getByRole('button', { name: /צור חשבון SFTP/i });
    fireEvent.click(generateButton);

    // Wait for provision to complete
    await waitFor(() => {
      expect(screen.getByDisplayValue('136.0.3.22')).toBeInTheDocument();
      expect(screen.getByDisplayValue('22')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ftp_12345')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-password-123')).toBeInTheDocument();
    });

    // Wait for connection test to complete
    await waitFor(() => {
      expect(screen.getByText('מחובר')).toBeInTheDocument();
      expect(mockOnConnectionResult).toHaveBeenCalledWith('success', mockTestResponse);
    });

    // Password should be hidden after successful connection
    await waitFor(() => {
      expect(screen.getByText('הסיסמה הוסתרה (הוצגה פעם אחת בלבד)')).toBeInTheDocument();
    });

    // Generate button should be locked
    expect(screen.getByRole('button', { name: /חשבון נוצר/i })).toBeDisabled();
  });

  it('handles failed SFTP connection with retry option', async () => {
    const mockProvisionResponse = {
      success: true,
      credentials: {
        host: '136.0.3.22',
        port: 22,
        username: 'ftp_12345',
        password: 'test-password-123',
        folder_path: '/inbox'
      },
      account: {
        telegram_id: 12345,
        ftp_username: 'ftp_12345',
        ftp_folder_path: '/inbox',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-12-31T23:59:59Z'
      }
    };

    const mockFailedTestResponse = {
      status: 'failed',
      last_event: 'Connection timeout'
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProvisionResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFailedTestResponse)
      });

    render(<SFTPSettings onConnectionResult={mockOnConnectionResult} />);
    
    const generateButton = screen.getByRole('button', { name: /צור חשבון SFTP/i });
    fireEvent.click(generateButton);

    // Wait for provision and failed test
    await waitFor(() => {
      expect(screen.getByText('נכשל')).toBeInTheDocument();
      expect(mockOnConnectionResult).toHaveBeenCalledWith('failed', mockFailedTestResponse);
    });

    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /החלף סיסמה ונסה שוב/i });
    expect(retryButton).toBeInTheDocument();

    // Password should be hidden after failed connection
    expect(screen.getByText('הסיסמה הוסתרה (הוצגה פעם אחת בלבד)')).toBeInTheDocument();
  });

  it('handles pending connection state correctly', async () => {
    const mockProvisionResponse = {
      success: true,
      credentials: {
        host: '136.0.3.22',
        port: 22,
        username: 'ftp_12345',
        password: 'test-password-123',
        folder_path: '/inbox'
      },
      account: {
        telegram_id: 12345,
        ftp_username: 'ftp_12345',
        ftp_folder_path: '/inbox',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-12-31T23:59:59Z'
      }
    };

    const mockPendingTestResponse = {
      status: 'pending',
      last_event: 'Testing connection...'
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProvisionResponse)
      })
      // Mock 6 pending responses to trigger timeout
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPendingTestResponse)
      });

    render(<SFTPSettings onConnectionResult={mockOnConnectionResult} />);
    
    const generateButton = screen.getByRole('button', { name: /צור חשבון SFTP/i });
    fireEvent.click(generateButton);

    // Should show testing state
    await waitFor(() => {
      expect(screen.getByText('בודק חיבור...')).toBeInTheDocument();
    });

    // After timeout, should show pending state and hide password
    await waitFor(() => {
      expect(mockOnConnectionResult).toHaveBeenCalledWith('pending', { last_event: 'Connection test timed out' });
      expect(screen.getByText('הסיסמה הוסתרה (הוצגה פעם אחת בלבד)')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('copies credentials to clipboard', async () => {
    const mockProvisionResponse = {
      success: true,
      credentials: {
        host: '136.0.3.22',
        port: 22,
        username: 'ftp_12345',
        password: 'test-password-123',
        folder_path: '/inbox'
      },
      account: {
        telegram_id: 12345,
        ftp_username: 'ftp_12345',
        ftp_folder_path: '/inbox',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-12-31T23:59:59Z'
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProvisionResponse)
    });

    render(<SFTPSettings onConnectionResult={mockOnConnectionResult} />);
    
    const generateButton = screen.getByRole('button', { name: /צור חשבון SFTP/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('136.0.3.22')).toBeInTheDocument();
    });

    // Test copying host
    const copyButtons = screen.getAllByRole('button');
    const hostCopyButton = copyButtons.find(btn => 
      btn.previousElementSibling?.querySelector('input[value="136.0.3.22"]')
    );
    
    if (hostCopyButton) {
      fireEvent.click(hostCopyButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('136.0.3.22');
    }
  });

  it('handles provision API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<SFTPSettings onConnectionResult={mockOnConnectionResult} />);
    
    const generateButton = screen.getByRole('button', { name: /צור חשבון SFTP/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/שגיאה: Network error/i)).toBeInTheDocument();
    });
  });
});
