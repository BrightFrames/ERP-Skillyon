import api from "./api";

export interface AppearanceSettings {
  theme: string;
  density: string;
  language: string;
}

let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;
let systemThemeQuery: MediaQueryList | null = null;

export function getResolvedTheme(theme: string): "light" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function applyDensityClass(density: string) {
  const root = document.documentElement;
  root.classList.remove(
    "density-compact",
    "density-comfortable",
    "density-spacious",
  );
  root.classList.add(`density-${density || "comfortable"}`);
}

function applyThemeClass(theme: string) {
  const root = document.documentElement;

  if (systemThemeListener && systemThemeQuery) {
    systemThemeQuery.removeEventListener("change", systemThemeListener);
    systemThemeListener = null;
    systemThemeQuery = null;
  }

  if (theme === "system" && typeof window !== "undefined") {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = () => {
      const resolvedTheme = media.matches ? "dark" : "light";
      root.classList.toggle("dark", resolvedTheme === "dark");
      root.style.colorScheme = resolvedTheme;
    };

    applySystemTheme();
    systemThemeQuery = media;
    systemThemeListener = () => applySystemTheme();
    media.addEventListener("change", systemThemeListener);
    return;
  }

  const resolvedTheme = getResolvedTheme(theme);
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
}

function applyAppearanceClasses(appearance: AppearanceSettings) {
  applyDensityClass(appearance.density);
  applyThemeClass(appearance.theme);
}

export function getAppearance(): AppearanceSettings {
  try {
    const cached = localStorage.getItem("appearance");
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        theme: parsed.theme || "light",
        density: parsed.density || "comfortable",
        language: parsed.language || "English",
      };
    }
  } catch (e) {
    console.error("Failed to parse appearance from localStorage", e);
  }
  return {
    theme: "light",
    density: "comfortable",
    language: "English",
  };
}

export function syncAppearance() {
  applyAppearanceClasses(getAppearance());
}

export function applySettings(appearance: AppearanceSettings) {
  if (!appearance) return;

  applyAppearanceClasses(appearance);

  // Store in localStorage
  localStorage.setItem("appearance", JSON.stringify(appearance));

  // Dispatch event for reactive updates in React components (e.g. language translation)
  window.dispatchEvent(new Event("appearance-changed"));
}

export async function fetchAndApplySettings() {
  try {
    const res = await api.get("/user/settings");
    if (
      res.data &&
      res.data.appearance &&
      Object.keys(res.data.appearance).length > 0
    ) {
      applySettings(res.data.appearance);
      return res.data.appearance;
    }
  } catch (error) {
    console.error("Failed to fetch settings from API", error);
  }

  // Fallback to cached settings if API fails or is empty
  const cached = getAppearance();
  applySettings(cached);
  return cached;
}
