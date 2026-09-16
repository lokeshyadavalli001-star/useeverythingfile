import React from "react";
import Link from "next/link";
import { Cpu, HardDrive, ShieldCheck, ArrowRight, CheckCircle2, Lock } from "lucide-react";

export const metadata = {
  title: "How It Works — Everything File",
  description: "Learn how Everything File combines on-device processing with isolated sandbox conversion.",
};

export default function HowItWorksPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          How Everything File Works
        </h1>
        <p className="text-surface-300 text-sm sm:text-base leading-relaxed">
          The difference between traditional file sites and our browser-first architecture.
        </p>
      </div>

      <div className="space-y-12">
        {/* Comparison Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Legacy Cloud Sites */}
          <div className="p-6 rounded-3xl bg-surface-900 border border-surface-800 space-y-4 opacity-75">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              Traditional File Sites
            </span>
            <h3 className="text-base font-bold text-white">Legacy Server Pipeline</h3>
            <div className="space-y-3 font-mono text-xs text-surface-400">
              <div className="p-3 rounded-xl bg-surface-950 border border-surface-800">
                1. Upload full file across the Internet
              </div>
              <div className="p-3 rounded-xl bg-surface-950 border border-surface-800">
                2. Server stores document on cloud disk
              </div>
              <div className="p-3 rounded-xl bg-surface-950 border border-surface-800">
                3. Server processes file in queue
              </div>
              <div className="p-3 rounded-xl bg-surface-950 border border-surface-800">
                4. Download link generated; file stays in cloud storage
              </div>
            </div>
            <p className="text-xs text-red-300/80">
              Drawback: High cloud bandwidth costs, privacy risks, and slow upload queues.
            </p>
          </div>

          {/* Everything File Browser-First */}
          <div className="p-6 rounded-3xl bg-surface-900 border border-brand-500/50 shadow-xl shadow-brand-500/5 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Everything File
            </span>
            <h3 className="text-base font-bold text-white">Browser-First Pipeline</h3>
            <div className="space-y-3 font-mono text-xs text-surface-300">
              <div className="p-3 rounded-xl bg-surface-950 border border-emerald-500/30 text-emerald-300">
                1. File read directly into browser memory
              </div>
              <div className="p-3 rounded-xl bg-surface-950 border border-emerald-500/30 text-emerald-300">
                2. High-performance engine processes file locally on your device
              </div>
              <div className="p-3 rounded-xl bg-surface-950 border border-emerald-500/30 text-emerald-300">
                3. Instant in-memory result generation (0 network transfer)
              </div>
              <div className="p-3 rounded-xl bg-surface-950 border border-emerald-500/30 text-emerald-300">
                4. Direct browser download; zero file retention
              </div>
            </div>
            <p className="text-xs text-emerald-400">
              Benefit: Zero server operating costs, instantaneous processing, and 100% data privacy.
            </p>
          </div>
        </div>

        {/* Conversion Subsystem Explanation */}
        <div className="p-8 rounded-3xl bg-surface-900/60 border border-surface-800 space-y-4">
          <h3 className="text-lg font-bold text-white">What about PDF ↔ Word conversion?</h3>
          <p className="text-xs text-surface-400 leading-relaxed">
            Format conversion between PDF and Word requires specialized document layout engines. For this, Everything File offers two distinct processing options:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400">In-Browser Generator</h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                Extracts headings, paragraphs, and text layouts to generate real DOCX files directly inside your browser without any network requests.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
              <h4 className="text-xs font-bold text-brand-400">Isolated Sandbox Worker</h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                A dedicated, non-networked conversion worker that validates inputs, processes the document, and immediately purges all data upon response.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
