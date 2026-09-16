"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { ClientImageOps } from "@/lib/client/image-ops";
import { FileText, Loader2, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export default function ImageToPdfPage() {
  const tool = TOOL_MAP.get("image-to-pdf")!;
  const [files, setFiles] = useState<File[]>([]);
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [margin, setMargin] = useState<"none" | "small" | "normal">("small");
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      let origSize = 0;
      const images: Array<{ buffer: ArrayBuffer; type: "jpg" | "png" }> = [];

      for (const f of files) {
        origSize += f.size;
        const name = f.name.toLowerCase();

        if (name.endsWith(".webp")) {
          // Decompress WebP to PNG buffer for PDF embedding
          const pngBlob = await ClientImageOps.convertFormat(f, "image/png");
          images.push({ buffer: await pngBlob.arrayBuffer(), type: "png" });
        } else if (name.endsWith(".png")) {
          images.push({ buffer: await f.arrayBuffer(), type: "png" });
        } else {
          images.push({ buffer: await f.arrayBuffer(), type: "jpg" });
        }
      }

      setTotalOriginalSize(origSize);

      const pdfBytes = await ClientPDFOps.imagesToPDF(images, {
        orientation,
        margin,
      });

      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultSize(pdfBytes.byteLength);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to convert images to PDF.");
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
          filename="images_combined.pdf"
          downloadUrl={downloadUrl}
          originalSizeBytes={totalOriginalSize}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="PDF Created Successfully! 🎉"
          subtitle={`Combined ${files.length} image${files.length > 1 ? "s" : ""} into a formatted document.`}
        />
      ) : (
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <FileDropzone
            acceptedExtensions={[".jpg", ".jpeg", ".png", ".webp"]}
            maxFiles={50}
            onFilesSelected={handleFilesSelected}
            title="Drop images here (JPG, PNG, WebP)"
            subtitle="Combine any mix of pictures into a single PDF document"
          />

          {files.length > 0 && (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">
                    Images Selected ({files.length})
                  </h4>
                  <span className="text-xs text-surface-400">
                    Total: {(files.reduce((a, b) => a + b.size, 0) / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-950 border border-surface-800 text-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-surface-800 text-surface-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-white truncate font-medium max-w-xs">
                          {file.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === files.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(idx)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-800">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-2">
                    Orientation
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["auto", "portrait", "landscape"] as const).map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setOrientation(o)}
                        className={`p-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          orientation === o
                            ? "bg-brand-600/20 border-brand-500 text-brand-300"
                            : "bg-surface-950 border-surface-800 text-surface-400 hover:text-white"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-2">
                    Margins
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["none", "small", "normal"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMargin(m)}
                        className={`p-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          margin === m
                            ? "bg-brand-600/20 border-brand-500 text-brand-300"
                            : "bg-surface-950 border-surface-800 text-surface-400 hover:text-white"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={files.length === 0 || isProcessing}
                onClick={handleConvert}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Combining Images into PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>Convert {files.length} Image{files.length > 1 ? "s" : ""} to PDF</span>
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
