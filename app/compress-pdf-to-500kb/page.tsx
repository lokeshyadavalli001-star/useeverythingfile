"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { FileDown, Loader2, FileText, CheckCircle2 } from "lucide-react";

export default function CompressPdfTo500KbPage() {
  const tool = TOOL_MAP.get("compress-pdf-to-500kb")!;
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      // Target: 500 KB = 500 * 1024 = 512000 bytes
      const compressedBytes = await ClientPDFOps.compressToTarget(buffer, 500 * 1024);

      const blob = new Blob([compressedBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultSize(compressedBytes.byteLength);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to compress document to 500 KB.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(null);
    setResultSize(0);
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <ResultCard
          filename={`${file?.name.replace(/\.pdf$/i, "")}_under_500kb.pdf`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="PDF Compressed Under 500 KB! 🎉"
          subtitle="Ultra-compact size achieved without uploading your document."
        />
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <FileDropzone
              acceptedExtensions={[".pdf"]}
              maxFiles={1}
              onFilesSelected={handleFileSelected}
              title="Drop PDF to compress to 500 KB"
              subtitle="Targeted ultra-compact optimization for strict attachment portals"
            />
          ) : (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-950 border border-surface-800">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">{file.name}</h4>
                  <p className="text-xs text-surface-400">
                    Current: {(file.size / 1024).toFixed(1)} KB • Target: ≤ 500 KB
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Streamlines PDF internal structures and metadata to meet the strict 500 KB threshold.</span>
              </div>

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
                  onClick={handleCompress}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Calibrating to 500 KB...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Compress to 500 KB</span>
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
