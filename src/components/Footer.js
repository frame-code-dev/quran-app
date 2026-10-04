"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Coffee,
  Heart,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Database,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const accountNumber = "1430032353797";
  const accountHolder = "RIFJAN JUNDILA";
  const bankName = "Bank Mandiri";

  const handleCopyAccount = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
        // Fallback untuk browser lama
        const textArea = document.createElement("textarea");
        textArea.value = accountNumber;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin nomor rekening:", err);
    }
  };

  return (
    <footer className="mt-14 pt-8 pb-10 border-t border-stone-200/80 text-stone-700">
      {/* Container Grid */}
      <div className="space-y-8">
        {/* Support & Buy Me a Coffee Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B4332] via-[#245640] to-[#122A20] text-stone-100 p-6 sm:p-8 shadow-sm border border-emerald-900/40">
          {/* Subtle Decorative Background Rings */}
          <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-emerald-400/5 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Description */}
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/50 text-emerald-200 text-xs font-semibold">
                <Coffee className="w-3.5 h-3.5 text-amber-300" />
                <span>Dukung Qur&apos;an App (Buy Me a Coffee)</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Bantu Menjaga Aplikasi Ini Tetap Hidup & Bebas Iklan
              </h3>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Aplikasi ini dikembangkan secara sukarela untuk kemudahan umat dalam berinteraksi dengan firman Allah SWT.
                Dukungan Anda sangat berarti untuk menutupi biaya sewa server, pemeliharaan sistem, dan pengembangan fitur-fitur baru ke depan.
              </p>
            </div>

            {/* Right: Bank Account Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 w-full lg:w-auto min-w-[280px] sm:min-w-[320px] shadow-inner space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    BM
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold block">
                      Transfer Donasi / Infaq
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {bankName}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-700/40">
                  Operasional
                </span>
              </div>

              {/* Account Number & Copy Button */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-300">Nomor Rekening:</span>
                <div className="flex items-center justify-between gap-2 bg-stone-900/40 px-3 py-2 rounded-xl border border-white/10">
                  <span className="font-mono text-base sm:text-lg font-bold tracking-wider text-amber-200 select-all">
                    {accountNumber}
                  </span>
                  <button
                    onClick={handleCopyAccount}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      copied
                        ? "bg-emerald-500 text-stone-950 shadow-xs"
                        : "bg-white/15 hover:bg-white/25 text-white active:scale-95"
                    }`}
                    title="Salin Nomor Rekening Bank Mandiri"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-stone-950 stroke-[3]" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-stone-300 flex items-center justify-between">
                <span>Atas Nama:</span>
                <span className="font-bold text-white tracking-wide">{accountHolder}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid: Developer & API Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
          {/* Card 1: Pengenalan Developer */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                  Pengembang Aplikasi
                </h4>
                <p className="text-xs text-emerald-800 font-semibold">
                  {accountHolder}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Qur&apos;an App dibangun dan dikembangkan oleh <strong>Rifjan Jundila</strong> dengan fokus pada
              kesederhanaan, ketenangan batin, serta kemudahan navigasi bagi setiap muslim yang ingin membaca (<em>Read</em>),
              mendengarkan (<em>Listen</em>), menghafal (<em>Memorize</em>), dan mentadabburi (<em>Reflect</em>) kalam Ilahi setiap hari.
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] text-stone-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Dibuat sebagai dedikasi amal jariyah untuk kemaslahatan bersama.</span>
            </div>
          </div>

          {/* Card 2: Sumber Data & API Attribution */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                  Sumber Data &amp; Integrasi API
                </h4>
                <p className="text-xs text-emerald-800 font-semibold">
                  Transparansi &amp; Atribusi Layanan
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Seluruh data Al-Qur&apos;an bersumber dari integrasi API publik terpercaya yang kami kurasi secara teliti:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-xl bg-stone-50 border border-stone-150">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">equran.id (API v2)</span>
                    <a
                      href="https://equran.id/apiv2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold underline"
                    >
                      <span>Dokumentasi API</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Menyediakan teks Arab standar Kemenag RI, transliterasi Latin, terjemahan Indonesia, audio murattal multi-qari, dan tafsir ringkas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-xl bg-stone-50 border border-stone-150">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">Google Gemini API</span>
                    <span className="text-[10px] text-stone-400 font-medium">AI Tadabbur Engine</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Mendukung modul perenungan ayat harian untuk menggali hikmah, relevansi modern, dan aksi amalan nyata.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Note */}
        <div className="pt-4 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-stone-500">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-stone-700">Qur&apos;an App</span>
            <span>•</span>
            <span>
              Dikembangkan dengan <Heart className="w-3 h-3 text-red-500 fill-current inline mx-0.5" /> oleh{" "}
              <strong className="text-stone-700">{accountHolder}</strong>
            </span>
          </div>

          <div className="text-[11px] text-stone-400">
            Semoga bermanfaat dan bernilai ibadah jariyah bagi kita semua.
          </div>
        </div>
      </div>
    </footer>
  );
}
