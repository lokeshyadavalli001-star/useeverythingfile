"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { PDFPageGrid, PDFPageItem } from "@/components/pdf/PDFPageGrid";
import { Layers, Loader2, FileText } from "lucide-react";

export default function ExtractPdfPagesPage() {
  const tool = TOOL_MAP.get("extract-pdf-pages")!;
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

  const handleToggleSelect = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleExtractMarked = async () => {
    if (!pdfBuffer || !file) return;

    const selectedIndices = pages
      .map((p, idx) => (p.selected ? idx : -1))
      .filter((idx) => idx !== -1);

    if (selectedIndices.length === 0) {
      setError("Please select at least one page to extract by clicking on its thumbnail.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const extractedBytes = await ClientPDFOps.extractPages(pdfBuffer, selectedIndices);
      const blob = new Blob([extractedBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultSize(extractedBytes.byteLength);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to extract selected pages.");
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

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <ResultCard
          filename={`${file?.name.replace(/\.pdf$/i, "")}_extracted.pdf`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="Pages Extracted Successfully! 🎉"
          subtitle={`Saved ${selectedCount} selected page${selectedCount > 1 ? "s" : ""} into a new document.`}
        />
      ) : (
        <div className="w-full space-y-6">
          {!file || !pdfBuffer ? (
            <div className="max-w-xl mx-auto">
              <FileDropzone
                acceptedExtensions={[".pdf"]}
                maxFiles={1}
                onFilesSelected={handleFileSelected}
                title="Drop PDF to extract pages"
                subtitle="Visually pick and export the exact pages you need"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sticky Control Header */}
              <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-900/95 backdrop-blur-md border border-surface-800 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</h4>
                    <p className="text-xs text-surface-400">
                      {pages.length} Total Pages • {selectedCount} Selected to Extract
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
                    disabled={selectedCount === 0 || isProcessing}
                    onClick={handleExtractMarked}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Extracting Pages...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>Extract {selectedCount} Page{selectedCount !== 1 ? "s" : ""}</span>
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

              {/* Interactive Visual Page Grid */}
              <div className="p-6 rounded-3xl bg-surface-950/60 border border-surface-800/80">
                <p className="text-xs text-surface-400 mb-4 font-medium">
                  Click on page thumbnails to select pages you want to extract:
                </p>
                <PDFPageGrid
                  pdfBuffer={pdfBuffer}
                  pages={pages}
                  onToggleSelect={handleToggleSelect}
                  enableSelect={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
