"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { FileText, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function WordToPdfPage() {
  const tool = TOOL_MAP.get("word-to-pdf")!;
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isWorkerUnavailable, setIsWorkerUnavailable] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      setIsWorkerUnavailable(false);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setIsWorkerUnavailable(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/word-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (
          res.status === 500 &&
          (errData.error?.includes("unavailable") || errData.error?.includes("worker"))
        ) {
          setIsWorkerUnavailable(true);
          setError(
            errData.error ||
              "Document conversion is temporarily unavailable. A dedicated sandboxed LibreOffice worker is required."
          );
          return;
        }
        throw new Error(errData.error || `Server conversion returned status ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultSize(blob.size);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Something went wrong during conversion. Please try again.");
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
    setIsWorkerUnavailable(false);
  };

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <ResultCard
          filename={`${file?.name.replace(/\.docx$/i, "")}.pdf`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="Word Document Converted to PDF! 🎉"
          subtitle="Your secure read-only PDF is ready for immediate download."
        />
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <FileDropzone
              acceptedExtensions={[".docx"]}
              maxFiles={1}
              onFilesSelected={handleFileSelected}
              title="Drop Word document (.docx) here"
              subtitle="or Choose DOCX from your computer"
            />
          ) : (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-950 border border-surface-800">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">{file.name}</h4>
                  <p className="text-xs text-surface-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Microsoft Word OpenXML
                  </p>
                </div>
              </div>

              {/* Sandbox Security Notice */}
              <div className="p-4 rounded-xl bg-surface-950 border border-surface-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-surface-200">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>Defense-in-Depth Processing Guarantee</span>
                </div>
                <p className="text-[11px] text-surface-400 leading-relaxed">
                  Every DOCX file is validated against Zip bombs and path traversal exploits. Files are assigned cryptographically random IDs and immediately purged from the server after conversion.
                </p>
              </div>

              {/* Graceful Availability Notice if Worker is Offline */}
              {isWorkerUnavailable && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Graceful Feature Availability</span>
                  </div>
                  <p className="leading-relaxed">
                    Document conversion is temporarily unavailable on this host because the isolated LibreOffice daemon is not running. To protect system security, we never fallback to untrusted third-party APIs. All browser-side tools remain 100% operational.
                  </p>
                </div>
              )}

              {error && !isWorkerUnavailable && (
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
                      <span>Converting to PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Convert to PDF</span>
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
