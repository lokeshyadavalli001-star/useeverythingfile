"use client";

import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import { RotateCw, Trash2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ClientPDFRenderer } from "@/lib/client/pdf-render";

export interface PDFPageItem {
  pageNumber: number; // 1-indexed original page
  originalIndex: number; // 0-indexed original index
  rotation: number; // in degrees: 0, 90, 180, 270
  selected: boolean;
  deleted: boolean;
}

interface PDFPageGridProps {
  pdfBuffer: ArrayBuffer;
  pages: PDFPageItem[];
  onToggleSelect?: (pageIndex: number) => void;
  onRotatePage?: (pageIndex: number) => void;
  onDeletePage?: (pageIndex: number) => void;
  onMovePage?: (fromIndex: number, toIndex: number) => void;
  enableReorder?: boolean;
  enableRotate?: boolean;
  enableDelete?: boolean;
  enableSelect?: boolean;
}

export const PDFPageGrid: React.FC<PDFPageGridProps> = ({
  pdfBuffer,
  pages,
  onToggleSelect,
  onRotatePage,
  onDeletePage,
  onMovePage,
  enableReorder = false,
  enableRotate = false,
  enableDelete = false,
  enableSelect = false,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {pages.map((page, index) => {
        if (page.deleted) return null;

        return (
          <PDFPageCard
            key={`${page.originalIndex}-${page.pageNumber}`}
            pdfBuffer={pdfBuffer}
            page={page}
            index={index}
            totalActivePages={pages.filter((p) => !p.deleted).length}
            onToggleSelect={onToggleSelect}
            onRotatePage={onRotatePage}
            onDeletePage={onDeletePage}
            onMovePage={onMovePage}
            enableReorder={enableReorder}
            enableRotate={enableRotate}
            enableDelete={enableDelete}
            enableSelect={enableSelect}
          />
        );
      })}
    </div>
  );
};

interface PDFPageCardProps {
  pdfBuffer: ArrayBuffer;
  page: PDFPageItem;
  index: number;
  totalActivePages: number;
  onToggleSelect?: (pageIndex: number) => void;
  onRotatePage?: (pageIndex: number) => void;
  onDeletePage?: (pageIndex: number) => void;
  onMovePage?: (fromIndex: number, toIndex: number) => void;
  enableReorder: boolean;
  enableRotate: boolean;
  enableDelete: boolean;
  enableSelect: boolean;
}

const PDFPageCard: React.FC<PDFPageCardProps> = ({
  pdfBuffer,
  page,
  index,
  totalActivePages,
  onToggleSelect,
  onRotatePage,
  onDeletePage,
  onMovePage,
  enableReorder,
  enableRotate,
  enableDelete,
  enableSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRenderedRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function renderThumbnail() {
      if (!canvasRef.current || isRenderedRef.current) return;
      try {
        await ClientPDFRenderer.renderPageToCanvas(
          pdfBuffer,
          page.pageNumber,
          canvasRef.current,
          0.35 // Lightweight scale for fast rendering
        );
        if (active) {
          isRenderedRef.current = true;
        }
      } catch (err) {
        // Fallback gracefully on canvas rendering issue
      }
    }

    renderThumbnail();

    return () => {
      active = false;
    };
  }, [pdfBuffer, page.pageNumber]);

  return (
    <div
      onClick={() => enableSelect && onToggleSelect && onToggleSelect(index)}
      className={`group relative flex flex-col p-2.5 rounded-2xl bg-surface-900 border transition-all ${
        page.selected
          ? "border-brand-500 ring-2 ring-brand-500/30 bg-surface-850 shadow-lg"
          : "border-surface-800 hover:border-surface-700"
      } ${enableSelect ? "cursor-pointer" : ""}`}
    >
      {/* Top Bar / Badges */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-800 text-surface-300">
          Page {page.pageNumber}
        </span>

        {enableSelect && (
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
              page.selected
                ? "bg-brand-600 border-brand-500 text-white"
                : "border-surface-700 bg-surface-800/80 text-transparent"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Page Canvas Container with Rotation */}
      <div className="relative aspect-[1/1.414] w-full rounded-xl bg-white overflow-hidden flex items-center justify-center p-1 shadow-inner">
        <div
          className={clsx(
            "w-full h-full flex items-center justify-center transition-transform duration-200 ease-out",
            page.rotation % 360 === 90 && "rotate-90",
            page.rotation % 360 === 180 && "rotate-180",
            page.rotation % 360 === 270 && "-rotate-90",
            (page.rotation % 360 === 0 || !page.rotation) && "rotate-0"
          )}
        >
          <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-800/80">
        {enableRotate && (
          <button
            type="button"
            title="Rotate 90° Clockwise"
            onClick={(e) => {
              e.stopPropagation();
              onRotatePage && onRotatePage(index);
            }}
            className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}

        {enableDelete && (
          <button
            type="button"
            title="Delete this page"
            onClick={(e) => {
              e.stopPropagation();
              onDeletePage && onDeletePage(index);
            }}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {enableReorder && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Move Left"
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMovePage && onMovePage(index, index - 1);
              }}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Move Right"
              disabled={index === totalActivePages - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMovePage && onMovePage(index, index + 1);
              }}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
