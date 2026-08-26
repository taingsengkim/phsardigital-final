"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Not part of the homepage sections you asked for — this belongs in your
 * navbar. Included so night mode is actually reachable once you wire it in.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  // The server cannot know the saved browser theme, so reserve the button's
  // space until hydration without triggering an extra effect-driven render.
  if (!mounted) return <div className="h-8 w-8 sm:h-9 sm:w-9" />;

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1EFFA] text-primary transition-colors hover:bg-accent hover:text-accent-foreground sm:h-9 sm:w-9 dark:bg-muted dark:text-foreground"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </motion.button>
  );
}
