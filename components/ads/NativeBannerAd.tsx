"use client";

import React, { useEffect, useRef } from "react";

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
      <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider mb-1.5 opacity-60">
        Advertisement
      </span>
      <div
        ref={containerRef}
        className="w-full max-w-4xl flex justify-center min-h-[90px] rounded-2xl overflow-hidden bg-surface-900/30 border border-surface-800/50 p-2 shadow-sm"
      >
        <div id="container-7469ecbc4f72b9eb47e00938bad634da" className="w-full flex justify-center" />
      </div>
    </div>
  );
}
