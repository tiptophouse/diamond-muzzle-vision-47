
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SFTPSettings } from '../SFTPSettings';
import { sftpApi } from '@/lib/api/sftp';

// Mock the SFTP API
vi.mock('@/lib/api/sftp', () => ({
  sftpApi: {
    alive: vi.fn(),
    provision: vi.fn(),
    testConnection: vi.fn(),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Telegram WebApp
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      initDataUnsafe: {
        user: {
          id: 2138564172,
        },
      },
    },
  },
  writable: true,
});

describe('SFTP Settings Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show password only once and hide after connection test', async () => {
    // Mock successful provision
    (sftpApi.alive as any).mockResolvedValue({ ok: true });
    (sftpApi.provision as any).mockResolvedValue({
      success: true,
      credentials: {
        host: '136.0.3.22',
        port: 22,
        username: 'ftp_2138564172',
        password: 'one-time-password',
        folder_path: '/inbox',
      },
      account: {
        telegram_id: '2138564172',
        status: 'active',
      },
    });

    // Mock successful connection test
    (sftpApi.testConnection as any).mockResolvedValue({
      status: 'success',
      last_event: 'Connection successful',
    });

    render(<SFTPSettings />);

    // Click generate button
    const generateButton = screen.getByText('צור חשבון SFTP');
    fireEvent.click(generateButton);

    // Wait for provision to complete and password to show
    await waitFor(() => {
      expect(screen.getByDisplayValue('one-time-password')).toBeInTheDocument();
    });

    // Verify password is visible initially
    expect(screen.getByDisplayValue('one-time-password')).toBeInTheDocument();
    expect(screen.getByText('זוהי הפעם האחרונה שתוכל לראות את הסיסמה!')).toBeInTheDocument();

    // Wait for connection test to complete
    await waitFor(() => {
      expect(screen.getByText('מחובר')).toBeInTheDocument();
    });

    // Verify password is now hidden
    expect(screen.getByText('הסיסמה הוסתרה (הוצגה פעם אחת בלבד)')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('one-time-password')).not.toBeInTheDocument();
  });

  it('should show retry button on connection failure', async () => {
    // Mock successful provision
    (sftpApi.alive as any).mockResolvedValue({ ok: true });
    (sftpApi.provision as any).mockResolvedValue({
      success: true,
      credentials: {
        host: '136.0.3.22',
        port: 22,
        username: 'ftp_2138564172',
        password: 'one-time-password',
        folder_path: '/inbox',
      },
      account: {
        telegram_id: '2138564172',
        status: 'active',
      },
    });

    // Mock failed connection test
    (sftpApi.testConnection as any).mockResolvedValue({
      status: 'failed',
      last_event: 'Connection failed',
    });

    render(<SFTPSettings />);

    // Click generate button
    const generateButton = screen.getByText('צור חשבון SFTP');
    fireEvent.click(generateButton);

    // Wait for failure state
    await waitFor(() => {
      expect(screen.getByText('נכשל')).toBeInTheDocument();
    });

    // Verify retry button appears
    expect(screen.getByText('החלף סיסמה ונסה שוב')).toBeInTheDocument();

    // Verify password is hidden after failure
    expect(screen.getByText('הסיסמה הוסתרה (הוצגה פעם אחת בלבד)')).toBeInTheDocument();
  });

  it('should use fallback Telegram ID for local development', async () => {
    // Remove Telegram object
    delete (window as any).Telegram;

    (sftpApi.alive as any).mockResolvedValue({ ok: true });
    (sftpApi.provision as any).mockResolvedValue({
      success: true,
      credentials: {
        host: '136.0.3.22',
        port: 22,
        username: 'ftp_2138564172',
        password: 'fallback-password',
        folder_path: '/inbox',
      },
      account: {
        telegram_id: '2138564172',
        status: 'active',
      },
    });

    render(<SFTPSettings />);

    // Should show fallback Telegram ID
    expect(screen.getByText('Telegram ID: 2138564172')).toBeInTheDocument();

    // Should still allow generation
    const generateButton = screen.getByText('צור חשבון SFTP');
    expect(generateButton).not.toBeDisabled();
  });
});
