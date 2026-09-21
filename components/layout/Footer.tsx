import React from "react";
import Link from "next/link";
import { Layers, ShieldCheck, Lock, Heart } from "lucide-react";
import { AD_CONFIG } from "@/lib/config/ads";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-950 border-t border-surface-800/80 text-surface-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                EVERYTHING<span className="text-brand-400">FILE</span>
              </span>
            </Link>
            <p className="text-sm text-surface-300 font-medium mb-1">
              One place for every file problem.
            </p>
            <p className="text-xs text-surface-400 mb-6">
              Convert. Compress. Organize. Protect.
            </p>

            <div className="p-4 rounded-2xl bg-surface-900/80 border border-surface-800 max-w-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Private & Secure File Processing</span>
              </div>
              <p className="text-[11px] text-surface-400 leading-relaxed">
                Your documents stay safely on your device. We never store, read, or track your files.
              </p>
            </div>
          </div>

          {/* PDF Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              PDF Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/merge-pdf" className="hover:text-white transition-colors">Merge PDF</Link></li>
              <li><Link href="/split-pdf" className="hover:text-white transition-colors">Split PDF</Link></li>
              <li><Link href="/compress-pdf" className="hover:text-white transition-colors">Compress PDF</Link></li>
              <li><Link href="/compress-pdf-to-1mb" className="hover:text-white transition-colors">Compress to 1 MB</Link></li>
              <li><Link href="/compress-pdf-to-500kb" className="hover:text-white transition-colors">Compress to 500 KB</Link></li>
              <li><Link href="/pdf-to-jpg" className="hover:text-white transition-colors">PDF → JPG</Link></li>
              <li><Link href="/jpg-to-pdf" className="hover:text-white transition-colors">JPG → PDF</Link></li>
              <li><Link href="/delete-pdf-pages" className="hover:text-white transition-colors">Delete PDF Pages</Link></li>
              <li><Link href="/extract-pdf-pages" className="hover:text-white transition-colors">Extract PDF Pages</Link></li>
              <li><Link href="/reorder-pdf" className="hover:text-white transition-colors">Reorder PDF</Link></li>
              <li><Link href="/rotate-pdf" className="hover:text-white transition-colors">Rotate PDF</Link></li>
              <li><Link href="/pdf-to-text" className="hover:text-white transition-colors">PDF → Text</Link></li>
            </ul>
          </div>

          {/* Image Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Image Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/compress-image" className="hover:text-white transition-colors">Compress Image</Link></li>
              <li><Link href="/resize-image" className="hover:text-white transition-colors">Resize Image</Link></li>
              <li><Link href="/jpg-to-png" className="hover:text-white transition-colors">JPG → PNG</Link></li>
              <li><Link href="/png-to-jpg" className="hover:text-white transition-colors">PNG → JPG</Link></li>
              <li><Link href="/jpg-to-webp" className="hover:text-white transition-colors">JPG → WebP</Link></li>
              <li><Link href="/webp-to-jpg" className="hover:text-white transition-colors">WebP → JPG</Link></li>
              <li><Link href="/image-to-pdf" className="hover:text-white transition-colors">Image → PDF</Link></li>
              <li><Link href="/crop-image" className="hover:text-white transition-colors">Crop Image</Link></li>
            </ul>
          </div>

          {/* Document & Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Company & Help
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/compress-file" className="hover:text-emerald-400 text-emerald-400 font-semibold transition-colors">Compress Any File</Link></li>
              <li><Link href="/pdf-to-word" className="hover:text-white transition-colors">PDF → Word (.docx)</Link></li>
              <li><Link href="/word-to-pdf" className="hover:text-white transition-colors">Word (.docx) → PDF</Link></li>
              <li className="pt-2"><Link href="/privacy" className="hover:text-white transition-colors font-medium text-surface-300">Privacy Policy</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors font-medium text-surface-300">How It Works</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li className="pt-2">
                <a
                  href={AD_CONFIG.smartlink3}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Featured Partner Perks ↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Partner Referral Banner */}
        <div className="pt-8 pb-4 flex flex-col items-center justify-center">
          <a
            href="https://beta.publishers.adsterra.com/referral/xBrKP5ngSW"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="block max-w-full overflow-hidden rounded-xl border border-surface-800/80 hover:border-surface-700 transition-all opacity-85 hover:opacity-100 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://landings-cdn.adsterratech.com/referralBanners/png/728%20x%2090%20px.png"
              alt="Monetize your website with Adsterra Network"
              className="w-full max-w-[728px] h-auto object-contain block"
              loading="lazy"
            />
          </a>
        </div>

        {/* Bottom Guarantee */}
        <div className="pt-6 border-t border-surface-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Everything File. 100% Free & Private File Utilities.</p>
          <div className="flex flex-wrap items-center gap-4 text-surface-400">
            <span>Files Stay Private</span>
            <span>•</span>
            <span>No File Retention</span>
            <span>•</span>
            <a
              href={AD_CONFIG.smartlink3}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="text-amber-400/90 hover:text-amber-300 transition-colors font-medium underline"
            >
              Sponsored Offers
            </a>
            <span>•</span>
            <a
              href={AD_CONFIG.smartlink2}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="text-amber-400/90 hover:text-amber-300 transition-colors font-medium underline"
            >
              Partner Deals
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
