import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import {
  getAppearance,
  getResolvedTheme,
  applySettings,
} from "../lib/settings";

export default function ThemeToggle() {
  const [activeTheme, setActiveTheme] = useState(() =>
    getResolvedTheme(getAppearance().theme),
  );

  useEffect(() => {
    const handleSync = () => {
      const appearance = getAppearance();
      setActiveTheme(getResolvedTheme(appearance.theme));
    };
    window.addEventListener("appearance-changed", handleSync);
    return () => window.removeEventListener("appearance-changed", handleSync);
  }, []);

  const toggleTheme = (selectedTheme: "light" | "dark", event: React.MouseEvent<HTMLButtonElement>) => {
    if (activeTheme === selectedTheme) return;

    const supportsViewTransition = (document as any).startViewTransition;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!supportsViewTransition || prefersReducedMotion) {
      const appearance = getAppearance();
      appearance.theme = selectedTheme;
      applySettings(appearance);
      setActiveTheme(selectedTheme);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const transition = (document as any).startViewTransition(() => {
      const appearance = getAppearance();
      appearance.theme = selectedTheme;
      applySettings(appearance);
      setActiveTheme(selectedTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <div className="flex items-center bg-card/85 backdrop-blur-md border border-border p-1 rounded-full shadow-inner relative select-none">
      {/* Light Option */}
      <button
        onClick={(e) => toggleTheme("light", e)}
        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 cursor-pointer ${
          activeTheme === "light"
            ? "text-primary-foreground bg-primary shadow-[0_2px_10px_rgba(91,61,245,0.4)] scale-105"
            : "text-muted-foreground hover:text-foreground hover:scale-105"
        }`}
        title="Light Mode"
      >
        <Sun
          size={16}
          strokeWidth={2.5}
          className={
            activeTheme === "light"
              ? "drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]"
              : ""
          }
        />
      </button>

      {/* Dark Option */}
      <button
        onClick={(e) => toggleTheme("dark", e)}
        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 cursor-pointer ${
          activeTheme === "dark"
            ? "text-primary-foreground bg-primary shadow-[0_2px_10px_rgba(91,61,245,0.4)] scale-105"
            : "text-muted-foreground hover:text-foreground hover:scale-105"
        }`}
        title="Dark Mode"
      >
        <Moon
          size={16}
          strokeWidth={2.5}
          className={
            activeTheme === "dark"
              ? "drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]"
              : ""
          }
        />
      </button>
    </div>
  );
}
