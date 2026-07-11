import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const handleToggle = (event) => {
    const nextTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(nextTheme, event);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-slate-200/50 bg-white/60 backdrop-blur-md shadow-sm hover:shadow-md dark:border-slate-800/50 dark:bg-slate-900/60 dark:shadow-[0_0_15px_rgba(99,102,241,0.15)] text-slate-700 dark:text-indigo-400 cursor-pointer overflow-hidden outline-none select-none"
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      title={resolvedTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label={resolvedTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <span className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />

      <AnimatePresence mode="wait" initial={false}>
        {resolvedTheme === "light" ? (
          <motion.span
            key="sun"
            className="flex items-center justify-center"
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Sun size={18} strokeWidth={2.5} className="text-amber-500 filter drop-shadow-[0_0_2px_rgba(245,158,11,0.2)]" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            className="flex items-center justify-center"
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Moon size={18} strokeWidth={2.5} className="text-indigo-400 filter drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
