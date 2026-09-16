"use client";

import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

interface SecurityBadgeProps {
  isClientSide?: boolean;
  className?: string;
}

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  isClientSide = true,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
        isClientSide
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
      } ${className}`}
    >
      {isClientSide ? (
        <>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Private & Secure • File Never Leaves Your Device</span>
        </>
      ) : (
        <>
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Protected Sandbox • Automatic Deletion</span>
        </>
      )}
    </div>
  );
};
