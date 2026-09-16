"use client";

import React from "react";
import { Download, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

interface ResultCardProps {
  filename: string;
  downloadUrl: string;
  originalSizeBytes?: number;
  resultSizeBytes?: number;
  onReset: () => void;
  title?: string;
  subtitle?: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  filename,
  downloadUrl,
  originalSizeBytes,
  resultSizeBytes,
  onReset,
  title = "Your file is ready! 🎉",
  subtitle = "The operation completed successfully.",
}) => {
  const hasSavings =
    originalSizeBytes &&
    resultSizeBytes &&
    originalSizeBytes > 0 &&
    resultSizeBytes < originalSizeBytes;

  const percentSaved = hasSavings
    ? Math.round(((originalSizeBytes - resultSizeBytes) / originalSizeBytes) * 100)
    : null;

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-2xl bg-surface-900 border border-surface-700/80 shadow-2xl text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-surface-400 mb-6">{subtitle}</p>

      {/* Size Comparison Card */}
      {originalSizeBytes !== undefined && (
        <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-surface-950/80 border border-surface-800 mb-6">
          <div>
            <span className="block text-xs uppercase tracking-wider text-surface-400">Original</span>
            <span className="text-base font-semibold text-surface-300">
              {formatBytes(originalSizeBytes)}
            </span>
          </div>

          <ArrowRight className="w-5 h-5 text-surface-400" />

          <div>
            <span className="block text-xs uppercase tracking-wider text-surface-400">Result</span>
            <span className="text-base font-semibold text-emerald-400">
              {formatBytes(resultSizeBytes)}
            </span>
          </div>

          {percentSaved !== null && (
            <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              -{percentSaved}%
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={downloadUrl}
          download={filename}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-95"
        >
          <Download className="w-5 h-5" />
          <span>Download {filename.length > 20 ? filename.slice(0, 18) + "..." : filename}</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 font-medium transition-colors border border-surface-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Process Another</span>
        </button>
      </div>
    </div>
  );
};
