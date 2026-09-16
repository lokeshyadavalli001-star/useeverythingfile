import React from "react";
import {
  Shield,
  Lock,
  FileCheck,
  Server,
  AlertOctagon,
  CheckCircle2,
  Cpu,
  Eye,
  KeyRound,
} from "lucide-react";

export const metadata = {
  title: "Security Architecture — Everything File",
  description: "Comprehensive defense-in-depth architecture, zero-trust file processing, and OWASP hardening.",
};

export default function SecurityPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 border border-brand-500/20 text-brand-300 mb-4">
          <Shield className="w-4 h-4" />
          <span>Defense-in-Depth Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Security Overview
        </h1>
        <p className="text-surface-300 text-sm sm:text-base leading-relaxed">
          How Everything File protects user documents, mitigates file-based attacks, and minimizes infrastructure attack surface.
        </p>
      </div>

      <div className="space-y-12">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-surface-900 border border-surface-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Browser-First Execution</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              By executing PDF and image operations entirely within local on-device WebAssembly, the vast majority of user files never traverse public networks or reach server storage.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface-900 border border-surface-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Isolated Worker Subsystem</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Document conversion runs in a sandboxed, least-privilege worker process without database access, without admin privileges, and isolated from application secrets.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface-900 border border-surface-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Zero Trust Input Validation</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Every uploaded file is treated as hostile input. We validate cryptographic magic bytes, reject double extensions, inspect ZIP containers, and enforce strict size limits.
            </p>
          </div>
        </div>

        {/* Detailed Architecture Table */}
        <div className="p-8 rounded-3xl bg-surface-900/60 border border-surface-800 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Technical Security Controls</h2>
            <p className="text-xs text-surface-400 leading-relaxed">
              Following OWASP Top 10 and OWASP File Upload Security Guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                Magic Bytes & Signature Validation
              </h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                Incoming <code className="text-brand-300">Content-Type</code> headers can be easily spoofed. We inspect raw binary headers (e.g. <code className="text-brand-300">%PDF-</code>, <code className="text-brand-300">\xFF\xD8\xFF</code>, <code className="text-brand-300">PK\x03\x04</code>) to ensure authentic file structure before any parsing occurs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                Decompression Bomb & ZIP Guard
              </h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                DOCX files are inspected for malicious nested archives, path traversal attempts (<code className="text-brand-300">../</code>), hidden executables, and excessive compression ratios before decompression.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                Randomized Paths & Storage Isolation
              </h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                User filenames are never used as server paths. Cryptographically random UUIDs are assigned, and files are stored outside the public web root in temporary workspaces with 0700 permissions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                Immediate Temporary File Destruction
              </h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                Conversion inputs and outputs are destroyed in the execution lifecycle immediately after the response is streamed. There is no permanent server file storage library.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                Strict HTTP Security Headers
              </h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                Protected by strict Content Security Policy (CSP), Strict-Transport-Security (HSTS), <code className="text-brand-300">X-Content-Type-Options: nosniff</code>, <code className="text-brand-300">X-Frame-Options: DENY</code>, and restrictive Permissions-Policy.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                Zero Client Secrets & No Public Admin
              </h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                Frontend bundles contain zero API keys, passwords, or tokens. There are no public admin dashboards or default credentials that could be probed or brute-forced.
              </p>
            </div>
          </div>

          {/* Explicit Security Limitation Notice */}
          <div className="p-6 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Realistic Security Posture
            </h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              We do not claim that any system is &quot;unhackable&quot; or &quot;100% immune to risk&quot;. Rather, our philosophy is rooted in continuous defense-in-depth, minimization of attack surfaces, strict input sanitization, and architectural isolation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
