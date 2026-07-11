import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAppearance,
  getResolvedTheme,
  applySettings,
  fetchAndApplySettings,
} from "../lib/settings";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme, event?: React.MouseEvent<HTMLElement>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (getAppearance().theme as Theme) || "light";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    return getResolvedTheme(theme);
  });

  useEffect(() => {
    // Initial fetch from user settings API
    fetchAndApplySettings().then((settings) => {
      if (settings && settings.theme) {
        setThemeState(settings.theme as Theme);
        setResolvedTheme(getResolvedTheme(settings.theme));
      }
    });

    const handleSync = () => {
      const appearance = getAppearance();
      setThemeState((appearance.theme as Theme) || "light");
      setResolvedTheme(getResolvedTheme(appearance.theme));
    };

    window.addEventListener("appearance-changed", handleSync);
    return () => window.removeEventListener("appearance-changed", handleSync);
  }, []);

  const setTheme = (newTheme: Theme, event?: React.MouseEvent<HTMLElement>) => {
    const prevResolved = resolvedTheme;
    const nextResolved = getResolvedTheme(newTheme);

    if (prevResolved === nextResolved) {
      // Just update theme mode state if no actual color scheme transition is needed
      const appearance = getAppearance();
      appearance.theme = newTheme;
      applySettings(appearance);
      setThemeState(newTheme);
      setResolvedTheme(nextResolved);
      return;
    }

    const supportsViewTransition = (document as any).startViewTransition;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!supportsViewTransition || prefersReducedMotion || !event) {
      const appearance = getAppearance();
      appearance.theme = newTheme;
      applySettings(appearance);
      setThemeState(newTheme);
      setResolvedTheme(nextResolved);
      return;
    }

    // View Transition circular reveal effect
    document.documentElement.classList.add("view-transition-active");

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const transition = (document as any).startViewTransition(() => {
      const appearance = getAppearance();
      appearance.theme = newTheme;
      applySettings(appearance);
      setThemeState(newTheme);
      setResolvedTheme(nextResolved);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${x}px ${y}px)`,
      ];
      const animation = document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );

      animation.onfinish = () => {
        document.documentElement.classList.remove("view-transition-active");
      };
    });

    transition.finished.catch(() => {
      document.documentElement.classList.remove("view-transition-active");
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
