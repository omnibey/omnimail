'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme mode"
      title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-xl transition-all duration-200 border ${
        actualTheme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-850'
          : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 shadow-sm'
      } ${className}`}
    >
      {actualTheme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12 text-indigo-600" />
      )}
    </button>
  );
};
