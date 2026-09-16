"use client";

import React from "react";
import Link from "next/link";
import { ToolDefinition, TOOLS } from "@/lib/config/tools";
import { HelpCircle, ArrowRight } from "lucide-react";

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ tool, children }) => {
  // Find 3 related tools in same category
  const relatedTools = TOOLS.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug
  ).slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Tool Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
          {tool.name}
        </h1>
        <p className="text-base sm:text-lg text-surface-300 font-normal leading-relaxed">
          {tool.tagline}
        </p>
      </div>

      {/* Main Tool Interaction Workspace */}
      <div className="mb-16">{children}</div>

      {/* How it Works / 3 Simple Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-surface-900/60 border border-surface-800">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold flex items-center justify-center mb-4 text-base">
            1
          </div>
          <h4 className="text-base font-semibold text-white mb-2">Select Your Files</h4>
          <p className="text-xs text-surface-400 leading-relaxed">
            Choose or drop your {tool.acceptedExtensions.join("/")} files directly from your computer or phone.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface-900/60 border border-surface-800">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold flex items-center justify-center mb-4 text-base">
            2
          </div>
          <h4 className="text-base font-semibold text-white mb-2">Configure & Process</h4>
          <p className="text-xs text-surface-400 leading-relaxed">
            Customize options like page order or compression, and start processing with one click.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface-900/60 border border-surface-800">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold flex items-center justify-center mb-4 text-base">
            3
          </div>
          <h4 className="text-base font-semibold text-white mb-2">Download Result</h4>
          <p className="text-xs text-surface-400 leading-relaxed">
            Instantly download your processed file with original quality maintained.
          </p>
        </div>
      </div>

      {/* FAQs Section */}
      {tool.faqs.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-red-400" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {tool.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-900/50 border border-surface-800 text-left"
              >
                <h4 className="text-base font-semibold text-white mb-2">{faq.question}</h4>
                <p className="text-sm text-surface-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-6">Related Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((rel) => (
              <Link
                key={rel.slug}
                href={`/${rel.slug}`}
                className="p-5 rounded-2xl bg-surface-900/60 hover:bg-surface-850 border border-surface-800 hover:border-red-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">{rel.name}</h4>
                  <p className="text-xs text-surface-400 line-clamp-2">{rel.tagline}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-red-400 mt-4">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
