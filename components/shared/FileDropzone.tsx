"use client";

import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, File, AlertCircle } from "lucide-react";
import { FILE_SIZE_LIMITS } from "@/lib/config/constants";

interface FileDropzoneProps {
  acceptedExtensions: string[];
  maxFiles?: number;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  acceptedExtensions,
  maxFiles = 1,
  maxSizeMB = 100,
  onFilesSelected,
  title = "Drop your file here",
  subtitle = "or browse from your device",
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFiles = useCallback(
    (fileList: FileList | File[]) => {
      setErrorMessage(null);
      const files = Array.from(fileList);

      if (files.length === 0) return;

      if (files.length > maxFiles) {
        setErrorMessage(`Please select at most ${maxFiles} file${maxFiles > 1 ? "s" : ""}.`);
        return;
      }

      const validFiles: File[] = [];
      const maxBytes = maxSizeMB * 1024 * 1024;

      for (const file of files) {
        // Size validation
        if (file.size > maxBytes) {
          setErrorMessage(`File "${file.name}" exceeds the ${maxSizeMB} MB size limit.`);
          return;
        }

        // Extension validation
        const extMatch = file.name.toLowerCase().match(/\.([a-z0-9]+)$/);
        const ext = extMatch ? `.${extMatch[1]}` : "";
        const isWildcard = acceptedExtensions.includes("*") || acceptedExtensions.includes("*.*");
        const isExtAllowed =
          isWildcard ||
          acceptedExtensions.some(
            (ae) => ae.toLowerCase() === ext || (ae.toLowerCase() === ".jpg" && ext === ".jpeg")
          );

        if (!isExtAllowed) {
          const displayAllowed =
            acceptedExtensions.length > 8
              ? `${acceptedExtensions.slice(0, 8).join(", ")} and more`
              : acceptedExtensions.join(", ");
          setErrorMessage(`File format not supported. Allowed: ${displayAllowed}`);
          return;
        }

        validFiles.push(file);
      }

      onFilesSelected(validFiles);
    },
    [acceptedExtensions, maxFiles, maxSizeMB, onFilesSelected]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
    }
  };

  const handleTriggerClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${title} ${subtitle}`}
        onClick={handleTriggerClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTriggerClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none outline-none ${
          isDragOver
            ? "border-brand-500 bg-brand-500/10 scale-[1.01]"
            : "border-surface-700 bg-surface-900/60 hover:border-brand-500/70 hover:bg-surface-800/60"
        } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedExtensions.includes("*") ? undefined : acceptedExtensions.filter((e) => e !== "*").join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-surface-400">{subtitle}</p>
          </div>

          <button
            type="button"
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            <File className="w-4 h-4" />
            <span>Choose {maxFiles > 1 ? "Files" : "File"}</span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-surface-400 mt-2">
            <span>
              Supports:{" "}
              {acceptedExtensions.includes("*") || acceptedExtensions.length > 10
                ? "All common file formats (Office, PDF, Images, Code, Audio, Video, etc.)"
                : acceptedExtensions.join(", ")}
            </span>
            <span>•</span>
            <span>Max {maxSizeMB} MB</span>
            {maxFiles > 1 && (
              <>
                <span>•</span>
                <span>Up to {maxFiles} files</span>
              </>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
