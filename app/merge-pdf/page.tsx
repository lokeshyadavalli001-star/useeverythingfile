"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { ArrowUp, ArrowDown, Trash2, FilePlus, Loader2 } from "lucide-react";

export default function MergePdfPage() {
  const tool = TOOL_MAP.get("merge-pdf")!;
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [totalOriginalSize, setTotalOriginalSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFiles(updated);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let origSize = 0;
      const buffers: ArrayBuffer[] = [];
      for (const f of files) {
        origSize += f.size;
        buffers.push(await f.arrayBuffer());
      }
      setTotalOriginalSize(origSize);

      const mergedBytes = await ClientPDFOps.mergePDFs(buffers);
      const blob = new Blob([mergedBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultSize(mergedBytes.byteLength);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to merge documents. Please verify files are valid PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFiles([]);
    setResultSize(0);
    setTotalOriginalSize(0);
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <ResultCard
          filename="merged_document.pdf"
          downloadUrl={downloadUrl}
          originalSizeBytes={totalOriginalSize}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="PDFs Merged Successfully! 🎉"
          subtitle={`Combined ${files.length} documents into one seamless file.`}
        />
      ) : (
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <FileDropzone
            acceptedExtensions={[".pdf"]}
            maxFiles={50}
            maxSizeMB={100}
            onFilesSelected={handleFilesSelected}
            title="Drop PDFs here to merge"
            subtitle="Add all files you want to combine"
          />

          {/* Selected Files List with Reordering */}
          {files.length > 0 && (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">
                  Files to Merge ({files.length})
                </h4>
                <span className="text-xs text-surface-400">
                  Total: {(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-950 border border-surface-800 text-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-6 h-6 rounded-lg bg-surface-800 text-surface-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-white truncate font-medium max-w-xs sm:max-w-sm">
                        {file.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white disabled:opacity-20 transition-colors"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Move Down"
                        disabled={idx === files.length - 1}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white disabled:opacity-20 transition-colors"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Remove"
                        onClick={() => handleRemove(idx)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={files.length < 2 || isProcessing}
                onClick={handleMerge}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Merging in Browser...</span>
                  </>
                ) : (
                  <>
                    <FilePlus className="w-5 h-5" />
                    <span>Merge {files.length} Files into One PDF</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
