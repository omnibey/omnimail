'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC<{ className?: string; showLabel?: boolean }> = ({
  className = '',
  showLabel = false,
}) => {
  const { actualTheme, toggleTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 animate-pulse ${className}`} />
    );
  }

  const isDark = actualTheme === 'dark';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={toggleTheme}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'} (Click to toggle)`}
        className={`group relative flex items-center p-1 rounded-xl transition-all duration-300 border shadow-xs select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600'
            : 'bg-slate-100 border-slate-250 text-slate-700 hover:border-slate-300'
        }`}
      >
        {/* Sliding background pill indicator */}
        <div
          className={`absolute top-1 bottom-1 w-7 rounded-lg transition-all duration-300 ease-out shadow-sm ${
            isDark
              ? 'left-[calc(100%-32px)] bg-indigo-600/90 text-white shadow-indigo-500/20'
              : 'left-1 bg-white text-amber-500 shadow-slate-300/50'
          }`}
        />

        {/* Light Option Icon */}
        <span
          className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200 ${
            !isDark ? 'text-amber-500 font-bold' : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
        </span>

        {/* Dark Option Icon */}
        <span
          className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200 ${
            isDark ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-600'
          }`}
        >
          <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12" />
        </span>

        {showLabel && (
          <span className="relative z-10 text-xs font-semibold px-2">
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
      </button>
    </div>
  );
};
