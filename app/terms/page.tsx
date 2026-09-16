import React from "react";

export const metadata = {
  title: "Terms of Service — Everything File",
  description: "Terms of service and fair use guidelines for Everything File file utility platform.",
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-surface-300 text-sm leading-relaxed">
          Please review the terms governing your use of Everything File.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-surface-900 border border-surface-800 space-y-6 text-surface-300 text-xs sm:text-sm leading-relaxed">
        <div>
          <h3 className="text-base font-bold text-white mb-2">1. Acceptance of Terms</h3>
          <p className="text-surface-400">
            By accessing or using Everything File, you agree to be bound by these Terms of Service. If you do not agree with these terms, please do not use the service.
          </p>
        </div>

        <div className="pt-4 border-t border-surface-800">
          <h3 className="text-base font-bold text-white mb-2">2. Document Ownership & Content</h3>
          <p className="text-surface-400">
            You retain all rights, title, and ownership of any files you process through Everything File. We claim no intellectual property rights over your files. You represent that you have the right and legal authority to manipulate any document you process.
          </p>
        </div>

        <div className="pt-4 border-t border-surface-800">
          <h3 className="text-base font-bold text-white mb-2">3. Prohibited Uses</h3>
          <p className="text-surface-400 mb-2">
            You agree not to use the service to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-surface-400">
            <li>Upload or process malicious software, viruses, trojans, or exploit payloads.</li>
            <li>Attempt to bypass rate limits, server sandboxes, or security controls.</li>
            <li>Probe, scan, or test the vulnerability of our endpoints without authorization.</li>
            <li>Transmit files that infringe on third-party intellectual property rights.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-surface-800">
          <h3 className="text-base font-bold text-white mb-2">4. Disclaimer of Warranties</h3>
          <p className="text-surface-400">
            Everything File is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. We do not guarantee uninterrupted or error-free processing. We advise keeping original backup copies of all documents before performing any destructive file actions.
          </p>
        </div>
      </div>
    </div>
  );
}
