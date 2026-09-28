"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { BookOpen, Headphones, Brain, Sparkles, Bookmark, Search, X } from "lucide-react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import SuratCard from "./SuratCard";
import AudioPlayerBar from "./AudioPlayerBar";
import ReflectionModal from "./ReflectionModal";

// Ayat harian yang menyejukkan hati untuk refleksi
const DAILY_VERSE = {
  suratNomor: 94,
  suratNamaLatin: "Al-Insyirah",
  nomorAyat: 6,
  teksArab: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
  teksLatin: "Inna ma'al-'usri yusrā(n).",
  teksIndonesia: "Sesungguhnya beserta kesulitan itu ada kemudahan.",
  tafsir: "Ayat ini mengulang penegasan bahwa setiap kali kesulitan mendera seorang hamba, Allah telah menyertakan kemudahan di dalamnya. Ini adalah jaminan ketenangan bagi siapa pun yang sedang berjuang dalam kehidupan.",
};

export default function HomeClientView({ initialSuratList = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all"); // 'all' | 'juz_amma' | 'makkiyyah' | 'madaniyyah'
  const [activeTab, setActiveTab] = useState("read"); // 'read' | 'listen' | 'memorize' | 'reflect'
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [lastRead, setLastRead] = useState(null);

  // Audio & Reflection state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentPlayingSuratNomor, setCurrentPlayingSuratNomor] = useState(null);
  const [reciterKey, setReciterKey] = useState("05");
  const [repeatCount, setRepeatCount] = useState(1);
  const [reflectionAyat, setReflectionAyat] = useState(null);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);

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

  // Filter surah list based on search and category
  const filteredSurat = useMemo(() => {
    return initialSuratList.filter((s) => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        s.namaLatin.toLowerCase().includes(query) ||
        s.arti.toLowerCase().includes(query) ||
        s.nomor.toString() === query ||
        s.nama.includes(query);

      if (!matchSearch) return false;

      // Category match
      if (category === "juz_amma") return s.nomor >= 78 && s.nomor <= 114;
      if (category === "makkiyyah") return s.tempatTurun.toLowerCase() === "mekah";
      if (category === "madaniyyah") return s.tempatTurun.toLowerCase() === "madinah";

      return true;
    });
  }, [initialSuratList, searchQuery, category]);

  const handleOpenDailyReflection = () => {
    setReflectionAyat(DAILY_VERSE);
    setIsReflectionOpen(true);
  };

  const handleQuickPlay = useCallback(
    (suratItem) => {
      const audioUrl =
        suratItem.audioFull?.[reciterKey] || Object.values(suratItem.audioFull || {})[0];
      setCurrentPlayingSuratNomor(suratItem.nomor);
      setCurrentTrack({
        title: `QS. ${suratItem.namaLatin} (Full Surat)`,
        audioUrl: audioUrl,
        ayatNomor: null,
        totalAyat: suratItem.jumlahAyat,
        suratNamaLatin: suratItem.namaLatin,
      });
    },
    [reciterKey]
  );

  const handleNextSuratHome = useCallback(() => {
    if (!currentPlayingSuratNomor || !initialSuratList.length) return;
    const currentIdx = initialSuratList.findIndex((s) => s.nomor === currentPlayingSuratNomor);
    if (currentIdx !== -1 && currentIdx + 1 < initialSuratList.length) {
      handleQuickPlay(initialSuratList[currentIdx + 1]);
    }
  }, [currentPlayingSuratNomor, initialSuratList, handleQuickPlay]);

  const handlePrevSuratHome = useCallback(() => {
    if (!currentPlayingSuratNomor || !initialSuratList.length) return;
    const currentIdx = initialSuratList.findIndex((s) => s.nomor === currentPlayingSuratNomor);
    if (currentIdx > 0) {
      handleQuickPlay(initialSuratList[currentIdx - 1]);
    }
  }, [currentPlayingSuratNomor, initialSuratList, handleQuickPlay]);

  return (
    <div
      className={`min-h-screen transition-all duration-300 pb-28 ${
        isMobileFrame
          ? "max-w-md mx-auto my-4 sm:my-8 bg-white border-4 border-stone-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
          : "max-w-5xl mx-auto px-4 sm:px-6"
      }`}
    >
      {/* Mobile Frame Speaker & Camera Notch */}
      {isMobileFrame && (
        <div className="w-full bg-stone-800 py-1.5 flex justify-center items-center">
          <div className="w-20 h-3.5 bg-stone-900 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-stone-700 mr-2"></div>
            <div className="w-8 h-1 rounded-full bg-stone-700"></div>
          </div>
        </div>
      )}

      {/* Header / Navbar */}
      <Navbar
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="mt-4 sm:mt-6 space-y-6">
        {/* HERO SECTION: The 4 Pillars Concept Card (Sesuai Gambar Referensi tanpa AI slop) */}
        <div className="bg-[#1B4332] text-stone-100 rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-700/30 relative overflow-hidden">
          <div className="relative z-10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
              <div>
                <span className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">
                  Al-Qur&apos;an Al-Karim
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5 text-white">
                  Platform Qur&apos;an Digital
                </h1>
                <p className="text-xs text-stone-300 mt-1 max-w-md">
                  Pengalaman membaca, mendengarkan, menghafal, dan tadabbur Al-Qur&apos;an dalam satu antarmuka minimalis.
                </p>
              </div>

              {lastRead && (
                <Link
                  href={`/surat/${lastRead.nomor}#ayat-${lastRead.ayat || 1}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all self-start sm:self-auto"
                >
                  <Bookmark className="w-4 h-4 text-emerald-300" />
                  <div>
                    <span className="text-[10px] text-emerald-200 block uppercase">Lanjutkan Bacaan:</span>
                    <span>
                      {lastRead.namaLatin}: Ayat {lastRead.ayat || 1}
                    </span>
                  </div>
                </Link>
              )}
            </div>

            {/* 4 Pillars Interactive Box (Sesuai Gambar Sketsa Pengguna) */}
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-200 mb-2.5">
                4 Pilar Utama Aplikasi
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Read */}
                <div
                  onClick={() => setActiveTab("read")}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === "read"
                      ? "bg-white text-emerald-950 border-white shadow-sm font-semibold"
                      : "bg-white/10 border-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className={`w-4 h-4 ${activeTab === "read" ? "text-emerald-800" : "text-emerald-300"}`} />
                    <h3 className="font-bold text-sm">Read</h3>
                  </div>
                  <p className={`text-[11px] leading-snug ${activeTab === "read" ? "text-stone-600" : "text-stone-300"}`}>
                    Quran + Indonesian translation & font customizer.
                  </p>
                </div>

                {/* 2. Listen */}
                <div
                  onClick={() => setActiveTab("listen")}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === "listen"
                      ? "bg-white text-emerald-950 border-white shadow-sm font-semibold"
                      : "bg-white/10 border-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Headphones className={`w-4 h-4 ${activeTab === "listen" ? "text-emerald-800" : "text-emerald-300"}`} />
                    <h3 className="font-bold text-sm">Listen</h3>
                  </div>
                  <p className={`text-[11px] leading-snug ${activeTab === "listen" ? "text-stone-600" : "text-stone-300"}`}>
                    Murattal player 5 qari & floating player bar.
                  </p>
                </div>

                {/* 3. Memorize */}
                <div
                  onClick={() => setActiveTab("memorize")}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === "memorize"
                      ? "bg-white text-emerald-950 border-white shadow-sm font-semibold"
                      : "bg-white/10 border-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className={`w-4 h-4 ${activeTab === "memorize" ? "text-emerald-800" : "text-emerald-300"}`} />
                    <h3 className="font-bold text-sm">Memorize</h3>
                  </div>
                  <p className={`text-[11px] leading-snug ${activeTab === "memorize" ? "text-stone-600" : "text-stone-300"}`}>
                    Hafalan mode: tap-to-reveal (blur), repeat & tracker.
                  </p>
                </div>

                {/* 4. Reflect */}
                <div
                  onClick={() => {
                    setActiveTab("reflect");
                    handleOpenDailyReflection();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === "reflect"
                      ? "bg-white text-emerald-950 border-white shadow-sm font-semibold"
                      : "bg-white/10 border-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className={`w-4 h-4 ${activeTab === "reflect" ? "text-emerald-800" : "text-emerald-300"}`} />
                    <h3 className="font-bold text-sm">Reflect</h3>
                  </div>
                  <p className={`text-[11px] leading-snug ${activeTab === "reflect" ? "text-stone-600" : "text-stone-300"}`}>
                    AI-generated reflection & hikmah ayat kehidupan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Verse / Tadabbur Spotlight Card */}
        <div className="bg-[#F0F7F4] border border-[#A3CFBB]/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900 bg-white border border-[#A3CFBB]/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-800" />
                <span>Ayat Hari Ini</span>
              </span>
              <span className="text-xs text-stone-500">QS. {DAILY_VERSE.suratNamaLatin}: {DAILY_VERSE.nomorAyat}</span>
            </div>
            <p className="font-arabic text-xl sm:text-2xl text-emerald-950 font-bold">
              {DAILY_VERSE.teksArab}
            </p>
            <p className="text-xs sm:text-sm text-stone-700 italic">
              &quot;{DAILY_VERSE.teksIndonesia}&quot;
            </p>
          </div>

          <button
            onClick={handleOpenDailyReflection}
            className="whitespace-nowrap px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tadabbur Sekarang</span>
          </button>
        </div>

        {/* Search & Category Filter Section */}
        <div className="space-y-3">
          {/* Mobile Search input */}
          <div className="relative md:hidden">
            <input
              type="text"
              placeholder="Cari surat (contoh: Yasin, Al-Mulk, 36)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-9 pr-8 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 shadow-xs"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5">
              {[
                { id: "all", label: "Semua Surat (114)" },
                { id: "juz_amma", label: "Juz 'Amma (78-114)" },
                { id: "makkiyyah", label: "Makkiyyah" },
                { id: "madaniyyah", label: "Madaniyyah" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setCategory(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    category === pill.id
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-stone-500 hidden sm:block whitespace-nowrap">
              {filteredSurat.length} Surat
            </span>
          </div>
        </div>

        {/* Surah Cards Grid */}
        {filteredSurat.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurat.map((surat) => (
              <SuratCard
                key={surat.nomor}
                surat={surat}
                onQuickAction={(action) => {
                  if (action === "listen") handleQuickPlay(surat);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
            <Search className="w-6 h-6 mx-auto mb-2 text-stone-400" />
            <h4 className="font-bold text-stone-800 text-sm">Surat tidak ditemukan</h4>
            <p className="text-xs text-stone-500 mt-1">
              Tidak ada surat yang sesuai dengan kata kunci &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 px-3 py-1.5 rounded-lg bg-stone-100 text-xs text-stone-700 font-semibold hover:bg-stone-200 transition-colors"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </main>

      {/* Floating Sticky Audio Player Bar */}
      <AudioPlayerBar
        currentTrack={currentTrack}
        onClose={() => {
          setCurrentTrack(null);
          setCurrentPlayingSuratNomor(null);
        }}
        reciterKey={reciterKey}
        setReciterKey={setReciterKey}
        repeatCount={repeatCount}
        setRepeatCount={setRepeatCount}
        onNext={handleNextSuratHome}
        onPrev={handlePrevSuratHome}
      />

      {/* Tadabbur & AI Reflection Modal */}
      <ReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        ayatData={reflectionAyat}
      />

      {/* Bottom Nav on Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === "reflect") {
            handleOpenDailyReflection();
          } else {
            // Scroll smoothly to list or filter
            window.scrollTo({ top: 380, behavior: "smooth" });
          }
        }}
      />
    </div>
  );
}
