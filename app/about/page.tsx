import React from "react";
import { Layers, ShieldCheck, Heart, Zap, Sparkles } from "lucide-react";

export const metadata = {
  title: "About Us — Everything File",
  description: "Learn about the mission, architecture, and principles behind Everything File.",
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-500/20">
          <Layers className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          About Everything File
        </h1>
        <p className="text-surface-300 text-sm sm:text-base leading-relaxed">
          Building a modern, zero-compromise, zero-cost file utility platform.
        </p>
      </div>

      <div className="space-y-10 text-surface-300 text-sm leading-relaxed">
        <div className="p-8 rounded-3xl bg-surface-900 border border-surface-800 space-y-4">
          <h2 className="text-xl font-bold text-white">Our Mission</h2>
          <p className="text-xs text-surface-400 leading-relaxed">
            Every day, millions of people search for simple file tools: merging a PDF, compressing an image, or extracting a few pages. Unfortunately, most websites today force users to upload sensitive files to unknown cloud servers, demand expensive monthly subscriptions, or bombard users with intrusive tracking ads.
          </p>
          <p className="text-xs text-surface-400 leading-relaxed">
            Everything File was created to provide a completely free, privacy-first alternative. By taking advantage of modern browser capabilities like WebAssembly and hardware-accelerated canvas rendering, we make document processing faster, cheaper, and inherently private.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-900/60 border border-surface-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Privacy First</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              We believe files belong to the user. We never read, store, or sell document contents.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-900/60 border border-surface-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Zero Operating Cost</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Eliminating server cloud storage and CPU bottlenecks allows us to keep the platform free indefinitely.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-900/60 border border-surface-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Open Web Standards</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Built on standard HTML5, CSS, TypeScript, and open-source PDF and document toolchains.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
