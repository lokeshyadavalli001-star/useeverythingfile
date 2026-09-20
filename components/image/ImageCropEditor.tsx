"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  RotateCw,
  RotateCcw,
  Scissors,
  Maximize2,
  Minimize2,
  Move,
  Check,
  RefreshCcw,
} from "lucide-react";
import { ClientImageOps } from "@/lib/client/image-ops";

interface ImageCropEditorProps {
  imageFile: File;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

type AspectRatioMode = "free" | "1:1" | "4:3" | "16:9" | "3:2" | "9:16";

const RATIO_MAP: Record<AspectRatioMode, number | null> = {
  free: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:2": 3 / 2,
  "9:16": 9 / 16,
};

type DragHandle = "move" | "nw" | "ne" | "se" | "sw" | "n" | "s" | "w" | "e";

export const ImageCropEditor: React.FC<ImageCropEditorProps> = ({
  imageFile,
  onCropComplete,
  onCancel,
}) => {
  const [currentFile, setCurrentFile] = useState<File | Blob>(imageFile);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [displayedSize, setDisplayedSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>("free");
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const [isRotating, setIsRotating] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxOverlayRef = useRef<HTMLDivElement | null>(null);

  const setCropBoxOverlayRef = (node: HTMLDivElement | null) => {
    cropBoxOverlayRef.current = node;
    if (node) {
      node.style.transform = `translate3d(${cropBox.x}px, ${cropBox.y}px, 0)`;
      node.style.width = `${cropBox.width}px`;
      node.style.height = `${cropBox.height}px`;
    }
  };

  useEffect(() => {
    if (cropBoxOverlayRef.current) {
      cropBoxOverlayRef.current.style.transform = `translate3d(${cropBox.x}px, ${cropBox.y}px, 0)`;
      cropBoxOverlayRef.current.style.width = `${cropBox.width}px`;
      cropBoxOverlayRef.current.style.height = `${cropBox.height}px`;
    }
  }, [cropBox.x, cropBox.y, cropBox.width, cropBox.height]);

  // Active drag state
  const dragRef = useRef<{
    handle: DragHandle;
    startX: number;
    startY: number;
    startBox: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Initialize image source
  useEffect(() => {
    const url = URL.createObjectURL(currentFile);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [currentFile]);

  // When image finishes rendering, measure displayed and natural dimensions
  const handleImageLoad = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const dispW = img.clientWidth;
    const dispH = img.clientHeight;

    setNaturalSize({ width: natW, height: natH });
    setDisplayedSize({ width: dispW, height: dispH });

    // Initial crop box: 80% centered
    const initialW = Math.round(dispW * 0.85);
    const initialH = Math.round(dispH * 0.85);
    const initialX = Math.round((dispW - initialW) / 2);
    const initialY = Math.round((dispH - initialH) / 2);

    setCropBox({
      x: Math.max(0, initialX),
      y: Math.max(0, initialY),
      width: initialW,
      height: initialH,
    });
  };

  // Keep displayed size updated on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!imageRef.current) return;
      const img = imageRef.current;
      setDisplayedSize({
        width: img.clientWidth,
        height: img.clientHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply Aspect Ratio
  const handleSetRatio = (mode: AspectRatioMode) => {
    setAspectRatio(mode);
    const targetRatio = RATIO_MAP[mode];
    if (!targetRatio || displayedSize.width === 0 || displayedSize.height === 0) return;

    // Center an aspect-ratio-locked box inside the current displayed image
    let newW = cropBox.width;
    let newH = newW / targetRatio;

    if (newH > displayedSize.height) {
      newH = displayedSize.height * 0.9;
      newW = newH * targetRatio;
    }
    if (newW > displayedSize.width) {
      newW = displayedSize.width * 0.9;
      newH = newW / targetRatio;
    }

    const newX = Math.max(0, (displayedSize.width - newW) / 2);
    const newY = Math.max(0, (displayedSize.height - newH) / 2);

    setCropBox({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newW),
      height: Math.round(newH),
    });
  };

  // Rotate Image (90° CW or CCW)
  const handleRotate = async (deg: number) => {
    if (isRotating) return;
    setIsRotating(true);
    try {
      const rotatedBlob = await ClientImageOps.rotateImage(currentFile, deg);
      setCurrentFile(rotatedBlob);
    } catch (e) {
      console.error("Rotate failed", e);
    } finally {
      setIsRotating(false);
    }
  };

  // Reset to full view
  const handleReset = () => {
    setCurrentFile(imageFile);
    setAspectRatio("free");
    if (displayedSize.width > 0 && displayedSize.height > 0) {
      const w = Math.round(displayedSize.width * 0.9);
      const h = Math.round(displayedSize.height * 0.9);
      setCropBox({
        x: Math.round((displayedSize.width - w) / 2),
        y: Math.round((displayedSize.height - h) / 2),
        width: w,
        height: h,
      });
    }
  };

  // Pointer drag start
  const handlePointerDown = (e: React.PointerEvent, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBox },
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragRef.current) return;
      const { handle, startX, startY, startBox } = dragRef.current;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const dispW = displayedSize.width;
      const dispH = displayedSize.height;
      const MIN_SIZE = 30;

      if (handle === "move") {
        // Free movement within image boundaries
        const newX = Math.max(0, Math.min(startBox.x + dx, dispW - startBox.width));
        const newY = Math.max(0, Math.min(startBox.y + dy, dispH - startBox.height));
        setCropBox((prev) => ({
          ...prev,
          x: Math.round(newX),
          y: Math.round(newY),
        }));
      } else {
        // Resizing
        let newX = startBox.x;
        let newY = startBox.y;
        let newW = startBox.width;
        let newH = startBox.height;

        const targetRatio = RATIO_MAP[aspectRatio];

        // Handle Horizontal adjustments
        if (handle.includes("e")) {
          newW = Math.max(MIN_SIZE, Math.min(startBox.width + dx, dispW - startBox.x));
        } else if (handle.includes("w")) {
          const maxLeft = startBox.x + startBox.width - MIN_SIZE;
          newX = Math.max(0, Math.min(startBox.x + dx, maxLeft));
          newW = startBox.width + (startBox.x - newX);
        }

        // Handle Vertical adjustments
        if (handle.includes("s")) {
          newH = Math.max(MIN_SIZE, Math.min(startBox.height + dy, dispH - startBox.y));
        } else if (handle.includes("n")) {
          const maxTop = startBox.y + startBox.height - MIN_SIZE;
          newY = Math.max(0, Math.min(startBox.y + dy, maxTop));
          newH = startBox.height + (startBox.y - newY);
        }

        // Aspect ratio locking if not in "free" mode
        if (targetRatio) {
          if (handle === "e" || handle === "w") {
            newH = newW / targetRatio;
            if (newY + newH > dispH) {
              newH = dispH - newY;
              newW = newH * targetRatio;
            }
          } else if (handle === "n" || handle === "s") {
            newW = newH * targetRatio;
            if (newX + newW > dispW) {
              newW = dispW - newX;
              newH = newW / targetRatio;
            }
          } else {
            // Corner resizing with aspect ratio
            const currentRatio = newW / newH;
            if (currentRatio > targetRatio) {
              newW = newH * targetRatio;
            } else {
              newH = newW / targetRatio;
            }
            if (handle.includes("w")) {
              newX = startBox.x + (startBox.width - newW);
            }
            if (handle.includes("n")) {
              newY = startBox.y + (startBox.height - newH);
            }
          }
        }

        // Final boundary checks
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + newW > dispW) newW = dispW - newX;
        if (newY + newH > dispH) newH = dispH - newY;

        setCropBox({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }
    };

    const handlePointerUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Perform Final Crop
  const handleApplyCrop = async () => {
    if (displayedSize.width === 0 || displayedSize.height === 0) return;
    setIsCropping(true);

    try {
      const scaleX = naturalSize.width / displayedSize.width;
      const scaleY = naturalSize.height / displayedSize.height;

      const realX = Math.round(cropBox.x * scaleX);
      const realY = Math.round(cropBox.y * scaleY);
      const realW = Math.round(cropBox.width * scaleX);
      const realH = Math.round(cropBox.height * scaleY);

      const croppedBlob = await ClientImageOps.cropImage(
        currentFile,
        { x: realX, y: realY, width: realW, height: realH },
        0,
        "image/png"
      );

      onCropComplete(croppedBlob);
    } catch (err) {
      console.error("Crop execution error", err);
    } finally {
      setIsCropping(false);
    }
  };

  // Calculate live export dimensions
  const scaleX = displayedSize.width > 0 ? naturalSize.width / displayedSize.width : 1;
  const scaleY = displayedSize.height > 0 ? naturalSize.height / displayedSize.height : 1;
  const liveCroppedWidth = Math.round(cropBox.width * scaleX);
  const liveCroppedHeight = Math.round(cropBox.height * scaleY);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 rounded-3xl bg-surface-900 border border-surface-800 shadow-2xl space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-800">
        {/* Aspect Ratio Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-surface-400 mr-1">Ratio:</span>
          {(["free", "1:1", "4:3", "16:9", "3:2", "9:16"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleSetRatio(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                aspectRatio === mode
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                  : "bg-surface-950 border border-surface-800 text-surface-300 hover:text-white hover:bg-surface-850"
              }`}
            >
              {mode === "free" ? "Free Navigation" : mode}
            </button>
          ))}
        </div>

        {/* Rotate & Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleRotate(90)}
            disabled={isRotating}
            className="p-2.5 rounded-xl bg-surface-950 hover:bg-surface-800 border border-surface-800 text-surface-300 hover:text-white transition-colors"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleRotate(-90)}
            disabled={isRotating}
            className="p-2.5 rounded-xl bg-surface-950 hover:bg-surface-800 border border-surface-800 text-surface-300 hover:text-white transition-colors"
            title="Rotate 90° Counter-Clockwise"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-surface-950 hover:bg-surface-800 border border-surface-800 text-surface-300 hover:text-white transition-colors"
            title="Reset to Full Image"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[380px] max-h-[580px] rounded-2xl bg-surface-950 overflow-hidden flex items-center justify-center p-4 select-none border border-surface-800 shadow-inner"
      >
        {imageSrc && (
          <div className="relative inline-block select-none max-w-full max-h-full">
            {/* Base Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Source for cropping"
              onLoad={handleImageLoad}
              className="max-h-[520px] max-w-full object-contain block mx-auto pointer-events-none select-none rounded-lg"
              draggable={false}
            />

            {/* Draggable & Resizable Crop Box Overlay */}
            {displayedSize.width > 0 && cropBox.width > 0 && (
              <div
                ref={setCropBoxOverlayRef}
                className="absolute top-0 left-0 border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move select-none touch-none"
                onPointerDown={(e) => handlePointerDown(e, "move")}
              >
                {/* 3x3 Rule of Thirds Grid Lines */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/40 border-dashed" />
                  <div className="border-r border-b border-white/40 border-dashed" />
                  <div className="border-b border-white/40 border-dashed" />
                  <div className="border-r border-b border-white/40 border-dashed" />
                  <div className="border-r border-b border-white/40 border-dashed" />
                  <div className="border-b border-white/40 border-dashed" />
                  <div className="border-r border-white/40 border-dashed" />
                  <div className="border-r border-white/40 border-dashed" />
                  <div />
                </div>

                {/* Center Move Icon Indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
                  <Move className="w-6 h-6 text-white drop-shadow-md" />
                </div>

                {/* Floating Resolution Pill */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-mono font-bold text-white shadow-md pointer-events-none border border-white/20">
                  {liveCroppedWidth} × {liveCroppedHeight} px
                </div>

                {/* 4 Corner Resizing Handles */}
                <div
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-surface-950 rounded-sm shadow-md cursor-nwse-resize z-20 hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, "nw")}
                />
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-surface-950 rounded-sm shadow-md cursor-nesw-resize z-20 hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, "ne")}
                />
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-surface-950 rounded-sm shadow-md cursor-nwse-resize z-20 hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, "se")}
                />
                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-surface-950 rounded-sm shadow-md cursor-nesw-resize z-20 hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, "sw")}
                />

                {/* 4 Edge Resizing Handles */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white border-2 border-surface-950 rounded-full shadow-md cursor-ns-resize z-10 hover:scale-110 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, "n")}
                />
                <div
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white border-2 border-surface-950 rounded-full shadow-md cursor-ns-resize z-10 hover:scale-110 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, "s")}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-8 bg-white border-2 border-surface-950 rounded-full shadow-md cursor-ew-resize z-10 hover:scale-110 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, "w")}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-8 bg-white border-2 border-surface-950 rounded-full shadow-md cursor-ew-resize z-10 hover:scale-110 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, "e")}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Summary & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Dimensions Summary */}
        <div className="flex items-center gap-4 text-xs font-medium text-surface-400">
          <div>
            Original: <span className="text-white font-mono">{naturalSize.width} × {naturalSize.height} px</span>
          </div>
          <div>•</div>
          <div>
            Cropped: <span className="text-red-400 font-mono font-bold">{liveCroppedWidth} × {liveCroppedHeight} px</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-surface-950 hover:bg-surface-800 text-surface-300 text-sm font-medium border border-surface-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isCropping}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Scissors className="w-4 h-4" />
            <span>{isCropping ? "Cropping..." : "Apply Crop"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
