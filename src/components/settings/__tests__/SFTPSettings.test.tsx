
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SFTPSettings } from '../SFTPSettings';

// Mock the hooks and components
vi.mock('@/context/TelegramAuthContext', () => ({
  useTelegramAuth: () => ({
    user: { id: 123456789 },
    isAuthenticated: true
  })
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}));

describe('SFTPSettings', () => {
  it('renders SFTP settings form', () => {
    render(<SFTPSettings />);
    
    expect(screen.getByText('SFTP Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('FTP Username')).toBeInTheDocument();
  });

  it('shows generate password button', () => {
    render(<SFTPSettings />);
    
    expect(screen.getByText('Generate New Password')).toBeInTheDocument();
  });

  it('allows saving settings', async () => {
    render(<SFTPSettings />);
    
    const saveButton = screen.getByText('Save Settings');
    expect(saveButton).toBeInTheDocument();
  });
});
