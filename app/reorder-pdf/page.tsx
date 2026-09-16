"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { PDFPageGrid, PDFPageItem } from "@/components/pdf/PDFPageGrid";
import { ArrowUpDown, Loader2, FileText } from "lucide-react";

export default function ReorderPdfPage() {
  const tool = TOOL_MAP.get("reorder-pdf")!;
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

  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const updated = [...pages];
    const temp = updated[fromIndex];
    updated[fromIndex] = updated[toIndex];
    updated[toIndex] = temp;
    setPages(updated);
  };

  const handleReorder = async () => {
    if (!pdfBuffer || !file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Build order of 0-based indices from original page indices
      const order = pages.map((p) => p.originalIndex);
      const reorderedBytes = await ClientPDFOps.reorderPages(pdfBuffer, order);
      const blob = new Blob([reorderedBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultSize(reorderedBytes.byteLength);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to reorder PDF pages.");
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
          filename={`${file?.name.replace(/\.pdf$/i, "")}_reordered.pdf`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="PDF Reordered Successfully! 🎉"
          subtitle="Your pages have been rearranged into your preferred order."
        />
      ) : (
        <div className="w-full space-y-6">
          {!file || !pdfBuffer ? (
            <div className="max-w-xl mx-auto">
              <FileDropzone
                acceptedExtensions={[".pdf"]}
                maxFiles={1}
                onFilesSelected={handleFileSelected}
                title="Drop PDF to reorder pages"
                subtitle="Rearrange page order with touch or mouse controls"
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
                    <p className="text-xs text-surface-400">
                      {pages.length} Pages • Use arrows to adjust sequence
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-medium transition-colors"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleReorder}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reordering Pages...</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpDown className="w-4 h-4" />
                        <span>Save New Page Order</span>
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
                  Use the left and right navigation arrows below each thumbnail to rearrange pages:
                </p>
                <PDFPageGrid
                  pdfBuffer={pdfBuffer}
                  pages={pages}
                  onMovePage={handleMovePage}
                  enableReorder={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
