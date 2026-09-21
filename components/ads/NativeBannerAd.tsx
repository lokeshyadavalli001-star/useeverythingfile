"use client";

import React, { useEffect, useRef } from "react";
import { AD_CONFIG } from "@/lib/config/ads";
import { ExternalLink } from "lucide-react";

export function NativeBannerAd({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only inject script once on client mount
    if (containerRef.current && !containerRef.current.querySelector("script")) {
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src =
        "https://pl31435146.profitableratecpmnetwork.com/7469ecbc4f72b9eb47e00938bad634da/invoke.js";
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className={`w-full my-8 flex flex-col items-center justify-center ${className}`}>
      <div className="w-full max-w-4xl flex items-center justify-between px-2 mb-1.5">
        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider opacity-60">
          Advertisement
        </span>
        <a
          href={AD_CONFIG.smartlink2}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="text-[11px] font-semibold text-amber-400/90 hover:text-amber-300 transition-colors flex items-center gap-1 group"
        >
          <span>Explore Partner Deals</span>
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
      <div
        ref={containerRef}
        className="w-full max-w-4xl flex justify-center min-h-[90px] rounded-2xl overflow-hidden bg-surface-900/30 border border-surface-800/50 p-2 shadow-sm"
      >
        <div id="container-7469ecbc4f72b9eb47e00938bad634da" className="w-full flex justify-center" />
      </div>
    </div>
  );
}
