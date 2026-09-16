"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ResultCard } from "@/components/shared/ResultCard";
import { TOOL_MAP } from "@/lib/config/tools";
import { ImageCropEditor } from "@/components/image/ImageCropEditor";

export default function CropImagePage() {
  const tool = TOOL_MAP.get("crop-image")!;
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const url = URL.createObjectURL(croppedBlob);
    setResultSize(croppedBlob.size);
    setDownloadUrl(url);
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(null);
    setResultSize(0);
  };

  return (
    <ToolLayout tool={tool}>
      {downloadUrl ? (
        <ResultCard
          filename={`cropped_${file?.name.replace(/\.[^/.]+$/, "")}.png`}
          downloadUrl={downloadUrl}
          originalSizeBytes={file?.size}
          resultSizeBytes={resultSize}
          onReset={handleReset}
          title="Image Cropped Successfully! 🎉"
          subtitle="Precision cropped canvas image is ready for download."
        />
      ) : file ? (
        <ImageCropEditor
          imageFile={file}
          onCropComplete={handleCropComplete}
          onCancel={handleReset}
        />
      ) : (
        <div className="w-full max-w-xl mx-auto">
          <FileDropzone
            acceptedExtensions={[".jpg", ".jpeg", ".png", ".webp"]}
            maxFiles={1}
            onFilesSelected={handleFileSelected}
            title="Drop image to crop"
            subtitle="Free draggable crop grid with aspect ratio presets and rotation"
          />
        </div>
      )}
    </ToolLayout>
  );
}
