"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { UniversalFileCompressor, UniversalCompressorOptions } from "@/lib/client/universal-compressor";
import {
  Archive,
  CheckCircle2,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  Sliders,
  Sparkles,
  Zap,
  ShieldCheck,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";

export default function CompressFilePage() {
  const tool = TOOL_MAP.get("compress-file")!;
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<"balanced" | "maximum" | "lossless">("balanced");
  const [customQuality, setCustomQuality] = useState<number>(75);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>("");
  const [resultSize, setResultSize] = useState<number>(0);
  const [strategyInfo, setStrategyInfo] = useState<string>("");
  const [formatInfo, setFormatInfo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["docx", "doc", "odt", "rtf", "txt", "md", "pdf"].includes(ext)) {
      return <FileText className="w-7 h-7 text-blue-400" />;
    }
    if (["xlsx", "xls", "csv"].includes(ext)) {
      return <FileSpreadsheet className="w-7 h-7 text-emerald-400" />;
    }
    if (["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext)) {
      return <FileImage className="w-7 h-7 text-pink-400" />;
    }
    if (["mp4", "mov", "avi", "mkv"].includes(ext)) {
      return <FileVideo className="w-7 h-7 text-purple-400" />;
    }
    if (["mp3", "wav", "flac", "m4a"].includes(ext)) {
      return <FileAudio className="w-7 h-7 text-amber-400" />;
    }
    if (["html", "css", "js", "py", "cpp", "java", "json", "xml", "sql"].includes(ext)) {
      return <FileCode className="w-7 h-7 text-cyan-400" />;
    }
    if (["zip", "rar", "7z", "apk", "tar.gz"].includes(ext)) {
      return <FileArchive className="w-7 h-7 text-orange-400" />;
    }
    return <Archive className="w-7 h-7 text-emerald-400" />;
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const options: UniversalCompressorOptions = {
        level: compressionLevel,
        customQuality,
      };

      const result = await UniversalFileCompressor.compressFile(file, options);
      const url = URL.createObjectURL(result.blob);

      setDownloadUrl(url);
      setResultFilename(result.filename);
      setResultSize(result.compressedSize);
      setStrategyInfo(result.compressionStrategy);
      setFormatInfo(result.formatDescription);
    } catch (err: any) {
      setError(err?.message || "Failed to compress file. Please try another format.");
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
    setStrategyInfo("");
    setFormatInfo("");
  };

  const ext = file ? file.name.split(".").pop()?.toLowerCase() || "" : "";
  const isImageOrDoc = ["jpg", "jpeg", "png", "webp", "pdf", "docx", "xlsx", "pptx"].includes(ext);

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <div className="w-full max-w-xl mx-auto space-y-6">
          <ResultCard
            filename={resultFilename}
            downloadUrl={downloadUrl}
            originalSizeBytes={file?.size}
            resultSizeBytes={resultSize}
            onReset={handleReset}
            title="File Compressed Successfully! 🎉"
            subtitle="Direct in-place compression complete without converting to ZIP."
          />

          {/* Direct Compression Guarantee Callout */}
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct File Compression (Zero ZIP conversion)</span>
            </div>
            <p className="text-xs text-surface-400">
              <strong className="text-surface-200">Preserved Format:</strong> {formatInfo}
            </p>
            {strategyInfo && (
              <p className="text-xs text-surface-400">
                <strong className="text-surface-200">Applied Engine:</strong> {strategyInfo}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <FileDropzone
              acceptedExtensions={tool.acceptedExtensions}
              maxFiles={1}
              onFilesSelected={handleFilesSelected}
              title="Drop any file here to compress"
              subtitle="Word, Excel, PDF, Images, Code, Audio, Video, or System files"
            />
          ) : (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-6">
              {/* Selected File Badge */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-950 border border-surface-800">
                <div className="w-14 h-14 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(file.name)}
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{file.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-surface-400">
                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span className="uppercase text-emerald-400 font-bold tracking-wide">
                      .{ext || "FILE"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-surface-850 hover:bg-surface-800 text-surface-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Compression Mode Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-400">
                  Select Compression Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCompressionLevel("balanced")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      compressionLevel === "balanced"
                        ? "bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                        : "bg-surface-950 border-surface-800 text-surface-300 hover:border-surface-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Smart Balanced</span>
                    </div>
                    <p className="text-[11px] text-surface-400 leading-tight">
                      Recommended. Great size reduction with 100% fidelity.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompressionLevel("maximum")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      compressionLevel === "maximum"
                        ? "bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                        : "bg-surface-950 border-surface-800 text-surface-300 hover:border-surface-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Max Compression</span>
                    </div>
                    <p className="text-[11px] text-surface-400 leading-tight">
                      Aggressive byte reduction for email and portal limits.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompressionLevel("lossless")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      compressionLevel === "lossless"
                        ? "bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                        : "bg-surface-950 border-surface-800 text-surface-300 hover:border-surface-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Lossless Stream</span>
                    </div>
                    <p className="text-[11px] text-surface-400 leading-tight">
                      Strictly bit-accurate structure & metadata pruning.
                    </p>
                  </button>
                </div>
              </div>

              {/* Quality Slider for images/visuals */}
              {isImageOrDoc && compressionLevel !== "lossless" && (
                <div className="p-4 rounded-xl bg-surface-950 border border-surface-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-surface-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Compression Quality Level</span>
                    </span>
                    <span className="text-emerald-400">{customQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="95"
                    value={customQuality}
                    onChange={(e) => setCustomQuality(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-surface-400">
                    <span>Smaller File Size</span>
                    <span>Higher Visual Quality</span>
                  </div>
                </div>
              )}

              {/* Strict No-ZIP Notice */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-950/60 border border-surface-800 text-xs text-surface-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Guaranteed:</strong> File is compressed directly as{" "}
                  <code className="text-emerald-300 bg-surface-900 px-1 py-0.5 rounded font-mono">
                    .{ext || "ext"}
                  </code>{" "}
                  — never packaged into a .zip.
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleCompress}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Compressing File...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-5 h-5" />
                    <span>Compress {file.name.length > 20 ? `.${ext.toUpperCase()}` : file.name}</span>
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
