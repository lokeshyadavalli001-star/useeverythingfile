"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientImageOps } from "@/lib/client/image-ops";
import { Sliders, Loader2, Image as ImageIcon } from "lucide-react";

export default function CompressImagePage() {
  const tool = TOOL_MAP.get("compress-image")!;
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(75); // 1-100%
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
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      const res = await ClientImageOps.compressImage(file, quality / 100, mime as any);
      const url = URL.createObjectURL(res.blob);

      setResultSize(res.blob.size);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to compress image.");
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
          filename={`compressed_${file?.name}`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="Image Compressed Successfully! 🎉"
          subtitle="Your photo has been optimized directly in your browser."
        />
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <div className="space-y-4">
              <FileDropzone
                acceptedExtensions={[".jpg", ".jpeg", ".png", ".webp"]}
                maxFiles={1}
                onFilesSelected={handleFileSelected}
                title="Drop image to compress"
                subtitle="Supports JPG, PNG, and WebP images"
              />
              <div className="p-3 rounded-xl bg-surface-900/60 border border-surface-800 text-center">
                <Link
                  href="/compress-file"
                  className="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-emerald-400 transition-colors"
                >
                  <span>Need to compress Word, Excel, PDF, Audio, or other files?</span>
                  <span className="font-semibold text-emerald-400 underline">Try Universal File Compressor →</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-950 border border-surface-800">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">{file.name}</h4>
                  <p className="text-xs text-surface-400">
                    Original Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-surface-300">Compression Quality</span>
                  <span className="text-brand-400">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-surface-400">
                  <span>Smallest Size (10%)</span>
                  <span>Balanced (75%)</span>
                  <span>Best Quality (95%)</span>
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
                      <span>Compressing Image...</span>
                    </>
                  ) : (
                    <>
                      <Sliders className="w-4 h-4" />
                      <span>Compress Image ({quality}%)</span>
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
