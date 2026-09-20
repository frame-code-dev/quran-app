"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  ScrollText,
  Bookmark,
  Lightbulb,
  Compass,
  HeartHandshake,
  Copy,
  Check,
  X,
} from "lucide-react";

export default function ReflectionModal({
  isOpen,
  onClose,
  ayatData, // { suratNomor, suratNamaLatin, nomorAyat, teksArab, teksLatin, teksIndonesia, tafsir }
}) {
  const [activeTab, setActiveTab] = useState("ai"); // 'ai' | 'tafsir'
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState(null);
  const [source, setSource] = useState(null);
  const [copied, setCopied] = useState(false);

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
        setSource(data.source);
      }
    } catch (e) {
      console.error("Gagal mengambil refleksi:", e);
    } finally {
      setLoading(false);
    }
  }, [ayatData]);

  useEffect(() => {
    if (isOpen && ayatData) {
      fetchReflection();
    } else {
      setReflection(null);
      setCopied(false);
    }
  }, [isOpen, ayatData, fetchReflection]);

  const copyReflection = () => {
    if (!ayatData) return;
    const text = `Tadabbur QS. ${ayatData.suratNamaLatin}: ${ayatData.nomorAyat}\n\n"${ayatData.teksIndonesia}"\n\nInti Pesan: ${
      reflection?.konteks || ""
    }\n\nPelajaran Hidup:\n${(reflection?.hikmah || []).map((h) => `• ${h}`).join("\n")}\n\nRelevansi: ${
      reflection?.relevansi || ""
    }\n\nAksi Nyata: ${reflection?.aksiNyata || ""}\n\n(Dikutip dari Quran App)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen || !ayatData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-800" />
            <div>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                Refleksi & Tadabbur Ayat
              </h3>
              <p className="text-xs text-stone-500">
                QS. {ayatData.suratNamaLatin} : Ayat {ayatData.nomorAyat}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Ayat display card */}
          <div className="p-4 rounded-2xl bg-[#F0F7F4] border border-[#A3CFBB]/40">
            <p className="font-arabic text-xl sm:text-2xl text-emerald-950 font-bold mb-2">
              {ayatData.teksArab}
            </p>
            {ayatData.teksLatin && (
              <p className="text-xs text-emerald-900/80 italic mb-1.5">{ayatData.teksLatin}</p>
            )}
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              &quot;{ayatData.teksIndonesia}&quot;
            </p>
          </div>

          {/* Tab selector (AI Reflection vs Tafsir Kemenag) */}
          <div className="flex border-b border-stone-200 gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("ai")}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === "ai"
                  ? "border-emerald-800 text-emerald-900 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>AI Tadabbur</span>
              {source === "gemini_ai" && (
                <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 text-stone-700 border border-stone-200 rounded font-normal">
                  Gemini
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("tafsir")}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === "tafsir"
                  ? "border-emerald-800 text-emerald-900 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <ScrollText className="w-3.5 h-3.5 text-stone-600" />
              <span>Tafsir Kemenag</span>
            </button>
          </div>

          {/* AI Tadabbur Tab */}
          {activeTab === "ai" && (
            <div className="space-y-3.5">
              {loading ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-stone-500">
                    Menganalisa hikmah & menenun tadabbur ayat...
                  </p>
                </div>
              ) : reflection ? (
                <div className="space-y-3 animate-in fade-in duration-300 text-xs sm:text-sm">
                  {/* 1. Konteks / Pesan Pokok */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                    <h5 className="font-bold text-stone-900 flex items-center gap-1.5 mb-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-stone-600" />
                      <span>Inti Pesan Ayat</span>
                    </h5>
                    <p className="text-stone-600 leading-relaxed">{reflection.konteks}</p>
                  </div>

                  {/* 2. Hikmah Kehidupan */}
                  {reflection.hikmah && (
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                      <h5 className="font-bold text-stone-900 flex items-center gap-1.5 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-stone-600" />
                        <span>Pelajaran Hidup (Hikmah)</span>
                      </h5>
                      <ul className="space-y-1.5 text-stone-600">
                        {reflection.hikmah.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-800 mt-0.5">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3. Relevansi Kehidupan Modern */}
                  {reflection.relevansi && (
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                      <h5 className="font-bold text-stone-900 flex items-center gap-1.5 mb-1.5">
                        <Compass className="w-3.5 h-3.5 text-stone-600" />
                        <span>Relevansi Masa Kini</span>
                      </h5>
                      <p className="text-stone-600 leading-relaxed">{reflection.relevansi}</p>
                    </div>
                  )}

                  {/* 4. Aksi Nyata */}
                  {reflection.aksiNyata && (
                    <div className="p-3.5 rounded-xl bg-[#F0F7F4] border border-[#A3CFBB]/40">
                      <h5 className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Aksi Nyata Hari Ini</span>
                      </h5>
                      <p className="text-emerald-900 leading-relaxed">{reflection.aksiNyata}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-stone-500 mb-3">Belum ada refleksi untuk ayat ini.</p>
                  <button
                    onClick={fetchReflection}
                    className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Mulai Tadabbur Sekarang
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tafsir Kemenag Tab */}
          {activeTab === "tafsir" && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm leading-relaxed text-stone-700 max-h-72 overflow-y-auto whitespace-pre-line">
              {ayatData.tafsir ? (
                ayatData.tafsir
              ) : (
                <p className="text-stone-500 italic">Memuat tafsir Kemenag untuk ayat ini...</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-stone-100 bg-[#FAF9F5] flex items-center justify-between">
          <button
            onClick={copyReflection}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-white text-stone-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-600" />
                <span>Salin Refleksi</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 text-white hover:bg-stone-700 rounded-lg text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
