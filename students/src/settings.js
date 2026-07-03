export function getAppearance() {
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
    console.error('Failed to parse appearance from localStorage', e);
  }
  return {
    theme: 'light',
    density: 'comfortable',
    language: 'English',
  };
}

let systemThemeListener = null;

export function applySettings(appearance) {
  if (!appearance) return;
  const root = document.documentElement;

  // Cleanup old listener if any
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (systemThemeListener) {
    mediaQuery.removeEventListener('change', systemThemeListener);
    systemThemeListener = null;
  }

  // 1. Apply Theme class
  const setDarkClass = (isDark) => {
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
    systemThemeListener = (e) => {
      setDarkClass(e.matches);
    };
    mediaQuery.addEventListener('change', systemThemeListener);
  }

  // 2. Apply Density class
  root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
  root.classList.add(`density-${appearance.density || 'comfortable'}`);

  // 3. Store in localStorage
  localStorage.setItem('appearance', JSON.stringify(appearance));

  // 4. Dispatch event for reactive updates in React components
  window.dispatchEvent(new Event('appearance-changed'));
}

export async function fetchAndApplySettings() {
  try {
    const token = localStorage.getItem('student_token');
    if (!token) return getAppearance();

    const res = await fetch('/api/user/settings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.appearance && Object.keys(data.appearance).length > 0) {
        applySettings(data.appearance);
        return data.appearance;
      }
    }
  } catch (error) {
    console.error('Failed to fetch settings from API', error);
  }
  
  // Fallback to cached settings if API fails or is empty
  const cached = getAppearance();
  applySettings(cached);
  return cached;
}
