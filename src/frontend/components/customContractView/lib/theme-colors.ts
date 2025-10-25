export const lightTheme = {
  bg: '#f5f5f5',           // Light gray background
  bgSecondary: '#fafafa',
  border: '#d4d4d4',       // Neutral gray borders
  borderLight: '#e5e5e5',
  text: '#0a0a0a',         // Pure black text
  textSecondary: '#525252',
  textMuted: '#a3a3a3',
  primary: '#2563eb',      // Blue for highlights only
  primaryHover: '#1d4ed8',
  cardBg: '#ffffff',
  cardBorder: '#e0e0e0',
  cardShadow: '0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
  inputBg: '#fafafa',
  accent: '#f5f5f5',
  accentHover: '#eeeeee',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  errorBg: '#fef2f2',
  errorBorder: '#fca5a5',
  avatarBg: '#262626',
  avatarText: '#ffffff',
};

export const darkTheme = {
  bg: '#0a0a0a',           // Near black background
  bgSecondary: '#141414',
  border: '#2a2a2a',       // Dark gray borders
  borderLight: '#1f1f1f',
  text: '#fafafa',         // Off-white text
  textSecondary: '#a3a3a3',
  textMuted: '#666666',
  primary: '#3b82f6',      // Blue for highlights only
  primaryHover: '#2563eb',
  cardBg: '#141414',
  cardBorder: '#262626',
  cardShadow: '0 4px 8px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
  inputBg: '#0a0a0a',
  accent: '#1a1a1a',
  accentHover: '#262626',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  errorBg: '#7f1d1d',
  errorBorder: '#991b1b',
  avatarBg: '#fafafa',
  avatarText: '#0a0a0a',
};

export type ThemeColors = typeof lightTheme;
