import api from './api';

export interface AppearanceSettings {
  theme: string;
  density: string;
  language: string;
}

export function getResolvedTheme(theme: string): "light" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;
let systemThemeQuery: MediaQueryList | null = null;

export function getAppearance(): AppearanceSettings {
  try {
    const cached = localStorage.getItem('appearance');
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        theme: parsed.theme || 'light',
        density: parsed.density || 'comfortable',
        language: parsed.language || 'English',
      };
    }
  } catch (e) {
    console.error('Failed to parse appearance settings', e);
  }
  return {
    theme: 'light',
    density: 'comfortable',
    language: 'English',
  };
}


export function syncAppearance() {
  applySettings(getAppearance());
}

export function applySettings(appearance: AppearanceSettings) {
  if (!appearance) return;
  const root = document.documentElement;

  // Cleanup old listener
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (systemThemeListener && systemThemeQuery) {
    systemThemeQuery.removeEventListener('change', systemThemeListener);
    systemThemeListener = null;
    systemThemeQuery = null;
  }

  // 1. Apply Theme
  const setDarkClass = (isDark: boolean) => {
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  };

  if (appearance.theme === 'dark') {
    setDarkClass(true);
  } else if (appearance.theme === 'light') {
    setDarkClass(false);
  } else {
    // System Theme
    setDarkClass(mediaQuery.matches);
    systemThemeListener = (e: MediaQueryListEvent) => {
      setDarkClass(e.matches);
    };
    systemThemeQuery = mediaQuery;
    mediaQuery.addEventListener('change', systemThemeListener);
  }

  root.style.colorScheme = getResolvedTheme(appearance.theme);

  // 2. Apply Density
  root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
  root.classList.add(`density-${appearance.density || 'comfortable'}`);

  // 3. Save cache
  localStorage.setItem('appearance', JSON.stringify(appearance));

  // 4. Trigger window event for reactive states
  window.dispatchEvent(new Event('appearance-changed'));
}

export async function fetchAndApplySettings() {
  try {
    const token = localStorage.getItem('sa_token');
    if (!token) return getAppearance();

    const res = await api.get('/user/settings');
    if (res.status === 200 && res.data && res.data.appearance && Object.keys(res.data.appearance).length > 0) {
      applySettings(res.data.appearance);
      return res.data.appearance;
    }
  } catch (error) {
    console.error('Failed to fetch settings from API', error);
  }

  const cached = getAppearance();
  applySettings(cached);
  return cached;
}
