"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BookOpen,
  ScrollText,
  PenLine,
  Lightbulb,
  Compass,
  HeartHandshake,
  Copy,
  Check,
  X,
  Trash2,
} from "lucide-react";
import {
  formatAyatMarker,
  getAyatNote,
  saveAyatNote,
  attachDialogOutsideClickFallback,
} from "@/utils/quranStorage";

export default function ReflectionModal({ isOpen, onClose, ayatData }) {
  const [activeTab, setActiveTab] = useState("tadabbur"); // 'tadabbur' | 'tafsir' | 'note'
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState(null);
  const [copied, setCopied] = useState(false);

  // Personal journal note state
  const [noteText, setNoteText] = useState("");
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  const dialogRef = useRef(null);

  const fetchReflection = useCallback(async () => {
    if (!ayatData) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorSurat: ayatData.suratNomor,
          namaSurat: ayatData.suratNamaLatin,
          nomorAyat: ayatData.nomorAyat,
          teksArab: ayatData.teksArab,
          teksIndonesia: ayatData.teksIndonesia,
          tafsir: ayatData.tafsir || "",
        }),
      });
      const data = await res.json();
      if (data.success && data.reflection) {
        setReflection(data.reflection);
      }
    } catch (e) {
      console.error("Gagal mengambil intisari tadabbur:", e);
    } finally {
      setLoading(false);
    }
  }, [ayatData]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && ayatData) {
      setNoteText(getAyatNote(ayatData.suratNomor, ayatData.nomorAyat));
      setNoteSavedFeedback(false);
      fetchReflection();
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) dialog.close();
      setReflection(null);
      setCopied(false);
    }
  }, [isOpen, ayatData, fetchReflection]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      dialog.returnValue = "";
      onClose();
    };
    dialog.addEventListener("close", handleClose);
    const detachFallback = attachDialogOutsideClickFallback(dialog, onClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
      detachFallback();
    };
  }, [onClose]);

  const handleSaveNote = () => {
    if (!ayatData) return;
    saveAyatNote(ayatData.suratNomor, ayatData.nomorAyat, ayatData.suratNamaLatin, noteText);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2000);
  };

  const handleClearNote = () => {
    if (!ayatData) return;
    setNoteText("");
    saveAyatNote(ayatData.suratNomor, ayatData.nomorAyat, ayatData.suratNamaLatin, "");
  };

  const copyReflection = () => {
    if (!ayatData) return;
    const text = `Tadabbur QS. ${ayatData.suratNamaLatin} : Ayat ${ayatData.nomorAyat}\n\n${
      ayatData.teksArab
    }\n\n"${ayatData.teksIndonesia}"\n\nIntisari Pesan:\n${
      reflection?.konteks || ""
    }\n\nPelajaran Ayat:\n${(reflection?.hikmah || [])
      .map((h) => `• ${h}`)
      .join("\n")}\n\nAmalan Hari Ini:\n${reflection?.aksiNyata || ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="tadabbur-modal-title"
      className="app-modal p-3 sm:p-4 w-full max-w-2xl"
    >
      {ayatData && (
        <div className="surface-card rounded-3xl w-full max-h-[90dvh] flex flex-col shadow-2xl border border-theme overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-theme flex items-center justify-between surface-elevated">
            <div>
              <h2
                id="tadabbur-modal-title"
                className="font-editorial font-semibold ink-primary text-base sm:text-lg"
              >
                Tafsir &amp; Tadabbur
              </h2>
              <p className="text-xs ink-muted">
                QS. {ayatData.suratNamaLatin} : Ayat {ayatData.nomorAyat}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup jendela tafsir"
              className="w-8 h-8 rounded-full hover:bg-black/5 ink-muted hover:ink-primary flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 overflow-y-auto custom-scroll space-y-5">
            {/* Ayat Quotation Card */}
            <div className="p-4 sm:p-5 rounded-2xl surface-elevated border border-theme space-y-2.5">
              <p className="font-arabic text-2xl sm:text-3xl ink-arabic">
                {ayatData.teksArab}
                <span className="ayat-end-ornament">{formatAyatMarker(ayatData.nomorAyat)}</span>
              </p>
              {ayatData.teksLatin && (
                <p className="text-xs ink-brass italic leading-relaxed">{ayatData.teksLatin}</p>
              )}
              <p className="text-xs sm:text-sm ink-secondary leading-relaxed pt-1 border-t border-theme">
                &quot;{ayatData.teksIndonesia}&quot;
              </p>
            </div>

            {/* 3 Functional Tabs */}
            <div className="flex border-b border-theme gap-5 text-xs font-medium overflow-x-auto">
              {[
                { id: "tadabbur", label: "Intisari & Hikmah", icon: BookOpen },
                { id: "tafsir", label: "Tafsir Kemenag", icon: ScrollText },
                {
                  id: "note",
                  label: noteText.trim() ? "Catatan Hati •" : "Catatan Hati",
                  icon: PenLine,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2.5 whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? "border-[#1B4332] ink-primary font-semibold"
                        : "border-transparent ink-muted hover:ink-primary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Intisari & Hikmah */}
            {activeTab === "tadabbur" && (
              <div className="space-y-3.5">
                {loading ? (
                  <div className="py-10 text-center space-y-2.5">
                    <div className="w-7 h-7 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs ink-muted">Menyusun intisari dan hikmah ayat...</p>
                  </div>
                ) : reflection ? (
                  <div className="space-y-3.5 text-xs sm:text-sm">
                    <div className="p-4 rounded-2xl surface-elevated border border-theme">
                      <h3 className="font-semibold ink-primary flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Pesan Pokok</span>
                      </h3>
                      <p className="ink-secondary leading-relaxed">{reflection.konteks}</p>
                    </div>

                    {Array.isArray(reflection.hikmah) && reflection.hikmah.length > 0 && (
                      <div className="p-4 rounded-2xl surface-elevated border border-theme">
                        <h3 className="font-semibold ink-primary flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider">
                          <Lightbulb className="w-3.5 h-3.5 ink-brass" />
                          <span>Pelajaran yang Dapat Dipetik</span>
                        </h3>
                        <ul className="space-y-2 ink-secondary">
                          {reflection.hikmah.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="ink-brass font-bold mt-0.5">—</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {reflection.relevansi && (
                      <div className="p-4 rounded-2xl surface-elevated border border-theme">
                        <h3 className="font-semibold ink-primary flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                          <Compass className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Relevansi Sehari-hari</span>
                        </h3>
                        <p className="ink-secondary leading-relaxed">{reflection.relevansi}</p>
                      </div>
                    )}

                    {reflection.aksiNyata && (
                      <div className="p-4 rounded-2xl surface-accent-soft border border-emerald-700/25">
                        <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Amalan Praktis Hari Ini</span>
                        </h3>
                        <p className="ink-primary leading-relaxed">{reflection.aksiNyata}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-xs ink-muted">Intisari ayat belum berhasil dimuat.</p>
                    <button
                      type="button"
                      onClick={fetchReflection}
                      className="px-4 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-medium hover:bg-[#245640] transition-colors cursor-pointer"
                    >
                      Muat Ulang
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Tafsir Kemenag */}
            {activeTab === "tafsir" && (
              <div className="p-4 sm:p-5 rounded-2xl surface-elevated border border-theme text-xs sm:text-sm leading-relaxed ink-secondary whitespace-pre-line">
                {ayatData.tafsir ? (
                  ayatData.tafsir
                ) : (
                  <p className="ink-muted italic">
                    Tafsir lengkap Kemenag RI tersedia saat membuka ayat melalui halaman detail surat.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: Catatan Hati (Jurnal Pribadi Lokal) */}
            {activeTab === "note" && (
              <div className="space-y-3">
                <p className="text-xs ink-muted leading-relaxed">
                  Tulis renungan pribadi, doa, atau pengingat yang menyentuh hati Anda dari ayat ini.
                  Catatan tersimpan privat di perangkat Anda dan dapat dilihat kembali di menu{" "}
                  <strong>Koleksi</strong>.
                </p>
                <textarea
                  rows={5}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Contoh: Pengingat agar tidak cemas berlebihan atas urusan rezeki minggu ini..."
                  className="w-full rounded-2xl p-3.5 text-sm surface-elevated border border-theme ink-primary placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-700/25 focus:border-emerald-700 resize-y"
                />
                <div className="flex items-center justify-between gap-2">
                  {noteText.trim() ? (
                    <button
                      type="button"
                      onClick={handleClearNote}
                      className="inline-flex items-center gap-1.5 text-xs ink-muted hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus catatan</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#245640] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    {noteSavedFeedback ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Catatan Tersimpan</span>
                      </>
                    ) : (
                      <>
                        <PenLine className="w-3.5 h-3.5" />
                        <span>Simpan Catatan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-theme surface-elevated flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={copyReflection}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-theme surface-card ink-primary hover:border-[var(--border-strong)] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 ink-muted" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#1B4332] text-white hover:bg-[#245640] text-xs font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
