/**
 * Telegram Mini App Native Theme System
 * Uses Telegram theme parameters for native look on iOS/Android
 */

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
  bottom_bar_bg_color?: string;
}

export function getTelegramThemeParams(): TelegramThemeParams {
  if (typeof window === 'undefined') return {};

  try {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return {};

    return tg.themeParams || {};
  } catch (error) {
    console.warn('Failed to get Telegram theme params:', error);
    return {};
  }
}

export function applyTelegramTheme() {
  const themeParams = getTelegramThemeParams();
  const root = document.documentElement;

  if (themeParams.bg_color) {
    root.style.setProperty('--tg-bg', themeParams.bg_color);
  }
  if (themeParams.text_color) {
    root.style.setProperty('--tg-text', themeParams.text_color);
  }
  if (themeParams.hint_color) {
    root.style.setProperty('--tg-hint', themeParams.hint_color);
  }
  if (themeParams.button_color) {
    root.style.setProperty('--tg-button-bg', themeParams.button_color);
  }
  if (themeParams.button_text_color) {
    root.style.setProperty('--tg-button-text', themeParams.button_text_color);
  }
  if (themeParams.secondary_bg_color) {
    root.style.setProperty('--tg-secondary-bg', themeParams.secondary_bg_color);
  }
  if (themeParams.accent_text_color) {
    root.style.setProperty('--tg-accent', themeParams.accent_text_color);
  }
  if (themeParams.destructive_text_color) {
    root.style.setProperty('--tg-destructive', themeParams.destructive_text_color);
  }
  if (themeParams.header_bg_color) {
    root.style.setProperty('--tg-header-bg', themeParams.header_bg_color);
  }

  // Apply to Tailwind CSS variables
  if (themeParams.bg_color) {
    const rgb = hexToRgb(themeParams.bg_color);
    root.style.setProperty('--background', `${rgb.r} ${rgb.g} ${rgb.b}`);
  }
  if (themeParams.text_color) {
    const rgb = hexToRgb(themeParams.text_color);
    root.style.setProperty('--foreground', `${rgb.r} ${rgb.g} ${rgb.b}`);
  }
  if (themeParams.button_color) {
    const rgb = hexToRgb(themeParams.button_color);
    root.style.setProperty('--primary', `${rgb.r} ${rgb.g} ${rgb.b}`);
  }
  if (themeParams.button_text_color) {
    const rgb = hexToRgb(themeParams.button_text_color);
    root.style.setProperty('--primary-foreground', `${rgb.r} ${rgb.g} ${rgb.b}`);
  }
  if (themeParams.secondary_bg_color) {
    const rgb = hexToRgb(themeParams.secondary_bg_color);
    root.style.setProperty('--card', `${rgb.r} ${rgb.g} ${rgb.b}`);
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;
}

export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  return (window as any).Telegram?.WebApp || null;
}

export function expandTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (tg?.expand) {
    tg.expand();
  }
}

export function setTelegramHeaderColor(color: string) {
  const tg = getTelegramWebApp();
  if (tg?.setHeaderColor) {
    tg.setHeaderColor(color);
  }
}

export function setTelegramBackgroundColor(color: string) {
  const tg = getTelegramWebApp();
  if (tg?.setBackgroundColor) {
    tg.setBackgroundColor(color);
  }
}
