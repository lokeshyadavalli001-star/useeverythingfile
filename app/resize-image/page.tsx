"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientImageOps } from "@/lib/client/image-ops";
import { Maximize2, Loader2, Image as ImageIcon, Lock, Unlock } from "lucide-react";

export default function ResizeImagePage() {
  const tool = TOOL_MAP.get("resize-image")!;
  const [file, setFile] = useState<File | null>(null);
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number } | null>(null);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setError(null);

    try {
      const img = await ClientImageOps.loadImage(f);
      setOrigDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
    } catch (err: any) {
      setError("Failed to inspect image dimensions.");
    }
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspectRatio && origDimensions && origDimensions.width > 0) {
      setTargetHeight(Math.round((origDimensions.height * w) / origDimensions.width));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspectRatio && origDimensions && origDimensions.height > 0) {
      setTargetWidth(Math.round((origDimensions.width * h) / origDimensions.height));
    }
  };

  const applyScalePercentage = (pct: number) => {
    if (!origDimensions) return;
    setTargetWidth(Math.round((origDimensions.width * pct) / 100));
    setTargetHeight(Math.round((origDimensions.height * pct) / 100));
  };

  const handleResize = async () => {
    if (!file || targetWidth <= 0 || targetHeight <= 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await ClientImageOps.resizeImage(file, {
        width: targetWidth,
        height: targetHeight,
        maintainAspectRatio: lockAspectRatio,
      });

      const url = URL.createObjectURL(res.blob);
      setResultSize(res.blob.size);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to resize image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(null);
    setOrigDimensions(null);
    setResultSize(0);
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <ResultCard
          filename={`resized_${targetWidth}x${targetHeight}_${file?.name}`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="Image Resized Successfully! 🎉"
          subtitle={`Scaled to ${targetWidth} × ${targetHeight} pixels in browser.`}
        />
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <FileDropzone
              acceptedExtensions={[".jpg", ".jpeg", ".png", ".webp"]}
              maxFiles={1}
              onFilesSelected={handleFileSelected}
              title="Drop image to resize"
              subtitle="Change dimensions by pixels or percentage"
            />
          ) : (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-950 border border-surface-800">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">{file.name}</h4>
                  <p className="text-xs text-surface-400">
                    Original Dimensions: {origDimensions?.width} × {origDimensions?.height} px
                  </p>
                </div>
              </div>

              {/* Quick Percentage Presets */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                  Scale Presets
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyScalePercentage(pct)}
                      className="py-2 rounded-xl bg-surface-950 hover:bg-surface-800 text-surface-300 hover:text-white border border-surface-800 text-xs font-semibold transition-all"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-300">Width (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-800 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-300">Height (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-800 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Aspect Ratio Lock Toggle */}
              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  lockAspectRatio
                    ? "bg-brand-600/20 border-brand-500 text-brand-300"
                    : "bg-surface-950 border-surface-800 text-surface-400"
                }`}
              >
                {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>Maintain Proportions (Aspect Ratio Locked)</span>
              </button>

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
                  disabled={isProcessing || targetWidth <= 0 || targetHeight <= 0}
                  onClick={handleResize}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resizing in Browser...</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span>Resize Image</span>
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
