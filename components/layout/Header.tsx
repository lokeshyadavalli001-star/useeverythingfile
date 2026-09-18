"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  FileText,
  Minimize2,
  Scissors,
  Grid,
  Menu,
  X,
  Archive,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface-950/90 border-b border-surface-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-surface-50 flex items-center">
              EVERYTHING<span className="text-red-500">FILE</span>
            </span>
          </div>
        </Link>

        {/* Desktop Direct Tool Navigation (iLovePDF Style) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-surface-200">
          <Link
            href="/compress-file"
            className="hover:text-emerald-400 text-emerald-400 font-bold transition-colors py-1 flex items-center gap-1.5"
          >
            <Archive className="w-4 h-4 text-emerald-400" />
            <span>Compress File</span>
          </Link>
          <Link
            href="/merge-pdf"
            className="hover:text-red-500 transition-colors py-1 flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-red-500" />
            <span>Merge PDF</span>
          </Link>
          <Link
            href="/split-pdf"
            className="hover:text-red-500 transition-colors py-1 flex items-center gap-1.5"
          >
            <Scissors className="w-4 h-4 text-rose-500" />
            <span>Split PDF</span>
          </Link>
          <Link
            href="/compress-pdf"
            className="hover:text-red-500 transition-colors py-1 flex items-center gap-1.5"
          >
            <Minimize2 className="w-4 h-4 text-emerald-500" />
            <span>Compress PDF</span>
          </Link>
          <Link
            href="/pdf-to-word"
            className="hover:text-red-500 transition-colors py-1 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>PDF to Word</span>
          </Link>
          <Link
            href="/#tools"
            className="px-3.5 py-1.5 rounded-xl bg-surface-900 border border-surface-800 hover:border-red-500/40 hover:text-red-500 transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-surface-300"
          >
            <Grid className="w-3.5 h-3.5 text-red-500" />
            <span>All Tools</span>
          </Link>

          {/* Theme Switcher */}
          <div className="pl-2 border-l border-surface-800">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-surface-950 border-b border-surface-800 space-y-2">
          <Link
            href="/compress-file"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold"
          >
            <Archive className="w-5 h-5 text-emerald-400" />
            <span>Compress Any File</span>
          </Link>
          <Link
            href="/merge-pdf"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/60 text-surface-50 font-medium hover:bg-surface-850"
          >
            <Layers className="w-5 h-5 text-red-500" />
            <span>Merge PDF</span>
          </Link>
          <Link
            href="/split-pdf"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/60 text-surface-50 font-medium hover:bg-surface-850"
          >
            <Scissors className="w-5 h-5 text-rose-500" />
            <span>Split PDF</span>
          </Link>
          <Link
            href="/compress-pdf"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/60 text-surface-50 font-medium hover:bg-surface-850"
          >
            <Minimize2 className="w-5 h-5 text-emerald-500" />
            <span>Compress PDF</span>
          </Link>
          <Link
            href="/pdf-to-word"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/60 text-surface-50 font-medium hover:bg-surface-850"
          >
            <FileText className="w-5 h-5 text-blue-500" />
            <span>PDF to Word</span>
          </Link>
          <Link
            href="/#tools"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-red-600/10 border border-red-500/30 text-red-500 font-semibold"
          >
            <Grid className="w-5 h-5 text-red-500" />
            <span>All 23 Tools</span>
          </Link>

          {/* Theme Selector inside mobile drawer */}
          <div className="pt-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-surface-400 mb-2 px-1">
              Theme
            </span>
            <ThemeToggle variant="segmented" />
          </div>
        </div>
      )}
    </header>
  );
};
