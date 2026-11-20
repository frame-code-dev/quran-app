"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  BookOpen,
  Play,
  RotateCw,
  Check,
  Repeat,
  Type,
  ScrollText,
  X,
} from "lucide-react";
import { formatAyatMarker } from "@/utils/quranStorage";

/**
 * Mengambil 2–3 kata pertama dari teks Arab untuk mode uji "Awalan Ayat"
 */
function getArabicCueWords(text = "") {
  const words = text.trim().split(/\s+/);
  if (words.length <= 3) return words.slice(0, 1).join(" ") + " ...";
  return words.slice(0, 2).join(" ") + " ...";
}

export default function MemorizeMode({
  surat,
  onPlayAyat,
  onStartRangeLoop,
  activeLoopRange,
  onClearRangeLoop,
  onOpenReflection,
}) {
  // 'first_words' (Uji Awalan) | 'tap_to_reveal' (Samarkan) | 'hide_arabic' (Tutup Arab) | 'all' (Buka Semua)
  const [displayMode, setDisplayMode] = useState("first_words");
  const [revealedAyat, setRevealedAyat] = useState({});
  const [progress, setProgress] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");

  // Range Loop Controls (Muraja'ah blok ayat, mis. Ayat 1 s/d 5)
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(Math.min(5, surat.jumlahAyat));

  useEffect(() => {
    setRangeStart(1);
    setRangeEnd(Math.min(5, surat.jumlahAyat));
    try {
      const saved = localStorage.getItem(`quran_memorize_${surat.nomor}`);
      setProgress(saved ? JSON.parse(saved) : {});
    } catch {
      setProgress({});
    }
  }, [surat.nomor, surat.jumlahAyat]);

  const setAyatStatus = (ayatNomor, status) => {
    const next = { ...progress, [ayatNomor]: status };
    setProgress(next);
    try {
      localStorage.setItem(`quran_memorize_${surat.nomor}`, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("quran-storage-update"));
    } catch {}
  };

  const toggleReveal = (ayatNomor) => {
    setRevealedAyat((prev) => ({ ...prev, [ayatNomor]: !prev[ayatNomor] }));
  };

  const resetReveals = () => setRevealedAyat({});

  const totalAyat = surat.jumlahAyat;
  const mutqinCount = Object.values(progress).filter((s) => s === "mutqin").length;
  const prosesCount = Object.values(progress).filter((s) => s === "proses").length;
  const belumCount = totalAyat - (mutqinCount + prosesCount);
  const percentMutqin = Math.round((mutqinCount / totalAyat) * 100);

  const filteredAyat = surat.ayat.filter((a) => {
    if (filterStatus === "all") return true;
    return (progress[a.nomorAyat] || "belum") === filterStatus;
  });

  const handleApplyRangeLoop = () => {
    const start = Math.max(1, Math.min(rangeStart, totalAyat));
    const end = Math.max(start, Math.min(rangeEnd, totalAyat));
    setRangeStart(start);
    setRangeEnd(end);
    if (onStartRangeLoop) {
      onStartRangeLoop(start, end);
    }
  };

  return (
    <div className="space-y-5">
      {/* Progress Summary Card */}
      <div className="bg-[#1B4332] text-stone-100 rounded-2xl p-5 sm:p-6 border border-white/10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-widest text-[#D4B680]">
              Catatan Muraja&apos;ah
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-white mt-0.5">
              QS. {surat.namaLatin}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">
              {percentMutqin}%
            </span>
            <p className="text-[11px] text-emerald-200/80">Mutqin (Lancar)</p>
          </div>
        </div>

        <div className="w-full bg-black/25 rounded-full h-2 mb-4 overflow-hidden flex">
          <div
            className="bg-emerald-400 h-full transition-all duration-500"
            style={{ width: `${(mutqinCount / totalAyat) * 100}%` }}
          />
          <div
            className="bg-[#D4B680] h-full transition-all duration-500"
            style={{ width: `${(prosesCount / totalAyat) * 100}%` }}
          />
        </div>

        {/* Status Filter Chips (Interactive) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { id: "all", label: "Semua Ayat", count: totalAyat },
            { id: "mutqin", label: "Mutqin", count: mutqinCount },
            { id: "proses", label: "Sedang Proses", count: prosesCount },
            { id: "belum", label: "Belum Hafal", count: belumCount },
          ].map((stat) => {
            const active = filterStatus === stat.id;
            return (
              <button
                key={stat.id}
                type="button"
                onClick={() => setFilterStatus(stat.id)}
                className={`rounded-xl px-3 py-2 text-left transition-colors border cursor-pointer ${
                  active
                    ? "bg-white text-[#1B4332] border-white font-semibold"
                    : "bg-white/10 text-stone-100 border-white/10 hover:bg-white/15"
                }`}
              >
                <span className={`block text-[10px] ${active ? "text-stone-600" : "text-stone-300"}`}>
                  {stat.label}
                </span>
                <span className="text-sm font-semibold tabular-nums">{stat.count} Ayat</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls: Metode Uji + Loop Blok Ayat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Test Mode Switcher */}
        <div className="lg:col-span-7 surface-card rounded-2xl p-4 border border-theme space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold ink-primary">Metode Uji Hafalan</span>
            {displayMode !== "all" && (
              <button
                type="button"
                onClick={resetReveals}
                className="text-[11px] font-medium text-emerald-700 hover:underline cursor-pointer"
              >
                Tutup Ulang Semua
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: "first_words", label: "Awalan Ayat", icon: Type },
              { id: "tap_to_reveal", label: "Samarkan", icon: Eye },
              { id: "hide_arabic", label: "Tutup Arab", icon: EyeOff },
              { id: "all", label: "Tampil Penuh", icon: BookOpen },
            ].map((m) => {
              const Icon = m.icon;
              const active = displayMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setDisplayMode(m.id);
                    resetReveals();
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-colors border flex items-center justify-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-[#1B4332] text-white border-[#1B4332]"
                      : "surface-elevated ink-secondary border-theme hover:ink-primary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] ink-muted">
            {displayMode === "first_words" &&
              "Menampilkan awal kalimat saja untuk melatih kelancaran sambungan ayat. Ketuk kotak ayat untuk memeriksa."}
            {displayMode === "tap_to_reveal" &&
              "Seluruh teks Arab disamarkan. Ketuk ayat untuk membuka sementara."}
            {displayMode === "hide_arabic" &&
              "Gunakan terjemahan sebagai pancingan untuk melafalkan ayat Arabnya."}
            {displayMode === "all" &&
              "Menampilkan ayat secara utuh untuk tahap awal membaca dan menyimak."}
          </p>
        </div>

        {/* Audio Range Loop (Blok Ayat) */}
        <div className="lg:col-span-5 surface-card rounded-2xl p-4 border border-theme flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold ink-primary flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ulang Blok Ayat (Audio)</span>
            </span>
            {activeLoopRange && onClearRangeLoop && (
              <button
                type="button"
                onClick={onClearRangeLoop}
                className="text-[11px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Hentikan</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="flex-1 space-y-1">
              <span className="text-[10px] ink-muted block">Dari Ayat</span>
              <input
                type="number"
                min={1}
                max={totalAyat}
                value={rangeStart}
                onChange={(e) => setRangeStart(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg surface-elevated border border-theme ink-primary text-xs tabular-nums"
              />
            </label>
            <span className="ink-muted pt-4">–</span>
            <label className="flex-1 space-y-1">
              <span className="text-[10px] ink-muted block">Sampai Ayat</span>
              <input
                type="number"
                min={rangeStart}
                max={totalAyat}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg surface-elevated border border-theme ink-primary text-xs tabular-nums"
              />
            </label>
            <button
              type="button"
              onClick={handleApplyRangeLoop}
              className="mt-4 px-3.5 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#245640] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Putar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verse List */}
      {filteredAyat.length === 0 ? (
        <div className="text-center py-10 surface-card rounded-2xl border border-theme">
          <p className="text-sm font-medium ink-primary">Tidak ada ayat pada kategori ini</p>
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className="mt-2 text-xs text-emerald-700 font-medium hover:underline cursor-pointer"
          >
            Tampilkan semua ayat
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAyat.map((ayat, idx) => {
            const isRevealed = !!revealedAyat[ayat.nomorAyat];
            const currentStatus = progress[ayat.nomorAyat] || "belum";
            const isInActiveRange =
              activeLoopRange &&
              ayat.nomorAyat >= activeLoopRange.startAyat &&
              ayat.nomorAyat <= activeLoopRange.endAyat;

            return (
              <div
                key={ayat.nomorAyat}
                id={`ayat-${ayat.nomorAyat}`}
                className={`surface-card rounded-2xl border transition-colors p-4 sm:p-5 ${
                  idx >= 6 ? "verse-deferred" : ""
                } ${
                  isInActiveRange
                    ? "border-[#2D6A4F] surface-accent-soft"
                    : currentStatus === "mutqin"
                    ? "border-emerald-700/40"
                    : currentStatus === "proses"
                    ? "border-[#C8A978]/60"
                    : "border-theme"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-theme">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg surface-elevated border border-theme ink-primary flex items-center justify-center font-semibold text-xs tabular-nums">
                      {ayat.nomorAyat}
                    </span>
                    {isInActiveRange && (
                      <span className="text-[10px] font-medium text-emerald-700">
                        Dalam blok ulang
                      </span>
                    )}
                  </div>

                  {/* Status Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[
                      { id: "belum", label: "Belum" },
                      { id: "proses", label: "Proses" },
                      { id: "mutqin", label: "Mutqin" },
                    ].map((st) => {
                      const active = currentStatus === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setAyatStatus(ayat.nomorAyat, st.id)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                            active
                              ? st.id === "mutqin"
                                ? "bg-[#1B4332] text-white border-[#1B4332] font-medium"
                                : st.id === "proses"
                                ? "surface-brass-soft ink-primary border-[#9A7B4F] font-medium"
                                : "surface-elevated ink-primary border-[var(--border-strong)] font-medium"
                              : "border-theme ink-muted hover:ink-primary"
                          }`}
                        >
                          {st.id === "mutqin" && active && <Check className="w-3 h-3" />}
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Arabic Display based on Test Mode */}
                {displayMode === "first_words" && !isRevealed ? (
                  <button
                    type="button"
                    onClick={() => toggleReveal(ayat.nomorAyat)}
                    className="w-full text-right p-4 rounded-xl surface-elevated border border-dashed border-[var(--border-strong)] hover:border-[#2D6A4F] transition-colors mb-3 cursor-pointer"
                  >
                    <p className="font-arabic text-2xl sm:text-3xl ink-arabic">
                      {getArabicCueWords(ayat.teksArab)}
                    </p>
                    <span className="text-[11px] ink-muted block text-left mt-2">
                      Ketuk untuk membuka kelanjutan ayat
                    </span>
                  </button>
                ) : displayMode === "hide_arabic" && !isRevealed ? (
                  <button
                    type="button"
                    onClick={() => toggleReveal(ayat.nomorAyat)}
                    className="w-full py-5 px-4 text-center surface-elevated rounded-xl border border-dashed border-[var(--border-strong)] hover:border-[#2D6A4F] transition-colors mb-3 cursor-pointer"
                  >
                    <span className="text-xs font-medium ink-muted">
                      Teks Arab disembunyikan — ketuk untuk memeriksa hafalan
                    </span>
                  </button>
                ) : (
                  <div
                    onClick={() =>
                      (displayMode === "tap_to_reveal" ||
                        displayMode === "first_words" ||
                        displayMode === "hide_arabic") &&
                      toggleReveal(ayat.nomorAyat)
                    }
                    className={`transition-all mb-3 ${
                      displayMode !== "all" ? "cursor-pointer" : ""
                    } ${
                      displayMode === "tap_to_reveal" && !isRevealed
                        ? "p-3.5 rounded-xl surface-elevated border border-dashed border-[var(--border-strong)]"
                        : ""
                    }`}
                  >
                    <p
                      className={`font-arabic text-2xl sm:text-3xl ink-arabic transition-[filter] duration-200 ${
                        displayMode === "tap_to_reveal" && !isRevealed
                          ? "blur-[8px] select-none"
                          : ""
                      }`}
                    >
                      {ayat.teksArab}
                      <span className="ayat-end-ornament">{formatAyatMarker(ayat.nomorAyat)}</span>
                    </p>
                  </div>
                )}

                {/* Translation Cue */}
                <p className="text-xs sm:text-sm ink-secondary leading-relaxed pt-2 border-t border-theme">
                  {ayat.teksIndonesia}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-theme">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPlayAyat(ayat, 1)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg surface-elevated border border-theme hover:border-[var(--border-strong)] ink-primary text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Putar</span>
                    </button>
                    {[3, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => onPlayAyat(ayat, n)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg surface-accent-soft text-emerald-800 dark:text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
                        title={`Ulangi ayat ini ${n} kali`}
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>{n}×</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenReflection(ayat)}
                    className="inline-flex items-center gap-1 text-xs ink-muted hover:ink-primary font-medium transition-colors cursor-pointer"
                  >
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>Tafsir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
