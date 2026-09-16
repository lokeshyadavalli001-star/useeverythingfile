"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { PDFPageGrid, PDFPageItem } from "@/components/pdf/PDFPageGrid";
import { RotateCw, RotateCcw, Loader2, FileText } from "lucide-react";

export default function RotatePdfPage() {
  const tool = TOOL_MAP.get("rotate-pdf")!;
  const [file, setFile] = useState<File | null>(null);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PDFPageItem[]>([]);
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
      const buffer = await f.arrayBuffer();
      setPdfBuffer(buffer);
      const meta = await ClientPDFOps.inspectPDF(buffer);

      const items: PDFPageItem[] = meta.pages.map((p, idx) => ({
        pageNumber: p.pageNumber,
        originalIndex: idx,
        rotation: p.rotation,
        selected: false,
        deleted: false,
      }));
      setPages(items);
    } catch (err) {
      setError("Failed to load PDF pages. File may be corrupted or encrypted.");
    }
  };

  const handleRotateSinglePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const handleRotateAll = (degreesToAdd: number) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + degreesToAdd + 360) % 360,
      }))
    );
  };

  const handleSaveRotation = async () => {
    if (!pdfBuffer || !file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const rotations: Record<number, number> = {};
      pages.forEach((p, idx) => {
        rotations[idx] = p.rotation;
      });

      const rotatedBytes = await ClientPDFOps.rotatePages(pdfBuffer, rotations);
      const blob = new Blob([rotatedBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultSize(rotatedBytes.byteLength);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to rotate PDF pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(null);
    setPdfBuffer(null);
    setPages([]);
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <ResultCard
          filename={`${file?.name.replace(/\.pdf$/i, "")}_rotated.pdf`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="PDF Rotated Successfully! 🎉"
          subtitle="All page orientation adjustments have been permanently saved."
        />
      ) : (
        <div className="w-full space-y-6">
          {!file || !pdfBuffer ? (
            <div className="max-w-xl mx-auto">
              <FileDropzone
                acceptedExtensions={[".pdf"]}
                maxFiles={1}
                onFilesSelected={handleFileSelected}
                title="Drop PDF to rotate pages"
                subtitle="Rotate individual pages or all pages at once"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-900/95 backdrop-blur-md border border-surface-800 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</h4>
                    <p className="text-xs text-surface-400">{pages.length} Pages</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Rotate All Buttons */}
                  <button
                    type="button"
                    onClick={() => handleRotateAll(-90)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold border border-surface-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rotate All Left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotateAll(90)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold border border-surface-700 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate All Right</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-medium transition-colors"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleSaveRotation}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-4 h-4" />
                        <span>Download Rotated PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="p-6 rounded-3xl bg-surface-950/60 border border-surface-800/80">
                <p className="text-xs text-surface-400 mb-4 font-medium">
                  Click the rotate icon under any thumbnail to rotate that page 90°, or use the &quot;Rotate All&quot; buttons above:
                </p>
                <PDFPageGrid
                  pdfBuffer={pdfBuffer}
                  pages={pages}
                  onRotatePage={handleRotateSinglePage}
                  enableRotate={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
