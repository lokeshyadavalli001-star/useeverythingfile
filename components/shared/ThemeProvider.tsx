"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      const initialTheme: Theme =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "system";
      setThemeState(initialTheme);

      const isSystemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const effectiveTheme =
        initialTheme === "dark" ||
        (initialTheme === "system" && isSystemDark)
          ? "dark"
          : "light";

      setResolvedTheme(effectiveTheme);
      if (effectiveTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      // LocalStorage unavailable
    }
    setMounted(true);
  }, []);

  // Update DOM & LocalStorage on change
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch (e) {}

    const isSystemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const effectiveTheme =
      newTheme === "dark" || (newTheme === "system" && isSystemDark)
        ? "dark"
        : "light";

    setResolvedTheme(effectiveTheme);
    if (effectiveTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Listen to OS system theme changes
  useEffect(() => {
    if (!mounted) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const effectiveTheme = e.matches ? "dark" : "light";
        setResolvedTheme(effectiveTheme);
        if (effectiveTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
