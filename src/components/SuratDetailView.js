"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Headphones,
  Brain,
  Sparkles,
  Play,
  Pause,
  Bookmark,
  Volume2,
  Search,
  X,
  Check,
  Loader2,
  ArrowUpRight,
  Compass,
} from "lucide-react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import AudioPlayerBar, { RECITERS } from "./AudioPlayerBar";
import MemorizeMode from "./MemorizeMode";
import ReflectionModal from "./ReflectionModal";
import Footer from "./Footer";
import { useRouter, useSearchParams } from "next/navigation";
import ambientEngine from "@/utils/ambientSound";
import { executeLocalSmartSearch } from "@/utils/quranSearch";

export default function SuratDetailView({ surat, tafsirData, initialMode = "read" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(initialMode); // 'read' | 'listen' | 'memorize' | 'reflect'
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Settings for reading comfort
  const [arabicFontSize, setArabicFontSize] = useState("normal"); // 'small' | 'normal' | 'large'
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [autoNextSurat, setAutoNextSurat] = useState(true);
  const [transitioningToNext, setTransitioningToNext] = useState(null);

  // Audio Player state
  const initialReciter = searchParams?.get("reciter") || "05";
  const [reciterKey, setReciterKey] = useState(initialReciter); // Default: Misyari Rasyid
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [activeAyatIndex, setActiveAyatIndex] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const initialZen = searchParams?.get("zen") === "true";
  const [isZenOpen, setIsZenOpen] = useState(initialZen);
  const audioToggleRef = useRef(null);

  // Confirmation modal when returning to home while audio is active
  const [isBackConfirmOpen, setIsBackConfirmOpen] = useState(false);

  useEffect(() => {
    if (searchParams?.get("zen") === "true") {
      setIsZenOpen(true);
    }
  }, [searchParams]);

  const handleBackClick = (e) => {
    if (e) e.preventDefault();
    if (isPlayingAudio || currentTrack) {
      setIsBackConfirmOpen(true);
    } else {
      router.push("/");
    }
  };

  const handleContinuePlaybackHome = () => {
    try {
      sessionStorage.setItem(
        "quran_playback_transfer",
        JSON.stringify({
          currentTrack,
          reciterKey,
          repeatCount,
          playlist: surat.ayat,
          currentIndex: activeAyatIndex,
          isPlaying: isPlayingAudio,
        })
      );
    } catch (e) {}
    setIsBackConfirmOpen(false);
    router.push("/");
  };

  const handleStopAndGoHome = () => {
    if (audioToggleRef.current && isPlayingAudio) {
      audioToggleRef.current();
    }
    if (ambientEngine) {
      ambientEngine.stopAll();
    }
    try {
      sessionStorage.removeItem("quran_playback_transfer");
    } catch (e) {}
    setIsBackConfirmOpen(false);
    router.push("/");
  };

  const handlePlayStateChange = useCallback((playing) => {
    setIsPlayingAudio(playing);
  }, []);

  // Reflection Modal state
  const [selectedAyatForReflection, setSelectedAyatForReflection] = useState(null);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);

  // Bookmarking & Search States
  const [savedLastRead, setSavedLastRead] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [activeJumpAyat, setActiveJumpAyat] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("quran_last_read");
      if (saved) {
        setSavedLastRead(JSON.parse(saved));
      }
      const savedAutoNext = localStorage.getItem("quran_auto_next");
      if (savedAutoNext !== null) {
        setAutoNextSurat(savedAutoNext === "true");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Auto-scroll listener saat navigasi URL param ?ayat=X atau #ayat-X
  useEffect(() => {
    const targetAyatParam = searchParams?.get("ayat");
    let targetAyat = targetAyatParam ? parseInt(targetAyatParam, 10) : null;

    if (!targetAyat && typeof window !== "undefined" && window.location.hash) {
      const match = window.location.hash.match(/ayat-(\d+)/);
      if (match) targetAyat = parseInt(match[1], 10);
    }

    if (targetAyat && surat?.ayat?.some((a) => a.nomorAyat === targetAyat)) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`ayat-${targetAyat}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setActiveJumpAyat(targetAyat);
          setTimeout(() => setActiveJumpAyat(null), 3000);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [surat?.nomor, surat?.ayat, searchParams]);

  const handleToggleAutoNext = (val) => {
    setAutoNextSurat(val);
    try {
      localStorage.setItem("quran_auto_next", String(val));
    } catch (e) {
      // ignore
    }
  };

  // Auto-scroll to active reciting ayah
  useEffect(() => {
    if (autoScrollEnabled && currentTrack?.ayatNomor && isPlayingAudio) {
      const element = document.getElementById(`ayat-${currentTrack.ayatNomor}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTrack?.ayatNomor, isPlayingAudio, autoScrollEnabled]);

  const saveAsLastRead = (ayat) => {
    const payload = {
      nomor: surat.nomor,
      namaLatin: surat.namaLatin,
      ayat: ayat.nomorAyat,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem("quran_last_read", JSON.stringify(payload));
      setSavedLastRead(payload);
      showToast(`Ayat ${ayat.nomorAyat} ditandai sebagai bacaan terakhir`);
    } catch (e) {
      // ignore
    }
  };

  const jumpToTargetAyat = (ayatNum) => {
    const el = document.getElementById(`ayat-${ayatNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveJumpAyat(ayatNum);
      setTimeout(() => setActiveJumpAyat(null), 3000);
      showToast(`Fokus ke Ayat ${ayatNum}`);
    }
  };

  const handleSearchSelect = (item) => {
    if (!item) return;
    if (item.suratNomor === surat.nomor) {
      jumpToTargetAyat(item.nomorAyat);
      setSearchQuery("");
      setIsSearchFocused(false);
    } else {
      router.push(`/surat/${item.suratNomor}?ayat=${item.nomorAyat}#ayat-${item.nomorAyat}`);
    }
  };

  const handleTriggerAiSearch = async () => {
    if (!searchQuery.trim() || isLoadingAi) return;
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data?.results) {
        setAiSearchResults(data.results);
      }
    } catch (e) {
      console.error("Gagal melakukan pencarian AI:", e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const scrollToBookmarkedAyat = () => {
    if (savedLastRead?.nomor === surat.nomor) {
      jumpToTargetAyat(savedLastRead.ayat);
    } else if (savedLastRead) {
      router.push(`/surat/${savedLastRead.nomor}?ayat=${savedLastRead.ayat}#ayat-${savedLastRead.ayat}`);
    }
  };

  // Play verse by index in surat.ayat array
  const playAyatIndex = useCallback(
    (index, customRepeat = 1) => {
      if (!surat.ayat || index < 0 || index >= surat.ayat.length) return;
      const ayat = surat.ayat[index];
      setActiveAyatIndex(index);
      if (customRepeat !== undefined) {
        setRepeatCount(customRepeat);
      }

      const audioUrl = ayat.audio?.[reciterKey] || Object.values(ayat.audio || {})[0];
      setCurrentTrack({
        title: `QS. ${surat.namaLatin} : Ayat ${ayat.nomorAyat}`,
        audioUrl: audioUrl,
        ayatNomor: ayat.nomorAyat,
        ayatIndex: index,
        totalAyat: surat.jumlahAyat,
        teksArab: ayat.teksArab,
        teksIndonesia: ayat.teksIndonesia,
        teksLatin: ayat.teksLatin,
        suratNamaLatin: surat.namaLatin,
      });
      setIsPlayingAudio(true);
    },
    [surat, reciterKey]
  );

  const playAyat = (ayat, customRepeat = 1) => {
    const idx = surat.ayat.findIndex((a) => a.nomorAyat === ayat.nomorAyat);
    if (idx !== -1) {
      playAyatIndex(idx, customRepeat);
    }
  };

  // Toggle pause/play on current active verse, or start playing if different verse
  const handleVerseAudioClick = (ayat) => {
    const isPlayingThis =
      currentTrack?.ayatNomor === ayat.nomorAyat &&
      currentTrack?.title.includes(surat.namaLatin);
    if (isPlayingThis && audioToggleRef.current) {
      audioToggleRef.current();
    } else {
      playAyat(ayat, 1);
    }
  };

  // Start sequential recitation from beginning of surah
  const playSuratSequential = () => {
    if (surat.ayat && surat.ayat.length > 0) {
      playAyatIndex(0, 1);
    }
  };

  // Open Animated Zen Recitation Mode
  const openZenMode = () => {
    if (!currentTrack) {
      playSuratSequential();
    }
    setIsZenOpen(true);
  };

  // Next & Previous Surat Navigation
  const handleNextSurat = useCallback(() => {
    if (surat?.suratSelanjutnya?.nomor) {
      setTransitioningToNext(surat.suratSelanjutnya.namaLatin);
      const zenParam = isZenOpen ? "&zen=true" : "";
      router.push(
        `/surat/${surat.suratSelanjutnya.nomor}?autoplay=true&reciter=${reciterKey}&mode=${activeTab}${zenParam}`
      );
    }
  }, [surat?.suratSelanjutnya, reciterKey, activeTab, isZenOpen, router]);

  const handlePrevSurat = useCallback(() => {
    if (surat?.suratSebelumnya?.nomor) {
      const zenParam = isZenOpen ? "&zen=true" : "";
      router.push(
        `/surat/${surat.suratSebelumnya.nomor}?autoplay=true&reciter=${reciterKey}&mode=${activeTab}${zenParam}`
      );
    }
  }, [surat?.suratSebelumnya, reciterKey, activeTab, isZenOpen, router]);

  // Auto-play when navigated with ?autoplay=true
  useEffect(() => {
    const isAutoPlay = searchParams?.get("autoplay") === "true";
    if (isAutoPlay && surat?.ayat?.length > 0) {
      const timer = setTimeout(() => {
        playAyatIndex(0, 1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [surat?.nomor, surat?.ayat?.length, searchParams, playAyatIndex]);

  // Prefetch next surat for instantaneous transition
  useEffect(() => {
    if (surat?.suratSelanjutnya?.nomor) {
      router.prefetch(`/surat/${surat.suratSelanjutnya.nomor}`);
    }
  }, [surat?.suratSelanjutnya?.nomor, router]);

  // Open AI reflection modal for an ayat
  const openReflection = (ayat) => {
    const tafsirObj = tafsirData?.tafsir?.find((t) => t.ayat === ayat.nomorAyat);
    setSelectedAyatForReflection({
      suratNomor: surat.nomor,
      suratNamaLatin: surat.namaLatin,
      nomorAyat: ayat.nomorAyat,
      teksArab: ayat.teksArab,
      teksLatin: ayat.teksLatin,
      teksIndonesia: ayat.teksIndonesia,
      tafsir: tafsirObj?.teks || "",
    });
    setIsReflectionModalOpen(true);
  };

  const getFontSizeClass = () => {
    if (arabicFontSize === "small") return "text-xl sm:text-2xl leading-[2.2]";
    if (arabicFontSize === "large") return "text-3xl sm:text-4xl leading-[2.6]";
    return "text-2xl sm:text-3xl leading-[2.4]";
  };

  const isBismillahShown = surat.nomor !== 1 && surat.nomor !== 9;

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        currentTrack ? "pb-44 sm:pb-36" : "pb-28"
      } ${
        isMobileFrame
          ? "max-w-md mx-auto my-4 sm:my-8 bg-white border-4 border-stone-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
          : "max-w-5xl mx-auto px-3 sm:px-6"
      }`}
    >
      {/* Mobile Frame Speaker / Camera Notch if in Mobile Frame Mode */}
      {isMobileFrame && (
        <div className="w-full bg-stone-800 py-1.5 flex justify-center items-center">
          <div className="w-20 h-3.5 bg-stone-900 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-stone-700 mr-2"></div>
            <div className="w-8 h-1 rounded-full bg-stone-700"></div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar isMobileFrame={isMobileFrame} setIsMobileFrame={setIsMobileFrame} />

      <main className="mt-4 sm:mt-6 space-y-6">
        {/* Top Breadcrumb & Back */}
        <div className="flex items-center justify-between gap-2 px-0.5">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors border border-stone-200 cursor-pointer shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </button>

          <div className="flex items-center gap-1 text-xs truncate">
            {surat.suratSebelumnya && (
              <Link
                href={`/surat/${surat.suratSebelumnya.nomor}`}
                className="inline-flex items-center gap-1 px-2 py-1 text-stone-600 hover:text-emerald-900 hover:bg-stone-100 rounded-lg transition-colors truncate max-w-[110px] sm:max-w-none"
                title={`Sebelumnya: ${surat.suratSebelumnya.namaLatin}`}
              >
                <ChevronLeft className="w-3 h-3 shrink-0" />
                <span className="truncate">{surat.suratSebelumnya.namaLatin}</span>
              </Link>
            )}
            {surat.suratSelanjutnya && (
              <Link
                href={`/surat/${surat.suratSelanjutnya.nomor}`}
                className="inline-flex items-center gap-1 px-2 py-1 text-stone-600 hover:text-emerald-900 hover:bg-stone-100 rounded-lg transition-colors truncate max-w-[110px] sm:max-w-none"
                title={`Selanjutnya: ${surat.suratSelanjutnya.namaLatin}`}
              >
                <span className="truncate">{surat.suratSelanjutnya.namaLatin}</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </Link>
            )}
          </div>
        </div>

        {/* Hero Surah Card - Authentic Heritage Tone without AI slop */}
        <div className="bg-[#1B4332] text-stone-100 rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-700/30 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <span className="inline-block text-xs uppercase tracking-widest text-emerald-200 font-semibold px-3 py-1 rounded-full bg-white/10">
              Surat ke-{surat.nomor} • {surat.tempatTurun}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {surat.namaLatin}
            </h1>
            <p className="font-arabic text-4xl sm:text-5xl text-emerald-200 font-bold my-2">
              {surat.nama}
            </p>
            <p className="text-xs sm:text-sm text-stone-300 italic">
              &quot;{surat.arti}&quot; • {surat.jumlahAyat} Ayat
            </p>

            {/* Quick action bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={playSuratSequential}
                className="inline-flex items-center gap-1.5 bg-white text-emerald-950 hover:bg-stone-100 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Putar Surat (Sinkron Ayat)</span>
              </button>
              <button
                onClick={openZenMode}
                className="inline-flex items-center gap-1.5 bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-emerald-400/30 shadow-xs"
                title="Buka Mode Animasi Sinematik & Suara Alam"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>Mode Animasi & Alam</span>
              </button>
              <button
                onClick={() => setActiveTab("memorize")}
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all border border-white/10"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Mode Hafalan</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pillars Tab Header Switcher */}
        <div className="bg-white p-1.5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: "read", label: "Read", icon: BookOpen, sub: "Baca & Terjemah" },
              { id: "listen", label: "Listen", icon: Headphones, sub: "Murattal Player" },
              { id: "memorize", label: "Memorize", icon: Brain, sub: "Mode Hafalan" },
              { id: "reflect", label: "Reflect", icon: Sparkles, sub: "AI Tadabbur" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2.5 px-2 rounded-xl text-center transition-all duration-200 flex flex-col items-center justify-center ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-xs font-bold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs mt-1 tracking-tight">{tab.label}</span>
                  <span
                    className={`text-[10px] hidden sm:block font-normal ${
                      isActive ? "text-emerald-200" : "text-stone-400"
                    }`}
                  >
                    {tab.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: READ (Quran + Translation) */}
        {activeTab === "read" && (
          <div className="space-y-4">
            {/* Smart Search & Quick Jump Bar */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-stone-200 shadow-xs flex items-center gap-2">
                {/* Search Input Box */}
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Cari ayat (contoh: nisa 136, 100 dinar, hutang, jodoh, 136)..."
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setAiSearchResults([]);
                      }}
                      className="absolute right-2.5 text-stone-400 hover:text-stone-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Bookmark Jump Shortcut Button */}
                {savedLastRead && (
                  <button
                    onClick={scrollToBookmarkedAyat}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      savedLastRead.nomor === surat.nomor
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300/80 shadow-2xs"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                    }`}
                    title={
                      savedLastRead.nomor === surat.nomor
                        ? `Lompat ke Ayat ${savedLastRead.ayat} (Tanda Baca Terakhir)`
                        : `Buka Bacaan Terakhir: QS. ${savedLastRead.namaLatin} Ayat ${savedLastRead.ayat}`
                    }
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        savedLastRead.nomor === surat.nomor
                          ? "fill-amber-500 text-amber-600"
                          : "text-stone-500"
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {savedLastRead.nomor === surat.nomor
                        ? `Ayat ${savedLastRead.ayat}`
                        : `${savedLastRead.namaLatin}:${savedLastRead.ayat}`}
                    </span>
                    <span className="sm:hidden font-bold">
                      {savedLastRead.nomor === surat.nomor ? savedLastRead.ayat : "Terakhir"}
                    </span>
                  </button>
                )}
              </div>

              {/* Dropdown Hasil Pencarian Cerdas & Tematik */}
              {isSearchFocused && searchQuery.trim().length > 0 && (() => {
                const localResults = executeLocalSmartSearch(searchQuery, surat);
                const hasPattern = !!localResults.patternResult;
                const hasThematic = localResults.thematicResults.length > 0;
                const hasAi = aiSearchResults.length > 0;
                const hasSurah = localResults.surahResults.length > 0;

                return (
                  <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl border border-stone-200 shadow-2xl p-2.5 space-y-2 animate-fade-in-up max-h-[28rem] overflow-y-auto">
                    <div className="flex items-center justify-between px-2 pb-1.5 border-b border-stone-100">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                        Hasil Pencarian Cerdas
                      </span>
                      <button
                        onClick={() => setIsSearchFocused(false)}
                        className="text-stone-400 hover:text-stone-600 text-xs font-semibold cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>

                    {/* 1. Hasil Pola Surat & Ayat (Contoh: "nisa 136", "4:136", "136") */}
                    {hasPattern && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {localResults.patternResult.nomorAyat}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                              {localResults.patternResult.label}
                            </h4>
                            <p className="text-[11px] text-emerald-800">
                              {localResults.patternResult.isCurrentSurat
                                ? "Lompat langsung ke ayat ini di halaman ini"
                                : `Buka Surat ${localResults.patternResult.suratNamaLatin}`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSearchSelect(localResults.patternResult)}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Lompat</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* 2. Hasil Tematik (Contoh: "100 dinar", "hutang", "jodoh", "ayat kursi") */}
                    {hasThematic && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-amber-900">
                          <Compass className="w-3.5 h-3.5 text-amber-600" />
                          <span>Topik Tematik Terkurasi</span>
                        </div>
                        {localResults.thematicResults.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleSearchSelect(t)}
                            className="p-2.5 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60 cursor-pointer transition-colors flex items-start justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-stone-900">{t.title}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-200/70 text-amber-900 font-semibold">
                                  QS. {t.suratNamaLatin} : {t.ayatRange}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
                                {t.description}
                              </p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-amber-700 shrink-0 mt-1" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. Hasil Surat Saja (jika mengetik nama surat) */}
                    {hasSurah && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-500 px-2">Pilihan Surat:</span>
                        {localResults.surahResults.map((s) => (
                          <div
                            key={s.nomor}
                            onClick={() => router.push(`/surat/${s.nomor}`)}
                            className="p-2 rounded-xl hover:bg-stone-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-stone-200"
                          >
                            <span className="text-xs font-semibold text-stone-800">
                              {s.nomor}. {s.namaLatin} ({s.jumlahAyat} Ayat)
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 4. Rekomendasi Hasil AI (Jika ada) */}
                    {hasAi && (
                      <div className="space-y-1.5 pt-1 border-t border-stone-100">
                        <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-emerald-900">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Hasil Rekomendasi AI</span>
                        </div>
                        {aiSearchResults.map((aiItem, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSearchSelect(aiItem)}
                            className="p-2.5 rounded-xl bg-[#F0F7F4] hover:bg-[#E2F0EA] border border-[#A3CFBB]/60 cursor-pointer transition-colors space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-emerald-950">
                                QS. {aiItem.suratNamaLatin} : Ayat {aiItem.nomorAyat}
                              </span>
                              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">
                                {aiItem.judulTopik || "AI Match"}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 line-clamp-2">
                              {aiItem.alasanRelevansi}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 5. Tombol Panggil AI jika kueri bebas */}
                    <div className="pt-1.5 border-t border-stone-100">
                      <button
                        onClick={handleTriggerAiSearch}
                        disabled={isLoadingAi}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isLoadingAi ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mencari makna dengan AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Tanya AI Ayat untuk &quot;{searchQuery}&quot;</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Reading Options Bar */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {/* Font size adjustment */}
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <span className="text-stone-500 font-medium">Ukuran Teks Arab:</span>
                <div className="flex items-center rounded-lg border border-stone-200 p-0.5 bg-stone-50">
                  <button
                    onClick={() => setArabicFontSize("small")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      arabicFontSize === "small" ? "bg-white text-emerald-900 shadow-xs" : "text-stone-600"
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setArabicFontSize("normal")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      arabicFontSize === "normal" ? "bg-white text-emerald-900 shadow-xs" : "text-stone-600"
                    }`}
                  >
                    A+
                  </button>
                  <button
                    onClick={() => setArabicFontSize("large")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      arabicFontSize === "large" ? "bg-white text-emerald-900 shadow-xs" : "text-stone-600"
                    }`}
                  >
                    A++
                  </button>
                </div>
              </div>

              {/* Toggles grid in mobile */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={autoScrollEnabled}
                    onChange={(e) => setAutoScrollEnabled(e.target.checked)}
                    className="accent-emerald-700 rounded"
                  />
                  <span className="truncate">Auto-scroll</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={autoNextSurat}
                    onChange={(e) => handleToggleAutoNext(e.target.checked)}
                    className="accent-emerald-700 rounded"
                  />
                  <span className="truncate">Auto-Next Surat</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={showLatin}
                    onChange={(e) => setShowLatin(e.target.checked)}
                    className="accent-emerald-700 rounded"
                  />
                  <span>Latin</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                    className="accent-emerald-700 rounded"
                  />
                  <span>Arti</span>
                </label>
              </div>
            </div>

            {/* Bismillah Header */}
            {isBismillahShown && (
              <div className="text-center py-6 bg-[#F0F7F4] rounded-3xl border border-[#A3CFBB]/40">
                <p className="font-arabic text-3xl sm:text-4xl text-emerald-950 font-bold">
                  بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>
                <p className="text-xs text-emerald-900/80 mt-2 italic">
                  Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
                </p>
              </div>
            )}

            {/* List of Verses */}
            <div className="space-y-4">
              {surat.ayat.map((ayat) => {
                const isPlayingThis =
                  currentTrack?.ayatNomor === ayat.nomorAyat &&
                  currentTrack?.title.includes(surat.namaLatin);
                const isBookmarked =
                  savedLastRead?.nomor === surat.nomor && savedLastRead?.ayat === ayat.nomorAyat;

                return (
                  <div
                    key={ayat.nomorAyat}
                    id={`ayat-${ayat.nomorAyat}`}
                    className={`rounded-2xl border transition-all duration-300 p-3.5 sm:p-5 ${
                      activeJumpAyat === ayat.nomorAyat ? "ayat-jump-highlight" : ""
                    } ${
                      isPlayingThis
                        ? "ayat-active-reciting"
                        : isBookmarked
                        ? "bg-[#F9F6F0] border-[#B38F5C]/40"
                        : "bg-white border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {/* Verse Toolbar */}
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-100 gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 truncate min-w-0">
                        <span
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            isPlayingThis
                              ? "bg-emerald-800 text-white border-emerald-800"
                              : "bg-stone-100 text-stone-700 border-stone-200/60"
                          }`}
                        >
                          {ayat.nomorAyat}
                        </span>

                        {isPlayingThis && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-900 text-[11px] font-semibold">
                            <div className="flex items-center gap-0.5 h-3">
                              <span className="w-0.5 h-2.5 bg-emerald-800 rounded audio-bar-1 inline-block"></span>
                              <span className="w-0.5 h-3.5 bg-emerald-800 rounded audio-bar-2 inline-block"></span>
                              <span className="w-0.5 h-2 bg-emerald-800 rounded audio-bar-3 inline-block"></span>
                            </div>
                            <span>Sedang Dilantunkan</span>
                          </div>
                        )}

                        {isBookmarked && !isPlayingThis && (
                          <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Bookmark className="w-3 h-3 text-stone-600" />
                            <span>Terakhir Dibaca</span>
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleVerseAudioClick(ayat)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1 border ${
                            isPlayingThis
                              ? isPlayingAudio
                                ? "bg-emerald-800 text-white border-emerald-800 font-semibold"
                                : "bg-emerald-700/80 text-white border-emerald-700 font-semibold"
                              : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                          }`}
                          title={
                            isPlayingThis
                              ? isPlayingAudio
                                ? "Jeda Audio"
                                : "Lanjutkan Audio"
                              : "Dengar Ayat Ini"
                          }
                        >
                          {isPlayingThis ? (
                            isPlayingAudio ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>Jeda</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                <span>Lanjut</span>
                              </>
                            )
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Audio</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => saveAsLastRead(ayat)}
                          className={`p-2 rounded-xl transition-all border cursor-pointer ${
                            isBookmarked
                              ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs"
                              : "bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-800 border-stone-200"
                          }`}
                          title={isBookmarked ? "Tanda Bacaan Terakhir Aktif" : "Tandai Sebagai Bacaan Terakhir"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500 text-amber-700" : ""}`} />
                        </button>

                        <button
                          onClick={() => openReflection(ayat)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#F0F7F4] text-emerald-900 hover:bg-[#E2F0EA] font-semibold transition-colors text-xs flex items-center gap-1 border border-[#A3CFBB]/40"
                          title="Buka AI Tadabbur & Tafsir"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                          <span className="hidden sm:inline">Tadabbur</span>
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text (BOLD when reciting) */}
                    <div className="mb-4">
                      <p
                        className={`font-arabic text-right transition-all duration-200 ${getFontSizeClass()} ${
                          isPlayingThis
                            ? "font-bold text-[#0D281E] scale-[1.01]"
                            : "font-semibold text-stone-900"
                        }`}
                      >
                        {ayat.teksArab}
                      </p>
                    </div>

                    {/* Latin & Translation */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-100">
                      {showLatin && ayat.teksLatin && (
                        <p className="text-xs sm:text-sm text-emerald-950/80 font-medium italic">
                          {ayat.teksLatin}
                        </p>
                      )}
                      {showTranslation && (
                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                          {ayat.teksIndonesia}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LISTEN (Murattal Player) */}
        {activeTab === "listen" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">Pilihan Qari</h3>
                  <p className="text-xs text-stone-500">
                    Dengarkan lantunan ayat suci Al-Qur&apos;an dalam kualitas jernih
                  </p>
                </div>
                <select
                  value={reciterKey}
                  onChange={(e) => setReciterKey(e.target.value)}
                  className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 font-medium focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                >
                  {Object.entries(RECITERS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Surah Audio Card */}
              <div className="p-4 rounded-2xl bg-[#F0F7F4] border border-[#A3CFBB]/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                      Putar Lengkap 1 Surat (Sinkron Ayat)
                    </h4>
                    <p className="text-xs text-stone-500">
                      {RECITERS[reciterKey]?.name} • QS. {surat.namaLatin}
                    </p>
                  </div>
                </div>
                <button
                  onClick={playSuratSequential}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mulai Putar</span>
                </button>
              </div>

              {/* Per-Ayat Audio Playlist */}
              <div>
                <h4 className="font-bold text-stone-800 text-sm mb-3">Playlist Ayat:</h4>
                <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto pr-1">
                  {surat.ayat.map((ayat) => {
                    const isPlayingThis =
                      currentTrack?.ayatNomor === ayat.nomorAyat &&
                      currentTrack?.title.includes(surat.namaLatin);

                    return (
                      <div
                        key={ayat.nomorAyat}
                        className={`py-3 px-2.5 flex items-center justify-between gap-3 transition-colors rounded-xl ${
                          isPlayingThis ? "bg-[#F0F7F4] border border-[#A3CFBB]/60" : "hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                              isPlayingThis
                                ? "bg-emerald-800 text-white border-emerald-800"
                                : "bg-stone-100 text-stone-700 border-stone-200/60"
                            }`}
                          >
                            {ayat.nomorAyat}
                          </span>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-stone-900 truncate">
                              Ayat ke-{ayat.nomorAyat}
                            </p>
                            <p className="text-[11px] text-stone-500 truncate">{ayat.teksIndonesia}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerseAudioClick(ayat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                              isPlayingThis
                                ? isPlayingAudio
                                  ? "bg-emerald-800 text-white border-emerald-800"
                                  : "bg-emerald-700/80 text-white border-emerald-700"
                                : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200/60"
                            }`}
                          >
                            {isPlayingThis ? (
                              isPlayingAudio ? (
                                <>
                                  <Pause className="w-3 h-3" />
                                  <span>Jeda</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3" />
                                  <span>Lanjut</span>
                                </>
                              )
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                <span>Putar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEMORIZE (Hafalan Mode) */}
        {activeTab === "memorize" && (
          <MemorizeMode
            surat={surat}
            onPlayAyat={playAyat}
            onOpenReflection={openReflection}
          />
        )}

        {/* TAB 4: REFLECT (AI Tadabbur) */}
        {activeTab === "reflect" && (
          <div className="space-y-4">
            <div className="bg-[#1B4332] text-stone-100 rounded-3xl p-6 shadow-sm border border-stone-700/30">
              <span className="text-emerald-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Tadabbur & Refleksi
              </span>
              <h3 className="text-2xl font-bold mt-1 text-white">Renungi Hikmah Setiap Ayat</h3>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl leading-relaxed">
                Pilih ayat dari surat {surat.namaLatin} untuk membuka tadabbur mendalam berbasis Tafsir
                Kemenag dan hikmah kehidupan nyata.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {surat.ayat.map((ayat) => (
                <div
                  key={ayat.nomorAyat}
                  className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-emerald-700/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center border border-stone-200/60">
                        {ayat.nomorAyat}
                      </span>
                      <span className="font-arabic text-xl font-bold text-emerald-950">
                        {ayat.teksArab.substring(0, 30)}...
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      &quot;{ayat.teksIndonesia}&quot;
                    </p>
                  </div>

                  <button
                    onClick={() => openReflection(ayat)}
                    className="w-full py-2 rounded-xl bg-[#F0F7F4] hover:bg-[#E2F0EA] text-emerald-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#A3CFBB]/40"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Buka Refleksi AI & Tafsir</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Pengenalan Dev, API Attribution & Buy Me a Coffee */}
        <Footer />
      </main>

      {/* Floating Sticky Audio Player Bar */}
      <AudioPlayerBar
        currentTrack={currentTrack}
        playlist={surat.ayat}
        currentIndex={activeAyatIndex}
        onTrackChange={(nextIdx) => playAyatIndex(nextIdx)}
        onClose={() => {
          setCurrentTrack(null);
          setActiveAyatIndex(null);
          setIsPlayingAudio(false);
        }}
        reciterKey={reciterKey}
        setReciterKey={(newReciter) => {
          setReciterKey(newReciter);
          if (activeAyatIndex !== null && surat.ayat[activeAyatIndex]) {
            const currentAyat = surat.ayat[activeAyatIndex];
            const newAudioUrl =
              currentAyat.audio?.[newReciter] || Object.values(currentAyat.audio || {})[0];
            setCurrentTrack((prev) => (prev ? { ...prev, audioUrl: newAudioUrl } : null));
          }
        }}
        repeatCount={repeatCount}
        setRepeatCount={setRepeatCount}
        onPlayStateChange={handlePlayStateChange}
        toggleRef={audioToggleRef}
        isZenOpenExternal={isZenOpen}
        setIsZenOpenExternal={setIsZenOpen}
        transitioningToNext={transitioningToNext}
        onNext={autoNextSurat && surat?.suratSelanjutnya?.nomor ? handleNextSurat : null}
        onPrev={surat?.suratSebelumnya?.nomor ? handlePrevSurat : null}
      />

      {/* Floating Transition Indicator */}
      {transitioningToNext && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-700/80 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
          <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Melanjutkan lantunan ke QS. {transitioningToNext}...</span>
        </div>
      )}

      {/* Tadabbur AI Reflection Modal */}
      <ReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setIsReflectionModalOpen(false)}
        ayatData={selectedAyatForReflection}
      />

      {/* Bottom Navigation for Mobile Device */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Confirmation Modal: Kembali ke Beranda */}
      {isBackConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-stone-900">Audio Masih Diputar</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Lantunan <span className="font-semibold text-stone-800">{currentTrack?.title || "Al-Qur'an"}</span> sedang aktif. Ingin tetap mendengarkan di beranda atau menghentikannya?
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleContinuePlaybackHome}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tetap Lanjutkan di Beranda</span>
              </button>

              <button
                onClick={handleStopAndGoHome}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 text-xs font-semibold rounded-xl transition-colors border border-stone-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Hentikan Audio</span>
              </button>

              <button
                onClick={() => setIsBackConfirmOpen(false)}
                className="w-full py-2 text-xs text-stone-400 hover:text-stone-600 font-medium transition-colors cursor-pointer"
              >
                Batal (Tetap di Surat Ini)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-stone-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-stone-700 text-xs font-semibold flex items-center gap-2 animate-fade-in-up">
          <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
