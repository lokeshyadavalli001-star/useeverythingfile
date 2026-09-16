"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { Split, Loader2, FileText, CheckCircle2 } from "lucide-react";

export default function SplitPdfPage() {
  const tool = TOOL_MAP.get("split-pdf")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [splitMode, setSplitMode] = useState<"ranges" | "all">("ranges");
  const [rangeString, setRangeString] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState("split_document.pdf");
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);

    try {
      const buffer = await selected.arrayBuffer();
      const meta = await ClientPDFOps.inspectPDF(buffer);
      setPageCount(meta.pageCount);
      setRangeString(`1-${Math.min(meta.pageCount, 3)}`);
    } catch (err) {
      setError("Could not parse PDF metadata. File may be encrypted or corrupted.");
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const res = await ClientPDFOps.splitPDF(buffer, {
        mode: splitMode,
        rangeString,
        baseFilename: file.name.replace(/\.pdf$/i, ""),
      });

      const url = URL.createObjectURL(res.data);
      setDownloadUrl(url);
      setResultFilename(res.filename);
      setResultSize(res.data.size);
    } catch (err: any) {
      setError(err?.message || "Failed to split PDF. Please check your page ranges.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(null);
    setPageCount(null);
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <ResultCard
          filename={resultFilename}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="PDF Split Successfully! 🎉"
          subtitle="Your extracted pages are ready for immediate download."
        />
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <FileDropzone
              acceptedExtensions={[".pdf"]}
              maxFiles={1}
              onFilesSelected={handleFileSelected}
              title="Drop PDF to split"
              subtitle="Select the document you want to extract pages from"
            />
          ) : (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-6">
              {/* File Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-950 border border-surface-800">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">{file.name}</h4>
                  <p className="text-xs text-surface-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {pageCount ?? "..."} Total Pages
                  </p>
                </div>
              </div>

              {/* Mode Select */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                  Split Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSplitMode("ranges")}
                    className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                      splitMode === "ranges"
                        ? "bg-brand-600/20 border-brand-500 text-brand-300"
                        : "bg-surface-950 border-surface-800 text-surface-400 hover:text-white"
                    }`}
                  >
                    Custom Ranges
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode("all")}
                    className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                      splitMode === "all"
                        ? "bg-brand-600/20 border-brand-500 text-brand-300"
                        : "bg-surface-950 border-surface-800 text-surface-400 hover:text-white"
                    }`}
                  >
                    Extract All Pages to ZIP
                  </button>
                </div>
              </div>

              {splitMode === "ranges" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-surface-300">
                    Page Ranges (e.g. 1-3, 5, 7-{pageCount || 10})
                  </label>
                  <input
                    type="text"
                    value={rangeString}
                    onChange={(e) => setRangeString(e.target.value)}
                    placeholder="e.g. 1-2, 4"
                    className="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-800 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                  <p className="text-[11px] text-surface-400">
                    Use commas to separate multiple individual pages or hyphenated ranges.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm font-medium transition-colors"
                >
                  Change File
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSplit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting in Browser...</span>
                    </>
                  ) : (
                    <>
                      <Split className="w-4 h-4" />
                      <span>Split PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
