import React from "react";
import { ShieldCheck, Lock, EyeOff, Server, HardDrive } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Everything File",
  description: "Transparent privacy policy explaining on-device processing, temporary conversions, and zero-cookie architecture.",
};

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy by Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-surface-300 text-sm sm:text-base leading-relaxed">
          We believe the most secure way to handle your personal documents is to never see them in the first place.
        </p>
      </div>

      <div className="space-y-8 text-surface-300 text-sm leading-relaxed">
        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Local Device Processing</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              All PDF and Image manipulation tools (Merge, Split, Compress, Rotate, Delete Pages, JPG to PNG, Crop, etc.) execute 100% inside your browser memory using WebAssembly. Your files are never uploaded to our servers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Temporary Conversion Subsystem</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              When converting between PDF and Word via our isolated conversion API, documents are held temporarily in memory or isolated storage outside the web root solely for conversion, and are permanently destroyed immediately after output is streamed.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="p-8 rounded-3xl bg-surface-900/60 border border-surface-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">What Information We Collect</h3>
            <p className="text-xs text-surface-400 leading-relaxed mb-2">
              We collect zero personally identifiable information (PII). We do not require registration, usernames, passwords, or emails.
            </p>
            <p className="text-xs text-surface-400 leading-relaxed">
              For security and abuse mitigation, our server records anonymous request telemetry: timestamp, HTTP method, endpoint, masked IP address (e.g. 192.168.xxx.xxx), and sanitized user agent strings.
            </p>
          </div>

          <div className="pt-4 border-t border-surface-800">
            <h3 className="text-lg font-bold text-white mb-2">What We NEVER Collect or Store</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-surface-400">
              <li>We NEVER store the contents of your uploaded documents.</li>
              <li>We NEVER store passwords, session tokens, or payment details.</li>
              <li>We NEVER sell, rent, or share telemetry data with advertisers or data brokers.</li>
              <li>We NEVER use third-party tracking scripts or advertising cookies.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-surface-800">
            <h3 className="text-lg font-bold text-white mb-2">Zero Cookie Policy</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Everything File operates without any tracking cookies, marketing cookies, or third-party analytical cookies. We respect your browser&apos;s privacy settings natively.
            </p>
          </div>

          <div className="pt-4 border-t border-surface-800">
            <h3 className="text-lg font-bold text-white mb-2">Security Logging & Event IDs</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              When a technical or security exception occurs, our system may issue a sanitized reference ID (e.g. <code className="text-brand-300 font-mono">ERR-8F3A</code>). This ID correlates to sanitized error logs without referencing your file contents or personal identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
