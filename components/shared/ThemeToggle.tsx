"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, Theme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  variant?: "dropdown" | "segmented";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  variant = "dropdown",
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: Array<{ id: Theme; label: string; icon: React.ReactNode }> = [
    {
      id: "light",
      label: "Light",
      icon: <Sun className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "dark",
      label: "Dark",
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: "system",
      label: "System default",
      icon: <Monitor className="w-4 h-4 text-surface-400" />,
    },
  ];

  if (variant === "segmented") {
    return (
      <div
        className={`flex items-center p-1 rounded-xl bg-surface-900 border border-surface-800 ${className}`}
      >
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              theme === opt.id
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-surface-400 hover:text-surface-100"
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle display theme"
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        className="p-2 rounded-xl bg-surface-900 border border-surface-800 hover:border-surface-700 text-surface-300 hover:text-white transition-colors flex items-center justify-center shadow-sm"
      >
        {resolvedTheme === "light" ? (
          <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-400 transition-transform hover:-rotate-12" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-surface-900 border border-surface-700 shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-surface-400 border-b border-surface-800/80 mb-1">
            Display Theme
          </div>

          {options.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-surface-800 text-white"
                    : "text-surface-400 hover:text-white hover:bg-surface-850"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-red-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
