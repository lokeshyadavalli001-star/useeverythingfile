"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ClientPDFRenderer, RenderedPageImage } from "@/lib/client/pdf-render";
import JSZip from "jszip";
import { Image as ImageIcon, Loader2, Download, FileText, CheckCircle2 } from "lucide-react";

export default function PdfToJpgPage() {
  const tool = TOOL_MAP.get("pdf-to-jpg")!;
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [renderedImages, setRenderedImages] = useState<RenderedPageImage[]>([]);
  const [zipDownloadUrl, setZipDownloadUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState<number>(0);
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
      const buffer = await file.arrayBuffer();
      const images = await ClientPDFRenderer.renderPDFToJPGs(buffer, 1.5, 0.9);
      setRenderedImages(images);

      // Package into ZIP for 1-click batch download
      const zip = new JSZip();
      const baseName = file.name.replace(/\.pdf$/i, "");

      for (const img of images) {
        zip.file(`${baseName}_page_${img.pageNumber}.jpg`, img.blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      setZipDownloadUrl(url);
      setZipSize(zipBlob.size);
    } catch (err: any) {
      setError(err?.message || "Failed to render PDF pages into JPG images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (zipDownloadUrl) URL.revokeObjectURL(zipDownloadUrl);
    setZipDownloadUrl(null);
    setRenderedImages([]);
    setFile(null);
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      {zipDownloadUrl ? (
        <div className="space-y-8">
          <ResultCard
            filename={`${file?.name.replace(/\.pdf$/i, "")}_jpg_pages.zip`}
            downloadUrl={zipDownloadUrl}
            originalSizeBytes={file?.size}
            resultSizeBytes={zipSize}
            onReset={handleReset}
            title="Converted to JPG! 🎉"
            subtitle={`Rendered ${renderedImages.length} high-resolution JPG page${renderedImages.length > 1 ? "s" : ""}.`}
          />

          {/* Individual Page Previews & Download Links */}
          <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-surface-900 border border-surface-800">
            <h4 className="text-base font-bold text-white mb-4">
              Individual Page Downloads ({renderedImages.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {renderedImages.map((img) => (
                <div
                  key={img.pageNumber}
                  className="p-3 rounded-2xl bg-surface-950 border border-surface-800 flex flex-col items-center gap-2"
                >
                  <div className="aspect-[1/1.414] w-full rounded-xl bg-white overflow-hidden shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.dataUrl}
                      alt={`Page ${img.pageNumber}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="w-full flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-surface-300">
                      Page {img.pageNumber}
                    </span>
                    <a
                      href={img.dataUrl}
                      download={`${file?.name.replace(/\.pdf$/i, "")}_page_${img.pageNumber}.jpg`}
                      className="p-1.5 rounded-lg bg-surface-800 hover:bg-brand-600 text-surface-300 hover:text-white transition-colors"
                      title="Download Page JPG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-6">
          {!file ? (
            <FileDropzone
              acceptedExtensions={[".pdf"]}
              maxFiles={1}
              onFilesSelected={handleFileSelected}
              title="Drop PDF to convert to JPG"
              subtitle="Render every page into high-resolution JPG images"
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
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to render
                  </p>
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
                      <span>Rendering Pages in Browser...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
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
