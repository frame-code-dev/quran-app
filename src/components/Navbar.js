"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, X, Bookmark, Smartphone } from "lucide-react";

export default function Navbar({ isMobileFrame, setIsMobileFrame, searchQuery, setSearchQuery }) {
  const [lastRead, setLastRead] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("quran_last_read");
      if (saved) {
        setLastRead(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200 transition-all duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-stone-100 flex items-center justify-center shadow-xs group-hover:bg-emerald-900 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-base text-stone-900">QURAN</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/50">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block">Read • Listen • Memorize • Reflect</p>
          </div>
        </Link>

        {/* Search Bar (if on homepage) */}
        {setSearchQuery !== undefined && (
          <div className="flex-1 max-w-xs relative hidden md:block">
            <input
              type="text"
              placeholder="Cari surat (contoh: Yasin, Al-Mulk, 36)..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Right action tools */}
        <div className="flex items-center gap-2">
          {/* Last Read Quick Badge */}
          {lastRead && (
            <Link
              href={`/surat/${lastRead.nomor}#ayat-${lastRead.ayat || 1}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
              title="Lanjutkan Membaca Terakhir"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
              <span className="truncate max-w-[110px]">
                {lastRead.namaLatin}: {lastRead.ayat || 1}
              </span>
            </Link>
          )}

          {/* Toggle Mobile Device Preview Frame */}
          {setIsMobileFrame && (
            <button
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                isMobileFrame
                  ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
              }`}
              title="Simulasi Tampilan Layar HP / Mobile Device"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isMobileFrame ? "Mode Full Web" : "Mode HP"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
