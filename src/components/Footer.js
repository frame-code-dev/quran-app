"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, HeartHandshake } from "lucide-react";

export default function Footer({ compact = false }) {
  const [copied, setCopied] = useState(false);
  const accountNumber = "1430032353797";
  const accountHolder = "RIFJAN JUNDILA";
  const bankName = "Bank Mandiri";

  const handleCopyAccount = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
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
    <footer className="mt-14 pt-8 pb-10 border-t border-theme">
      <div className="space-y-6">
        {/* Compact & Sincere Infaq / Support Section */}
        <div className="rounded-2xl surface-card border border-theme p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-lg">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ink-brass">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Dukungan Operasional &amp; Amal Jariyah</span>
              </div>
              <h3 className="font-editorial text-lg font-semibold ink-primary">
                Menjaga Ruang Baca Ini Tetap Tenang &amp; Bebas Iklan
              </h3>
              {!compact && (
                <p className="text-xs ink-secondary leading-relaxed">
                  Dikembangkan secara mandiri oleh <strong>Rifjan Jundila</strong> agar setiap muslim
                  dapat membaca, menyimak murattal, dan mentadabburi Al-Qur&apos;an tanpa gangguan iklan.
                  Jika aplikasi ini membawa manfaat, Anda dapat turut mendukung biaya server dan pemeliharaan.
                </p>
              )}
            </div>

            {/* Clean Bank Details Box */}
            <div className="surface-elevated border border-theme rounded-xl p-3.5 sm:min-w-[290px] space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold ink-primary">{bankName}</span>
                <span className="text-[11px] ink-muted">a.n. {accountHolder}</span>
              </div>
              <div className="flex items-center justify-between gap-2 surface-card px-3 py-2 rounded-lg border border-theme">
                <span className="font-mono text-sm font-semibold tracking-wider ink-primary select-all">
                  {accountNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    copied
                      ? "bg-[#1B4332] text-white"
                      : "surface-elevated ink-primary hover:bg-black/5"
                  }`}
                  title="Salin nomor rekening Bank Mandiri"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin</span>
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
          </div>
        </div>

        {/* Attribution & Colophon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ink-muted pt-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-editorial font-semibold ink-primary">Al-Qur&apos;an Al-Karim</span>
            <span>•</span>
            <span>
              Teks Arab, terjemahan &amp; tafsir Kemenag RI bersumber dari{" "}
              <a
                href="https://equran.id/apiv2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-emerald-700 hover:underline font-medium"
              >
                <span>equran.id</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </div>

          <div className="text-[11px] ink-muted">
            Semoga bernilai kebaikan yang terus mengalir bagi kita semua.
          </div>
        </div>
      </div>
    </footer>
  );
}
