"use client";

import React from "react";
import { ToolSearch } from "@/components/shared/ToolSearch";
import { NativeBannerAd } from "@/components/ads/NativeBannerAd";

export default function HomePage() {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Hero Header */}
      <section className="pt-10 pb-8 sm:pt-14 sm:pb-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          Every tool you need to work with files in one place
        </h1>
        <p className="text-base sm:text-lg text-surface-300 max-w-2xl mx-auto font-normal leading-relaxed">
          100% Free, Private & Easy to Use. Choose a service below to get started.
        </p>
      </section>

      {/* Main Services Grid (Front and Center) */}
      <section id="tools" className="pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ToolSearch />
        <NativeBannerAd className="mt-12" />
      </section>
    </div>
  );
}
