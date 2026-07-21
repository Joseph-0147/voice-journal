export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'echo-theme';

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return getSystemTheme();
}

export function setThemeMode(theme: ThemeMode) {
  if (typeof window === 'undefined') {
    return;
  }

  const root = window.document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function initializeTheme() {
  setThemeMode(getStoredTheme());
}