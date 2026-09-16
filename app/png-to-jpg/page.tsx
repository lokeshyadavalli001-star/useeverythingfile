"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientImageOps } from "@/lib/client/image-ops";
import { FileImage, Loader2 } from "lucide-react";

export default function PngToJpgPage() {
  const tool = TOOL_MAP.get("png-to-jpg")!;
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(90);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
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

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const jpgBlob = await ClientImageOps.convertFormat(
        file,
        "image/jpeg",
        quality / 100,
        backgroundColor
      );
      const url = URL.createObjectURL(jpgBlob);
      setResultSize(jpgBlob.size);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to convert PNG to JPG.");
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
          filename={`${file?.name.replace(/\.png$/i, "")}.jpg`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="Converted to JPG! 🎉"
          subtitle="Transparent areas smoothly blended onto solid background."
        />
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <FileDropzone
              acceptedExtensions={[".png"]}
              maxFiles={1}
              onFilesSelected={handleFileSelected}
              title="Drop PNG image to convert"
              subtitle="Convert transparent PNG graphics into universal JPG"
            />
          ) : (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-950 border border-surface-800">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <FileImage className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">{file.name}</h4>
                  <p className="text-xs text-surface-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to convert to JPG
                  </p>
                </div>
              </div>

              {/* Background Color Picker for Transparency */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-950 border border-surface-800">
                <div>
                  <span className="block text-xs font-semibold text-surface-300">
                    Background Fill for Transparency
                  </span>
                  <span className="text-[11px] text-surface-400">
                    JPG cannot be transparent. Choose fill color.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-surface-300 uppercase">
                    {backgroundColor}
                  </span>
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
                  onClick={handleConvert}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Converting to JPG...</span>
                    </>
                  ) : (
                    <>
                      <FileImage className="w-4 h-4" />
                      <span>Convert to JPG</span>
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
