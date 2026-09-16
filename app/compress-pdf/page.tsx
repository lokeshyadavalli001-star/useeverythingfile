"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { Minimize2, Loader2, FileText, CheckCircle2 } from "lucide-react";

type CompressionLevel = "extreme" | "recommended" | "light";

export default function CompressPdfPage() {
  const tool = TOOL_MAP.get("compress-pdf")!;
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("recommended");
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
      const compressedBytes = await ClientPDFOps.compressPDF(buffer, level);

      const blob = new Blob([compressedBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultSize(compressedBytes.byteLength);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to compress document.");
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
          filename={`${file?.name.replace(/\.pdf$/i, "")}_compressed.pdf`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="PDF Compressed Successfully! 🎉"
          subtitle="Your document has been optimized in your browser."
        />
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <FileDropzone
              acceptedExtensions={[".pdf"]}
              maxFiles={1}
              onFilesSelected={handleFileSelected}
              title="Drop PDF to compress"
              subtitle="Reduce file size while retaining quality"
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
                    Current Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Compression Level Options */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                  Select Compression Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "extreme", title: "Extreme", desc: "Maximum size reduction" },
                    { id: "recommended", title: "Recommended", desc: "Good quality, smaller size" },
                    { id: "light", title: "Less", desc: "High quality, modest compression" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLevel(opt.id as CompressionLevel)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        level === opt.id
                          ? "bg-brand-600/20 border-brand-500 text-white shadow-sm"
                          : "bg-surface-950 border-surface-800 text-surface-400 hover:text-white"
                      }`}
                    >
                      <span className="block text-sm font-semibold mb-1">{opt.title}</span>
                      <span className="block text-[11px] text-surface-400">{opt.desc}</span>
                    </button>
                  ))}
                </div>
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
                      <span>Optimizing Streams in Browser...</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span>Compress PDF</span>
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
