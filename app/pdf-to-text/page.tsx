"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFRenderer } from "@/lib/client/pdf-render";
import { Copy, Check, Download, Loader2, FileText, FileCode } from "lucide-react";

export default function PdfToTextPage() {
  const tool = TOOL_MAP.get("pdf-to-text")!;
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setIsProcessing(true);
    setError(null);
    setExtractedText(null);

    try {
      const buffer = await f.arrayBuffer();
      const res = await ClientPDFRenderer.extractTextFromPDF(buffer);
      if (!res.text || res.text.trim().length === 0) {
        setError("No selectable text found in this PDF. It may contain scanned images only.");
      } else {
        setExtractedText(res.text);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to extract text from PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText || !file) return;
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.pdf$/i, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText(null);
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {!file ? (
          <FileDropzone
            acceptedExtensions={[".pdf"]}
            maxFiles={1}
            onFilesSelected={handleFileSelected}
            title="Drop PDF to extract text"
            subtitle="Extract selectable text safely into plain text"
          />
        ) : isProcessing ? (
          <div className="p-12 rounded-3xl bg-surface-900 border border-surface-800 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin mx-auto" />
            <h4 className="text-lg font-bold text-white">Extracting Text from PDF...</h4>
            <p className="text-xs text-surface-400">Processing locally in your browser</p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-surface-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</h4>
                  <p className="text-xs text-surface-400">
                    {extractedText ? `${extractedText.length.toLocaleString()} characters extracted` : "Ready"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-medium transition-colors"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold border border-surface-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Plain text area - strictly escaped, no HTML execution */}
            <div className="relative">
              <textarea
                readOnly
                value={extractedText || ""}
                rows={16}
                className="w-full p-4 rounded-2xl bg-surface-950 border border-surface-800 text-surface-200 font-mono text-xs leading-relaxed focus:outline-none resize-y"
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
