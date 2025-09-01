
import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { SFTPSettings } from '../SFTPSettings';

// Mock fetch globally
global.fetch = vi.fn();

// Mock Telegram WebApp
const mockTelegramWebApp = {
  initDataUnsafe: {
    user: {
      id: 2084882603
    }
  }
};

// Set up window.Telegram mock
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: mockTelegramWebApp
  },
  writable: true
});

describe('SFTPSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockClear();
  });

  it('renders the SFTP settings component', () => {
    render(<SFTPSettings />);
    
    expect(screen.getByText('FTP מאובטח')).toBeInTheDocument();
    expect(screen.getByText('העלאה מאובטחת לתיקייה פרטית. העלו קבצים אל /inbox.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /צור חשבון SFTP/i })).toBeInTheDocument();
  });

  it('disables generate button when no Telegram ID is available', () => {
    // Temporarily remove Telegram mock
    delete (window as any).Telegram;
    
    render(<SFTPSettings />);
    
    const generateButton = screen.getByRole('button', { name: /צור חשבון SFTP/i });
    expect(generateButton).toBeDisabled();
    
    // Restore mock
    (window as any).Telegram = { WebApp: mockTelegramWebApp };
  });

  it('shows credentials after successful provision', async () => {
    // Mock successful provision response
    const mockCredentials = {
      host: '136.0.3.22',
      port: 22,
      username: 'test_user',
      password: 'test_password',
      folder_path: '/inbox'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCredentials
    });

    render(<SFTPSettings />);
    
    const generateButton = screen.getByRole('button', { name: /צור חשבון SFTP/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('136.0.3.22')).toBeInTheDocument();
      expect(screen.getByText('test_user')).toBeInTheDocument();
      expect(screen.getByText('test_password')).toBeInTheDocument();
      expect(screen.getByText('מוצג פעם אחת בלבד')).toBeInTheDocument();
    });
  });

  it('starts polling after provision and shows connection status', async () => {
    // Mock provision response
    const mockCredentials = {
      host: '136.0.3.22',
      port: 22,
      username: 'test_user',
      password: 'test_password',
      folder_path: '/inbox'
    };

    // Mock test connection responses
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredentials
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'pending' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success' })
      });

    render(<SFTPSettings />);
    
    const generateButton = screen.getByRole('button', { name: /צור חשבון SFTP/i });
    fireEvent.click(generateButton);

    // Wait for provision to complete
    await waitFor(() => {
      expect(screen.getByText('test_password')).toBeInTheDocument();
    });

    // Wait for polling to show pending status
    await waitFor(() => {
      expect(screen.getByText('בודק חיבור…')).toBeInTheDocument();
    });

    // Wait for success status
    await waitFor(() => {
      expect(screen.getByText('✅ מחובר')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows retry button on connection failure', async () => {
    // Mock provision response
    const mockCredentials = {
      host: '136.0.3.22',
      port: 22,
      username: 'test_user',
      password: 'test_password',
      folder_path: '/inbox'
    };

    // Mock failed connection
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredentials
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'failed' })
      });

    render(<SFTPSettings />);
    
    const generateButton = screen.getByRole('button', { name: /צור חשבון SFTP/i });
    fireEvent.click(generateButton);

    // Wait for failure status and retry button
    await waitFor(() => {
      expect(screen.getByText('❌ נכשל')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /סובב וננסה שוב/i })).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});
