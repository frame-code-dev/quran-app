"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, BookOpen, Sparkles, Play, RotateCw, Check } from "lucide-react";

export default function MemorizeMode({
  surat,
  onPlayAyat,
  onOpenReflection,
}) {
  const [displayMode, setDisplayMode] = useState("tap_to_reveal"); // 'all' | 'hide_arabic' | 'hide_translation' | 'tap_to_reveal'
  const [revealedAyat, setRevealedAyat] = useState({}); // { [ayatNumber]: boolean }
  const [progress, setProgress] = useState({}); // { [ayatNumber]: 'belum' | 'proses' | 'mutqin' }
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'belum' | 'proses' | 'mutqin'

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`quran_memorize_${surat.nomor}`);
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, [surat.nomor]);

  const setAyatStatus = (ayatNomor, status) => {
    const next = { ...progress, [ayatNomor]: status };
    setProgress(next);
    try {
      localStorage.setItem(`quran_memorize_${surat.nomor}`, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const toggleReveal = (ayatNomor) => {
    setRevealedAyat((prev) => ({ ...prev, [ayatNomor]: !prev[ayatNomor] }));
  };

  const resetReveals = () => {
    setRevealedAyat({});
  };

  // Calculate statistics
  const totalAyat = surat.jumlahAyat;
  const mutqinCount = Object.values(progress).filter((s) => s === "mutqin").length;
  const prosesCount = Object.values(progress).filter((s) => s === "proses").length;
  const percentMutqin = Math.round((mutqinCount / totalAyat) * 100);

  const filteredAyat = surat.ayat.filter((a) => {
    if (filterStatus === "all") return true;
    const s = progress[a.nomorAyat] || "belum";
    return s === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Hafalan Progress Card - Heritage Forest Theme without neon slop */}
      <div className="bg-[#1B4332] text-stone-100 rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-700/30 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <span className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">
                Progress Hafalan
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5">
                QS. {surat.namaLatin} ({surat.nama})
              </h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-emerald-300">{percentMutqin}%</span>
              <p className="text-[11px] text-stone-300">Mutqin (Lancar)</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-emerald-950/80 rounded-full h-2.5 mb-4 overflow-hidden border border-emerald-800/60 flex">
            <div
              className="bg-emerald-400 h-full transition-all duration-500"
              style={{ width: `${(mutqinCount / totalAyat) * 100}%` }}
              title={`Mutqin: ${mutqinCount} ayat`}
            ></div>
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${(prosesCount / totalAyat) * 100}%` }}
              title={`Sedang Dihafal: ${prosesCount} ayat`}
            ></div>
          </div>

          {/* Status Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <p className="text-stone-300 text-[11px]">Mutqin</p>
              <p className="font-bold text-emerald-300 text-sm">{mutqinCount} Ayat</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <p className="text-stone-300 text-[11px]">Sedang Proses</p>
              <p className="font-bold text-amber-300 text-sm">{prosesCount} Ayat</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <p className="text-stone-300 text-[11px]">Belum Hafal</p>
              <p className="font-bold text-stone-200 text-sm">
                {totalAyat - (mutqinCount + prosesCount)} Ayat
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Display Mode & Status Filter */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
        <div>
          <label className="text-xs font-bold text-stone-700 block mb-2">
            Mode Uji Hafalan:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              onClick={() => setDisplayMode("tap_to_reveal")}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                displayMode === "tap_to_reveal"
                  ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                  : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Tap to Reveal</span>
            </button>
            <button
              onClick={() => setDisplayMode("hide_arabic")}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                displayMode === "hide_arabic"
                  ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                  : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Tutup Arab</span>
            </button>
            <button
              onClick={() => setDisplayMode("hide_translation")}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                displayMode === "hide_translation"
                  ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                  : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Arab Saja</span>
            </button>
            <button
              onClick={() => setDisplayMode("all")}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                displayMode === "all"
                  ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                  : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buka Semua</span>
            </button>
          </div>
        </div>

        {displayMode === "tap_to_reveal" && (
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span>Ketuk teks Arab yang tersamar untuk membuka bacaan.</span>
            <button
              onClick={resetReveals}
              className="text-emerald-800 hover:underline font-semibold"
            >
              Samarkan Ulang Semua
            </button>
          </div>
        )}
      </div>

      {/* Verses List for Memorization */}
      <div className="space-y-3">
        {filteredAyat.map((ayat) => {
          const isRevealed = !!revealedAyat[ayat.nomorAyat];
          const currentStatus = progress[ayat.nomorAyat] || "belum";

          return (
            <div
              key={ayat.nomorAyat}
              id={`ayat-${ayat.nomorAyat}`}
              className={`bg-white rounded-2xl border transition-all duration-200 p-3.5 sm:p-5 ${
                currentStatus === "mutqin"
                  ? "border-emerald-300 bg-emerald-50/20"
                  : currentStatus === "proses"
                  ? "border-amber-300 bg-amber-50/10"
                  : "border-stone-200"
              }`}
            >
              {/* Header: Ayat Number & Status Selector */}
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs border border-stone-200/50">
                    {ayat.nomorAyat}
                  </span>
                  <span className="text-xs text-stone-500">Ayat {ayat.nomorAyat}</span>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setAyatStatus(ayat.nomorAyat, "belum")}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                      currentStatus === "belum"
                        ? "bg-stone-200 text-stone-800 font-bold border-stone-300"
                        : "text-stone-400 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    Belum
                  </button>
                  <button
                    onClick={() => setAyatStatus(ayat.nomorAyat, "proses")}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                      currentStatus === "proses"
                        ? "bg-amber-100 text-amber-800 font-bold border-amber-300"
                        : "text-stone-400 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    Proses
                  </button>
                  <button
                    onClick={() => setAyatStatus(ayat.nomorAyat, "mutqin")}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                      currentStatus === "mutqin"
                        ? "bg-emerald-100 text-emerald-800 font-bold border-emerald-300"
                        : "text-stone-400 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Mutqin</span>
                  </button>
                </div>
              </div>

              {/* Arabic Text */}
              {displayMode !== "hide_arabic" ? (
                <div
                  onClick={() => displayMode === "tap_to_reveal" && toggleReveal(ayat.nomorAyat)}
                  className={`cursor-pointer transition-all ${
                    displayMode === "tap_to_reveal" && !isRevealed
                      ? "filter blur-md select-none bg-stone-100/50 p-3 rounded-xl border border-dashed border-stone-300"
                      : ""
                  }`}
                  title={displayMode === "tap_to_reveal" ? "Klik untuk mengintip ayat" : ""}
                >
                  <p className="font-arabic text-2xl sm:text-3xl text-emerald-950 font-bold leading-relaxed mb-3">
                    {ayat.teksArab}
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => toggleReveal(ayat.nomorAyat)}
                  className="cursor-pointer py-4 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200 mb-3"
                >
                  <span className="text-xs font-semibold text-stone-500">
                    {isRevealed ? ayat.teksArab : "Teks Arab disembunyikan (Klik untuk membuka)"}
                  </span>
                </div>
              )}

              {/* Latin & Indonesian Translation */}
              {displayMode !== "hide_translation" && (
                <div className="pt-2 border-t border-stone-100 space-y-1">
                  {ayat.teksLatin && (
                    <p className="text-xs text-emerald-900/80 italic">{ayat.teksLatin}</p>
                  )}
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {ayat.teksIndonesia}
                  </p>
                </div>
              )}

              {/* Actions: Audio loop & Tadabbur */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPlayAyat(ayat, 1)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 text-xs font-medium transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Putar</span>
                  </button>
                  <button
                    onClick={() => onPlayAyat(ayat, 3)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                    title="Ulangi 3x untuk hafalan"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>3x</span>
                  </button>
                  <button
                    onClick={() => onPlayAyat(ayat, 5)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                    title="Ulangi 5x untuk hafalan"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>5x</span>
                  </button>
                </div>

                <button
                  onClick={() => onOpenReflection(ayat)}
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-emerald-800 font-medium transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Tadabbur</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
