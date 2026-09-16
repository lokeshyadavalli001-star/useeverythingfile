"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { ClientDocxGenerator } from "@/lib/client/client-docx";
import { FileEdit, Loader2, FileText, ShieldCheck } from "lucide-react";

export default function PdfToWordPage() {
  const tool = TOOL_MAP.get("pdf-to-word")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);

    try {
      const buffer = await selected.arrayBuffer();
      const meta = await ClientPDFOps.inspectPDF(buffer);
      setPageCount(meta.pageCount);
    } catch (err) {
      setPageCount(1);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const docxBlob = await ClientDocxGenerator.generateDocxFromPdf(buffer, file.name);
      const url = URL.createObjectURL(docxBlob);
      setResultSize(docxBlob.size);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to convert PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(null);
    setPageCount(null);
    setResultSize(0);
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <ResultCard
          filename={`${file?.name.replace(/\.pdf$/i, "")}.docx`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="✓ Your Word document is ready"
          subtitle="You can now open and edit your document in Microsoft Word or Google Docs."
        />
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <FileDropzone
              acceptedExtensions={[".pdf"]}
              maxFiles={1}
              onFilesSelected={handleFileSelected}
              title="Drop your PDF here"
              subtitle="or Choose PDF from your computer"
            />
          ) : (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-6">
              {/* File Information Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-950 border border-surface-800">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">{file.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-surface-400 mt-0.5">
                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{pageCount !== null ? `${pageCount} Page${pageCount !== 1 ? "s" : ""}` : "Analyzing..."}</span>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-4 rounded-xl bg-surface-950 border border-surface-800 flex items-center gap-3 text-xs text-surface-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Documents are converted securely with original formatting, headings, and text preserved.</span>
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
                  Convert Another File
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
                      <span>Converting to Word (.docx)...</span>
                    </>
                  ) : (
                    <>
                      <FileEdit className="w-4 h-4" />
                      <span>Convert to Word</span>
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
