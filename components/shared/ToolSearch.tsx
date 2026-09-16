"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Layers,
  Scissors,
  Minimize2,
  FileCheck2,
  Zap,
  Image as ImageIcon,
  FileImage,
  Trash2,
  FolderDown,
  ArrowUpDown,
  RotateCw,
  AlignLeft,
  Minimize,
  Scaling,
  Crop,
  Sparkles,
  RefreshCw,
  ArrowLeftRight,
  FilePlus2,
  FileText,
  FileEdit,
} from "lucide-react";
import { TOOLS, ToolDefinition } from "@/lib/config/tools";

interface ToolStyle {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  cardHover: string;
}

const TOOL_STYLES: Record<string, ToolStyle> = {
  "merge-pdf": {
    icon: Layers,
    iconBg: "bg-red-500/15 text-red-500 border-red-500/30",
    cardHover: "hover:border-red-500/50 hover:shadow-red-500/5",
  },
  "split-pdf": {
    icon: Scissors,
    iconBg: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    cardHover: "hover:border-rose-500/50 hover:shadow-rose-500/5",
  },
  "compress-pdf": {
    icon: Minimize2,
    iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cardHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/5",
  },
  "compress-pdf-to-1mb": {
    icon: FileCheck2,
    iconBg: "bg-green-500/15 text-green-400 border-green-500/30",
    cardHover: "hover:border-green-500/50 hover:shadow-green-500/5",
  },
  "compress-pdf-to-500kb": {
    icon: Zap,
    iconBg: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    cardHover: "hover:border-teal-500/50 hover:shadow-teal-500/5",
  },
  "pdf-to-word": {
    icon: FileText,
    iconBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    cardHover: "hover:border-blue-500/50 hover:shadow-blue-500/5",
  },
  "word-to-pdf": {
    icon: FileEdit,
    iconBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    cardHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/5",
  },
  "pdf-to-jpg": {
    icon: ImageIcon,
    iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    cardHover: "hover:border-amber-500/50 hover:shadow-amber-500/5",
  },
  "jpg-to-pdf": {
    icon: FileImage,
    iconBg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    cardHover: "hover:border-yellow-500/50 hover:shadow-yellow-500/5",
  },
  "delete-pdf-pages": {
    icon: Trash2,
    iconBg: "bg-red-500/15 text-red-400 border-red-500/30",
    cardHover: "hover:border-red-500/50 hover:shadow-red-500/5",
  },
  "extract-pdf-pages": {
    icon: FolderDown,
    iconBg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    cardHover: "hover:border-purple-500/50 hover:shadow-purple-500/5",
  },
  "reorder-pdf": {
    icon: ArrowUpDown,
    iconBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    cardHover: "hover:border-cyan-500/50 hover:shadow-cyan-500/5",
  },
  "rotate-pdf": {
    icon: RotateCw,
    iconBg: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    cardHover: "hover:border-sky-500/50 hover:shadow-sky-500/5",
  },
  "pdf-to-text": {
    icon: AlignLeft,
    iconBg: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    cardHover: "hover:border-teal-500/50 hover:shadow-teal-500/5",
  },
  "compress-image": {
    icon: Minimize,
    iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cardHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/5",
  },
  "resize-image": {
    icon: Scaling,
    iconBg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    cardHover: "hover:border-purple-500/50 hover:shadow-purple-500/5",
  },
  "crop-image": {
    icon: Crop,
    iconBg: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    cardHover: "hover:border-pink-500/50 hover:shadow-pink-500/5",
  },
  "jpg-to-png": {
    icon: Sparkles,
    iconBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    cardHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/5",
  },
  "png-to-jpg": {
    icon: RefreshCw,
    iconBg: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    cardHover: "hover:border-orange-500/50 hover:shadow-orange-500/5",
  },
  "jpg-to-webp": {
    icon: Zap,
    iconBg: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    cardHover: "hover:border-sky-500/50 hover:shadow-sky-500/5",
  },
  "webp-to-jpg": {
    icon: ArrowLeftRight,
    iconBg: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
    cardHover: "hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/5",
  },
  "image-to-pdf": {
    icon: FilePlus2,
    iconBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    cardHover: "hover:border-rose-500/50 hover:shadow-rose-500/5",
  },
};

type FilterCategory = "all" | "pdf" | "image" | "convert";

export const ToolSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      // Category filter logic
      if (selectedCategory === "pdf") {
        if (tool.category !== "pdf" && tool.slug !== "pdf-to-word" && tool.slug !== "word-to-pdf") {
          return false;
        }
      } else if (selectedCategory === "image") {
        if (tool.category !== "image") return false;
      } else if (selectedCategory === "convert") {
        const isConvert =
          tool.slug.includes("to") ||
          tool.category === "document";
        if (!isConvert) return false;
      }

      // Search filter logic
      if (!query.trim()) return true;

      const q = query.toLowerCase().trim();
      const nameMatch = tool.name.toLowerCase().includes(q);
      const taglineMatch = tool.tagline.toLowerCase().includes(q);
      const descMatch = tool.description.toLowerCase().includes(q);
      const keywordMatch = tool.seoKeywords.some((k) => k.toLowerCase().includes(q));

      return nameMatch || taglineMatch || descMatch || keywordMatch;
    });
  }, [query, selectedCategory]);

  return (
    <div className="w-full">
      {/* Category Tabs & Search Bar */}
      <div className="max-w-3xl mx-auto mb-10 space-y-5">
        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { id: "all", label: "All Tools", count: 22 },
            { id: "pdf", label: "PDF Tools", count: 14 },
            { id: "image", label: "Image Tools", count: 8 },
            { id: "convert", label: "Convert", count: 10 },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as FilterCategory)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/25 scale-105"
                  : "bg-surface-900 border border-surface-800 text-surface-300 hover:text-white hover:bg-surface-800"
              }`}
            >
              {cat.label}{" "}
              <span
                className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                  selectedCategory === cat.id
                    ? "bg-white/20 text-white"
                    : "bg-surface-800 text-surface-400"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all services (e.g. merge, split, compress, word, jpg, resize, crop)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-surface-900/90 border border-surface-800 text-white placeholder-surface-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm sm:text-base transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded bg-surface-800 text-surface-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Services Grid (iLovePDF Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredTools.map((tool) => {
          const style = TOOL_STYLES[tool.slug] || {
            icon: Layers,
            iconBg: "bg-red-500/15 text-red-500 border-red-500/30",
            cardHover: "hover:border-red-500/50 hover:shadow-red-500/5",
          };
          const IconComponent = style.icon;

          return (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className={`group relative p-6 rounded-2xl bg-surface-900/90 border border-surface-800/90 ${style.cardHover} transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between`}
            >
              <div>
                {/* Colorful Service Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${style.iconBg} border flex items-center justify-center transition-transform group-hover:scale-110 mb-4`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Service Name */}
                <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors mb-2">
                  {tool.name}
                </h3>

                {/* Short Description */}
                <p className="text-xs text-surface-400 leading-relaxed line-clamp-3">
                  {tool.tagline}
                </p>
              </div>

              {/* Bottom Action Hint */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-800/80 text-xs font-semibold text-surface-400 group-hover:text-red-400 transition-colors">
                <span>Select Service</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16 bg-surface-900/40 rounded-3xl border border-surface-800">
          <p className="text-surface-300 text-base font-semibold mb-1">
            No services found matching &quot;{query}&quot;
          </p>
          <p className="text-xs text-surface-400">
            Try searching for &quot;merge&quot;, &quot;compress&quot;, &quot;word&quot;, or &quot;jpg&quot;
          </p>
        </div>
      )}
    </div>
  );
};
