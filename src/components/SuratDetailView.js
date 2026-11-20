"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BookOpenText,
  BookmarkCheck,
  Headphones,
  Play,
  Pause,
  Bookmark,
  BookMarked,
  ScrollText,
  Search,
  X,
  Loader2,
  ArrowUpRight,
  Compass,
  Wind,
  Share2,
  SlidersHorizontal,
  Sun,
  Moon,
} from "lucide-react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import AudioPlayerBar, { RECITERS } from "./AudioPlayerBar";
import MemorizeMode from "./MemorizeMode";
import ReflectionModal from "./ReflectionModal";
import VerseStoryModal from "./VerseStoryModal";
import Footer from "./Footer";
import { useRouter, useSearchParams } from "next/navigation";
import ambientEngine from "@/utils/ambientSound";
import { executeLocalSmartSearch } from "@/utils/quranSearch";
import {
  formatAyatMarker,
  getLastRead,
  saveLastRead,
  getBookmarks,
  toggleBookmark,
  getAllNotes,
  getReadingTheme,
  applyReadingTheme,
  attachDialogOutsideClickFallback,
} from "@/utils/quranStorage";

function normalizeInitialMode(mode) {
  if (mode === "memorize") return "memorize";
  if (mode === "mushaf") return "mushaf";
  return "read";
}

export default function SuratDetailView({ surat, tafsirData, initialMode = "read" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 3 Genuine Reading Modes: 'read' (Tilawah Per-Ayat) | 'mushaf' (Mushaf Fokus) | 'memorize' (Muraja'ah)
  const [activeMode, setActiveMode] = useState(() => normalizeInitialMode(initialMode));
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);

  // Reading Comfort Settings
  const [readingTheme, setReadingTheme] = useState("system");
  const [arabicFontSize, setArabicFontSize] = useState("normal"); // 'small' | 'normal' | 'large' | 'xlarge'
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [autoNextSurat, setAutoNextSurat] = useState(true);
  const [transitioningToNext, setTransitioningToNext] = useState(null);

  // Mushaf Focus Mode: selected verse for calm bottom inspection sheet
  const [mushafSelectedAyat, setMushafSelectedAyat] = useState(null);

  // Audio Player State
  const initialReciter = searchParams?.get("reciter") || "05";
  const [reciterKey, setReciterKey] = useState(initialReciter);
  const [repeatCount, setRepeatCount] = useState(1);
  const [loopRange, setLoopRange] = useState(null); // { startIdx, endIdx, startAyat, endAyat }
  const [currentTrack, setCurrentTrack] = useState(null);
  const [activeAyatIndex, setActiveAyatIndex] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isZenOpen, setIsZenOpen] = useState(searchParams?.get("zen") === "true");
  const audioToggleRef = useRef(null);

  // Native <dialog> for audio-exit confirmation
  const [isBackConfirmOpen, setIsBackConfirmOpen] = useState(false);
  const backConfirmDialogRef = useRef(null);

  // Modals: Tafsir/Tadabbur & Story Card 9:16 (for ANY verse!)
  const [selectedAyatForReflection, setSelectedAyatForReflection] = useState(null);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [storyVerseData, setStoryVerseData] = useState(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Local Storage Synced States (Last Read, Multi-Bookmarks, Notes)
  const [savedLastRead, setSavedLastRead] = useState(null);
  const [bookmarkedSet, setBookmarkedSet] = useState(() => new Set());
  const [notedSet, setNotedSet] = useState(() => new Set());

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [contextSearchResults, setContextSearchResults] = useState([]);
  const [isLoadingContextSearch, setIsLoadingContextSearch] = useState(false);
  const [activeJumpAyat, setActiveJumpAyat] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2600);
  }, []);

  const syncStorage = useCallback(() => {
    setSavedLastRead(getLastRead());
    setReadingTheme(getReadingTheme());
    const bList = getBookmarks();
    setBookmarkedSet(new Set(bList.map((b) => `${b.suratNomor}:${b.nomorAyat}`)));
    const nList = getAllNotes();
    setNotedSet(new Set(nList.map((n) => `${n.suratNomor}:${n.nomorAyat}`)));
  }, []);

  useEffect(() => {
    syncStorage();
    try {
      const savedAutoNext = localStorage.getItem("quran_auto_next");
      if (savedAutoNext !== null) setAutoNextSurat(savedAutoNext === "true");
    } catch {}
    window.addEventListener("quran-storage-update", syncStorage);
    return () => window.removeEventListener("quran-storage-update", syncStorage);
  }, [syncStorage]);

  // Native <dialog> sync for audio exit confirmation
  useEffect(() => {
    const dialog = backConfirmDialogRef.current;
    if (!dialog) return;
    if (isBackConfirmOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isBackConfirmOpen]);

  useEffect(() => {
    const dialog = backConfirmDialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      dialog.returnValue = "";
      setIsBackConfirmOpen(false);
    };
    dialog.addEventListener("close", handleClose);
    const detach = attachDialogOutsideClickFallback(dialog, () => setIsBackConfirmOpen(false));
    return () => {
      dialog.removeEventListener("close", handleClose);
      detach();
    };
  }, []);

  useEffect(() => {
    if (searchParams?.get("zen") === "true") setIsZenOpen(true);
  }, [searchParams]);

  // URL ?ayat=X or #ayat-X jump
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
          setTimeout(() => setActiveJumpAyat(null), 2600);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [surat?.nomor, surat?.ayat, searchParams]);

  // Auto-scroll active reciting ayah
  useEffect(() => {
    if (autoScrollEnabled && currentTrack?.ayatNomor && isPlayingAudio) {
      const element = document.getElementById(`ayat-${currentTrack.ayatNomor}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTrack?.ayatNomor, isPlayingAudio, autoScrollEnabled]);

  // Prefetch next surah
  useEffect(() => {
    if (surat?.suratSelanjutnya?.nomor) {
      router.prefetch(`/surat/${surat.suratSelanjutnya.nomor}`);
    }
  }, [surat?.suratSelanjutnya?.nomor, router]);

  const handleThemeSelect = (themeId) => {
    setReadingTheme(themeId);
    applyReadingTheme(themeId);
  };

  const handleToggleAutoNext = (val) => {
    setAutoNextSurat(val);
    try {
      localStorage.setItem("quran_auto_next", String(val));
    } catch {}
  };

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
    } catch {}
    setIsBackConfirmOpen(false);
    router.push("/");
  };

  const handleStopAndGoHome = () => {
    if (audioToggleRef.current && isPlayingAudio) audioToggleRef.current();
    if (ambientEngine) ambientEngine.stopAll();
    try {
      sessionStorage.removeItem("quran_playback_transfer");
    } catch {}
    setIsBackConfirmOpen(false);
    router.push("/");
  };

  const handleMarkLastRead = (ayat) => {
    saveLastRead({
      nomor: surat.nomor,
      namaLatin: surat.namaLatin,
      ayat: ayat.nomorAyat,
    });
    showToast(`Ayat ${ayat.nomorAyat} ditandai sebagai bacaan terakhir`);
  };

  const handleToggleFavorite = (ayat) => {
    const res = toggleBookmark({
      suratNomor: surat.nomor,
      suratNamaLatin: surat.namaLatin,
      nomorAyat: ayat.nomorAyat,
      teksArab: ayat.teksArab,
      teksIndonesia: ayat.teksIndonesia,
    });
    showToast(
      res.saved
        ? `Ayat ${ayat.nomorAyat} disimpan ke Koleksi`
        : `Ayat ${ayat.nomorAyat} dihapus dari Koleksi`
    );
  };

  const openStoryModal = (ayat) => {
    setStoryVerseData({
      suratNomor: surat.nomor,
      suratNamaLatin: surat.namaLatin,
      nomorAyat: ayat.nomorAyat,
      teksArab: ayat.teksArab,
      teksLatin: ayat.teksLatin,
      teksIndonesia: ayat.teksIndonesia,
    });
    setIsStoryModalOpen(true);
  };

  const jumpToTargetAyat = (ayatNum) => {
    const el = document.getElementById(`ayat-${ayatNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveJumpAyat(ayatNum);
      setTimeout(() => setActiveJumpAyat(null), 2600);
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

  const handleContextualSearch = async () => {
    if (!searchQuery.trim() || isLoadingContextSearch) return;
    setIsLoadingContextSearch(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data?.results) setContextSearchResults(data.results);
    } catch (e) {
      console.error("Gagal menelusuri topik:", e);
    } finally {
      setIsLoadingContextSearch(false);
    }
  };

  const playAyatIndex = useCallback(
    (index, customRepeat = 1) => {
      if (!surat.ayat || index < 0 || index >= surat.ayat.length) return;
      const ayat = surat.ayat[index];
      setActiveAyatIndex(index);
      if (customRepeat !== undefined) setRepeatCount(customRepeat);

      const audioUrl = ayat.audio?.[reciterKey] || Object.values(ayat.audio || {})[0];
      setCurrentTrack({
        title: `QS. ${surat.namaLatin} : Ayat ${ayat.nomorAyat}`,
        audioUrl,
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
    setLoopRange(null);
    const idx = surat.ayat.findIndex((a) => a.nomorAyat === ayat.nomorAyat);
    if (idx !== -1) playAyatIndex(idx, customRepeat);
  };

  const handleStartRangeLoop = (startAyat, endAyat) => {
    const startIdx = surat.ayat.findIndex((a) => a.nomorAyat === startAyat);
    const endIdx = surat.ayat.findIndex((a) => a.nomorAyat === endAyat);
    if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
      setLoopRange({ startIdx, endIdx, startAyat, endAyat });
      playAyatIndex(startIdx, 1);
      showToast(`Mengulang blok Ayat ${startAyat} sampai ${endAyat}`);
    }
  };

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

  const playSuratSequential = () => {
    setLoopRange(null);
    if (surat.ayat && surat.ayat.length > 0) playAyatIndex(0, 1);
  };

  const openKhusyukMode = () => {
    if (!currentTrack) playSuratSequential();
    setIsZenOpen(true);
  };

  const handleNextSurat = useCallback(() => {
    if (surat?.suratSelanjutnya?.nomor) {
      setTransitioningToNext(surat.suratSelanjutnya.namaLatin);
      const zenParam = isZenOpen ? "&zen=true" : "";
      router.push(
        `/surat/${surat.suratSelanjutnya.nomor}?autoplay=true&reciter=${reciterKey}&mode=${activeMode}${zenParam}`
      );
    }
  }, [surat?.suratSelanjutnya, reciterKey, activeMode, isZenOpen, router]);

  const handlePrevSurat = useCallback(() => {
    if (surat?.suratSebelumnya?.nomor) {
      const zenParam = isZenOpen ? "&zen=true" : "";
      router.push(
        `/surat/${surat.suratSebelumnya.nomor}?autoplay=true&reciter=${reciterKey}&mode=${activeMode}${zenParam}`
      );
    }
  }, [surat?.suratSebelumnya, reciterKey, activeMode, isZenOpen, router]);

  useEffect(() => {
    if (searchParams?.get("autoplay") === "true" && surat?.ayat?.length > 0) {
      const timer = setTimeout(() => playAyatIndex(0, 1), 150);
      return () => clearTimeout(timer);
    }
  }, [surat?.nomor, surat?.ayat?.length, searchParams, playAyatIndex]);

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
    if (arabicFontSize === "small") return "text-xl sm:text-2xl leading-[2.3]";
    if (arabicFontSize === "large") return "text-3xl sm:text-4xl leading-[2.55]";
    if (arabicFontSize === "xlarge") return "text-4xl sm:text-[42px] leading-[2.65]";
    return "text-2xl sm:text-[30px] leading-[2.45]";
  };

  const isBismillahShown = surat.nomor !== 1 && surat.nomor !== 9;

  const detailBottomTabs = [
    { id: "read", label: "Tilawah", icon: BookOpen },
    { id: "mushaf", label: "Mushaf", icon: BookOpenText },
    { id: "memorize", label: "Muraja'ah", icon: BookmarkCheck },
    { id: "khusyuk", label: "Khusyuk", icon: Wind },
  ];

  const handleBottomTabClick = (tabId) => {
    if (tabId === "khusyuk") {
      openKhusyukMode();
    } else {
      setActiveMode(tabId);
      setMushafSelectedAyat(null);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        currentTrack || mushafSelectedAyat ? "pb-48 md:pb-36" : "pb-24 md:pb-12"
      }`}
    >
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6 space-y-5">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBackClick}
            className="inline-flex items-center gap-1.5 text-xs font-medium surface-card border border-theme hover:border-[var(--border-strong)] ink-primary px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Daftar Surat</span>
          </button>

          <div className="flex items-center gap-1 text-xs truncate">
            {surat.suratSebelumnya && (
              <Link
                href={`/surat/${surat.suratSebelumnya.nomor}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 ink-muted hover:ink-primary rounded-lg transition-colors truncate max-w-[125px] sm:max-w-none"
                title={`Sebelumnya: ${surat.suratSebelumnya.namaLatin}`}
              >
                <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{surat.suratSebelumnya.namaLatin}</span>
              </Link>
            )}
            {surat.suratSelanjutnya && (
              <Link
                href={`/surat/${surat.suratSelanjutnya.nomor}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 ink-muted hover:ink-primary rounded-lg transition-colors truncate max-w-[125px] sm:max-w-none"
                title={`Selanjutnya: ${surat.suratSelanjutnya.namaLatin}`}
              >
                <span className="truncate">{surat.suratSelanjutnya.namaLatin}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            )}
          </div>
        </div>

        {/* Surah Masthead Card */}
        <header className="bg-[#1B4332] text-stone-100 rounded-3xl p-6 sm:p-8 border border-white/10 text-center">
          <div className="max-w-xl mx-auto space-y-2.5">
            <p className="text-[11px] uppercase tracking-widest text-[#D4B680] font-medium">
              Surat ke-{surat.nomor} • {surat.tempatTurun} • {surat.jumlahAyat} Ayat
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {surat.namaLatin}
            </h1>
            <p className="font-arabic text-4xl sm:text-5xl text-[#F7F4EC] text-center leading-relaxed pt-1">
              {surat.nama}
            </p>
            <p className="text-xs sm:text-sm text-stone-300 italic">&quot;{surat.arti}&quot;</p>

            {/* Audio & Qari Action Row */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={playSuratSequential}
                className="inline-flex items-center gap-1.5 bg-[#F7F4EC] text-[#1B4332] hover:bg-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Putar Murattal</span>
              </button>

              <button
                type="button"
                onClick={openKhusyukMode}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-stone-100 px-4 py-2 rounded-xl text-xs font-medium border border-white/15 transition-colors cursor-pointer"
              >
                <Wind className="w-3.5 h-3.5 text-[#D4B680]" />
                <span>Ruang Khusyuk</span>
              </button>

              <select
                aria-label="Pilih Qari Murattal"
                value={reciterKey}
                onChange={(e) => {
                  const next = e.target.value;
                  setReciterKey(next);
                  if (activeAyatIndex !== null && surat.ayat[activeAyatIndex]) {
                    const currentAyat = surat.ayat[activeAyatIndex];
                    const nextUrl =
                      currentAyat.audio?.[next] || Object.values(currentAyat.audio || {})[0];
                    setCurrentTrack((prev) => (prev ? { ...prev, audioUrl: nextUrl } : null));
                  }
                }}
                className="bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none cursor-pointer max-w-[175px] truncate"
              >
                {Object.entries(RECITERS).map(([key, val]) => (
                  <option key={key} value={key} className="bg-stone-900 text-white">
                    {val.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Clean 3-Mode Bar + Display Settings Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div
            role="tablist"
            aria-label="Mode tampilan surat"
            className="surface-card p-1 rounded-2xl border border-theme grid grid-cols-3 gap-1 flex-1 sm:max-w-md"
          >
            {[
              { id: "read", label: "Tilawah", icon: BookOpen },
              { id: "mushaf", label: "Mushaf Fokus", icon: BookOpenText },
              { id: "memorize", label: "Muraja'ah", icon: BookmarkCheck },
            ].map((mode) => {
              const Icon = mode.icon;
              const active = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setActiveMode(mode.id);
                    setMushafSelectedAyat(null);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-[#1B4332] text-white"
                      : "ink-secondary hover:ink-primary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {activeMode !== "memorize" && (
            <button
              type="button"
              onClick={() => setShowDisplaySettings((v) => !v)}
              aria-expanded={showDisplaySettings}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                showDisplaySettings
                  ? "bg-[#1B4332] text-white border-[#1B4332]"
                  : "surface-card border-theme ink-primary hover:border-[var(--border-strong)]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Tampilan &amp; Kertas</span>
            </button>
          )}
        </div>

        {/* Collapsible Reading Preferences Bar (Theme, Font Size, Toggles) */}
        {showDisplaySettings && activeMode !== "memorize" && (
          <div className="surface-card rounded-2xl p-4 border border-theme space-y-4 animate-fade-in-up text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Paper Theme Selector */}
              <div className="space-y-2">
                <span className="font-semibold ink-primary block">Tema Kertas Baca</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "mushaf", label: "Mushaf", icon: BookOpenText },
                    { id: "light", label: "Terang", icon: Sun },
                    { id: "dark", label: "Malam", icon: Moon },
                  ].map((t) => {
                    const Icon = t.icon;
                    const active = readingTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleThemeSelect(t.id)}
                        className={`py-2 px-2.5 rounded-xl border font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          active
                            ? "bg-[#1B4332] text-white border-[#1B4332]"
                            : "surface-elevated border-theme ink-secondary hover:ink-primary"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Arabic Font Size */}
              <div className="space-y-2">
                <span className="font-semibold ink-primary block">Ukuran Huruf Arab</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "small", label: "Kecil" },
                    { id: "normal", label: "Sedang" },
                    { id: "large", label: "Besar" },
                    { id: "xlarge", label: "Ekstra" },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setArabicFontSize(sz.id)}
                      className={`py-2 px-2 rounded-xl border font-medium transition-colors cursor-pointer ${
                        arabicFontSize === sz.id
                          ? "bg-[#1B4332] text-white border-[#1B4332]"
                          : "surface-elevated border-theme ink-secondary hover:ink-primary"
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkboxes Row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-theme ink-secondary">
              {activeMode === "read" && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showLatin}
                      onChange={(e) => setShowLatin(e.target.checked)}
                      className="accent-[#1B4332] rounded cursor-pointer"
                    />
                    <span>Transliterasi Latin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showTranslation}
                      onChange={(e) => setShowTranslation(e.target.checked)}
                      className="accent-[#1B4332] rounded cursor-pointer"
                    />
                    <span>Terjemahan Indonesia</span>
                  </label>
                </>
              )}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoScrollEnabled}
                  onChange={(e) => setAutoScrollEnabled(e.target.checked)}
                  className="accent-[#1B4332] rounded cursor-pointer"
                />
                <span>Ikuti Ayat Otomatis</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoNextSurat}
                  onChange={(e) => handleToggleAutoNext(e.target.checked)}
                  className="accent-[#1B4332] rounded cursor-pointer"
                />
                <span>Lanjut ke Surat Berikutnya</span>
              </label>
            </div>
          </div>
        )}

        {/* Quick Jump & Contextual Search (In Tilawah & Mushaf Modes) */}
        {activeMode !== "memorize" && (
          <div className="relative">
            <div className="surface-card rounded-2xl p-2 border border-theme flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 ink-muted absolute left-3 pointer-events-none" />
                <input
                  type="search"
                  aria-label="Lompat ke ayat atau cari topik"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={`Lompat ke ayat (1–${surat.jumlahAyat}), surat lain (2:255), atau topik...`}
                  className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm surface-elevated border border-transparent focus:border-emerald-700 rounded-xl ink-primary placeholder:text-[var(--ink-muted)] focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setContextSearchResults([]);
                    }}
                    className="absolute right-2.5 ink-muted hover:ink-primary p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {savedLastRead && savedLastRead.nomor === surat.nomor && (
                <button
                  type="button"
                  onClick={() => jumpToTargetAyat(savedLastRead.ayat)}
                  className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium surface-brass-soft border border-theme ink-primary hover:border-[var(--brand-brass)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 ink-brass fill-current" />
                  <span>Ayat {savedLastRead.ayat}</span>
                </button>
              )}
            </div>

            {isSearchFocused &&
              searchQuery.trim().length > 0 &&
              (() => {
                const localResults = executeLocalSmartSearch(searchQuery, surat);
                return (
                  <div className="absolute top-full left-0 right-0 mt-2 z-40 surface-card rounded-2xl border border-theme shadow-2xl p-3 space-y-2.5 max-h-[26rem] overflow-y-auto custom-scroll">
                    <div className="flex items-center justify-between px-1 pb-1.5 border-b border-theme">
                      <span className="text-[11px] font-semibold ink-muted uppercase tracking-wider">
                        Temuan Ayat &amp; Topik
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSearchFocused(false)}
                        className="text-xs ink-muted hover:ink-primary cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>

                    {localResults.patternResult && (
                      <div className="p-2.5 rounded-xl surface-accent-soft border border-emerald-700/25 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs sm:text-sm font-semibold ink-primary">
                            {localResults.patternResult.label}
                          </p>
                          <p className="text-[11px] ink-muted">
                            {localResults.patternResult.isCurrentSurat
                              ? "Lompat langsung di halaman ini"
                              : `Buka QS. ${localResults.patternResult.suratNamaLatin}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSearchSelect(localResults.patternResult)}
                          className="px-3 py-1.5 bg-[#1B4332] text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Lompat</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {localResults.thematicResults.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSearchSelect(t)}
                        className="w-full text-left p-2.5 rounded-xl surface-elevated hover:border-[var(--brand-brass)] border border-theme transition-colors flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-xs ink-primary">{t.title}</span>
                            <span className="text-[10px] ink-brass font-medium">
                              QS. {t.suratNamaLatin} : {t.ayatRange}
                            </span>
                          </div>
                          <p className="text-[11px] ink-secondary mt-0.5 line-clamp-2">
                            {t.description}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 ink-muted shrink-0 mt-0.5" />
                      </button>
                    ))}

                    {localResults.surahResults.map((s) => (
                      <button
                        key={s.nomor}
                        type="button"
                        onClick={() => router.push(`/surat/${s.nomor}`)}
                        className="w-full p-2 rounded-xl hover:surface-elevated flex items-center justify-between text-xs font-medium ink-primary cursor-pointer"
                      >
                        <span>
                          {s.nomor}. {s.namaLatin} ({s.jumlahAyat} Ayat)
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 ink-muted" />
                      </button>
                    ))}

                    {contextSearchResults.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-theme">
                        <span className="text-[11px] font-semibold ink-muted px-1">
                          Rujukan Kontekstual
                        </span>
                        {contextSearchResults.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSearchSelect(item)}
                            className="w-full text-left p-2.5 rounded-xl surface-accent-soft border border-emerald-700/20 space-y-0.5 cursor-pointer"
                          >
                            <p className="font-semibold text-xs ink-primary">
                              QS. {item.suratNamaLatin} : Ayat {item.nomorAyat} — {item.judulTopik}
                            </p>
                            <p className="text-[11px] ink-secondary line-clamp-2">
                              {item.alasanRelevansi}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-theme">
                      <button
                        type="button"
                        onClick={handleContextualSearch}
                        disabled={isLoadingContextSearch}
                        className="w-full py-2 px-3 rounded-xl bg-[#1B4332] hover:bg-[#245640] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {isLoadingContextSearch ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Menelusuri rujukan ayat...</span>
                          </>
                        ) : (
                          <>
                            <Compass className="w-3.5 h-3.5" />
                            <span>Cari rujukan ayat tentang &quot;{searchQuery}&quot;</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}
          </div>
        )}

        {/* ============================================================
            MODE 1: TILAWAH (PER-AYAT)
           ============================================================ */}
        {activeMode === "read" && (
          <div className="space-y-4">
            {isBismillahShown && (
              <div className="text-center py-6 px-4 surface-card rounded-3xl border border-theme">
                <p className="font-arabic text-3xl sm:text-4xl ink-arabic text-center">
                  بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>
                <p className="text-xs ink-muted mt-1.5 italic">
                  Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
                </p>
              </div>
            )}

            <div className="space-y-3.5">
              {surat.ayat.map((ayat, idx) => {
                const isPlayingThis =
                  currentTrack?.ayatNomor === ayat.nomorAyat &&
                  currentTrack?.title.includes(surat.namaLatin);
                const isLastRead =
                  savedLastRead?.nomor === surat.nomor && savedLastRead?.ayat === ayat.nomorAyat;
                const isFavorited = bookmarkedSet.has(`${surat.nomor}:${ayat.nomorAyat}`);
                const hasNote = notedSet.has(`${surat.nomor}:${ayat.nomorAyat}`);

                return (
                  <article
                    key={ayat.nomorAyat}
                    id={`ayat-${ayat.nomorAyat}`}
                    className={`surface-card rounded-2xl border transition-colors p-4 sm:p-6 ${
                      idx >= 6 ? "verse-deferred" : ""
                    } ${activeJumpAyat === ayat.nomorAyat ? "ayat-jump-highlight" : ""} ${
                      isPlayingThis
                        ? "ayat-active-reciting"
                        : isLastRead
                        ? "surface-brass-soft border-[#9A7B4F]/50"
                        : "border-theme"
                    }`}
                  >
                    {/* Verse Action Strip */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-theme gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-semibold text-xs shrink-0 border tabular-nums ${
                            isPlayingThis
                              ? "bg-[#1B4332] text-white border-[#1B4332]"
                              : "surface-elevated ink-primary border-theme"
                          }`}
                        >
                          {ayat.nomorAyat}
                        </span>

                        {isPlayingThis && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                            <span className="flex items-center gap-0.5 h-3">
                              <span className="w-0.5 h-2 bg-current rounded audio-bar-1 inline-block" />
                              <span className="w-0.5 h-3 bg-current rounded audio-bar-2 inline-block" />
                              <span className="w-0.5 h-1.5 bg-current rounded audio-bar-3 inline-block" />
                            </span>
                            <span className="hidden sm:inline">Dilantunkan</span>
                          </span>
                        )}

                        {isLastRead && !isPlayingThis && (
                          <span className="text-[11px] font-medium ink-brass truncate">
                            Terakhir dibaca
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleVerseAudioClick(ayat)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors inline-flex items-center gap-1 border cursor-pointer ${
                            isPlayingThis
                              ? "bg-[#1B4332] text-white border-[#1B4332]"
                              : "surface-elevated border-theme ink-primary hover:border-[var(--border-strong)]"
                          }`}
                          title={isPlayingThis && isPlayingAudio ? "Jeda Audio" : "Putar Ayat"}
                        >
                          {isPlayingThis && isPlayingAudio ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Jeda</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Dengar</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkLastRead(ayat)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isLastRead
                              ? "surface-brass-soft border-[#9A7B4F] ink-brass"
                              : "surface-elevated border-theme ink-muted hover:ink-primary"
                          }`}
                          title="Tandai sebagai bacaan terakhir"
                          aria-label="Tandai sebagai bacaan terakhir"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isLastRead ? "fill-current" : ""}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(ayat)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isFavorited
                              ? "surface-accent-soft border-emerald-700/40 text-emerald-700 dark:text-emerald-300"
                              : "surface-elevated border-theme ink-muted hover:ink-primary"
                          }`}
                          title={isFavorited ? "Tersimpan di Koleksi" : "Simpan ke Koleksi"}
                          aria-label={isFavorited ? "Hapus dari Koleksi" : "Simpan ke Koleksi"}
                        >
                          <BookMarked
                            className={`w-3.5 h-3.5 ${isFavorited ? "fill-current" : ""}`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => openStoryModal(ayat)}
                          className="p-2 rounded-xl surface-elevated border border-theme ink-muted hover:ink-primary transition-colors cursor-pointer"
                          title="Buat Kartu Ayat (9:16)"
                          aria-label="Buat Kartu Ayat"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openReflection(ayat)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer ${
                            hasNote
                              ? "surface-accent-soft border-emerald-700/40 text-emerald-800 dark:text-emerald-300"
                              : "surface-elevated border-theme ink-primary hover:border-[var(--border-strong)]"
                          }`}
                          title="Buka Tafsir Kemenag & Catatan Hati"
                        >
                          <ScrollText className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="hidden sm:inline">
                            {hasNote ? "Tafsir •" : "Tafsir"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Crisp Regular-Weight Arabic Verse + Authentic End Marker */}
                    <p className={`font-arabic ink-arabic mb-5 ${getFontSizeClass()}`}>
                      {ayat.teksArab}
                      <span className="ayat-end-ornament">{formatAyatMarker(ayat.nomorAyat)}</span>
                    </p>

                    {/* Latin & Translation */}
                    {(showLatin || showTranslation) && (
                      <div className="space-y-1.5 pt-3 border-t border-theme">
                        {showLatin && ayat.teksLatin && (
                          <p className="text-xs sm:text-sm ink-brass italic leading-relaxed">
                            {ayat.teksLatin}
                          </p>
                        )}
                        {showTranslation && (
                          <p className="text-xs sm:text-[15px] ink-secondary leading-relaxed">
                            {ayat.teksIndonesia}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            MODE 2: MUSHAF FOKUS (CONTINUOUS FLOWING READING)
           ============================================================ */}
        {activeMode === "mushaf" && (
          <section
            aria-label="Mode Mushaf Fokus"
            className="surface-card rounded-3xl p-5 sm:p-10 border border-theme space-y-6"
          >
            <div className="text-center pb-5 border-b border-theme space-y-2">
              <p className="text-[11px] uppercase tracking-widest ink-muted">
                Ketuk ayat mana pun untuk melihat arti, audio, atau tafsir
              </p>
              {isBismillahShown && (
                <p className="font-arabic text-3xl sm:text-4xl ink-arabic text-center pt-2">
                  بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>
              )}
            </div>

            <div className={`mushaf-flow ink-arabic ${getFontSizeClass()}`}>
              {surat.ayat.map((ayat) => {
                const isSelected = mushafSelectedAyat?.nomorAyat === ayat.nomorAyat;
                const isPlayingThis =
                  currentTrack?.ayatNomor === ayat.nomorAyat &&
                  currentTrack?.title.includes(surat.namaLatin);

                return (
                  <span
                    key={ayat.nomorAyat}
                    id={`ayat-${ayat.nomorAyat}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setMushafSelectedAyat(isSelected ? null : ayat)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setMushafSelectedAyat(isSelected ? null : ayat);
                      }
                    }}
                    className={`inline rounded-lg px-1 transition-colors cursor-pointer ${
                      isPlayingThis
                        ? "surface-accent-soft text-emerald-800 dark:text-emerald-200"
                        : isSelected
                        ? "surface-brass-soft"
                        : "hover:bg-black/5"
                    }`}
                  >
                    {ayat.teksArab}
                    <span className="ayat-end-ornament">{formatAyatMarker(ayat.nomorAyat)}</span>{" "}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================================
            MODE 3: MURAJA'AH (HAFALAN AKTIF)
           ============================================================ */}
        {activeMode === "memorize" && (
          <MemorizeMode
            surat={surat}
            onPlayAyat={playAyat}
            onStartRangeLoop={handleStartRangeLoop}
            activeLoopRange={loopRange}
            onClearRangeLoop={() => setLoopRange(null)}
            onOpenReflection={openReflection}
          />
        )}

        {/* Bottom Surah Navigation */}
        <div className="flex items-center justify-between gap-3 pt-4">
          {surat.suratSebelumnya ? (
            <Link
              href={`/surat/${surat.suratSebelumnya.nomor}`}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl surface-card border border-theme hover:border-[var(--brand-brass)] transition-colors flex items-center gap-2 text-xs"
            >
              <ChevronLeft className="w-4 h-4 ink-muted shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] ink-muted block">Sebelumnya</span>
                <span className="font-semibold ink-primary truncate block">
                  {surat.suratSebelumnya.namaLatin}
                </span>
              </div>
            </Link>
          ) : (
            <span />
          )}

          {surat.suratSelanjutnya && (
            <Link
              href={`/surat/${surat.suratSelanjutnya.nomor}`}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl surface-card border border-theme hover:border-[var(--brand-brass)] transition-colors flex items-center justify-end gap-2 text-xs text-right"
            >
              <div className="min-w-0">
                <span className="text-[10px] ink-muted block">Selanjutnya</span>
                <span className="font-semibold ink-primary truncate block">
                  {surat.suratSelanjutnya.namaLatin}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 ink-muted shrink-0" />
            </Link>
          )}
        </div>

        <Footer compact />
      </main>

      {/* Mushaf Tap-to-Inspect Calm Floating Sheet */}
      {activeMode === "mushaf" && mushafSelectedAyat && (
        <div
          className={`fixed left-3 right-3 z-40 max-w-2xl mx-auto surface-card border border-theme rounded-2xl p-4 shadow-2xl animate-fade-in-up ${
            currentTrack ? "bottom-44 md:bottom-36" : "bottom-[72px] md:bottom-6"
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="text-xs font-semibold ink-brass">
              QS. {surat.namaLatin} : Ayat {mushafSelectedAyat.nomorAyat}
            </span>
            <button
              type="button"
              onClick={() => setMushafSelectedAyat(null)}
              aria-label="Tutup pratinjau ayat"
              className="ink-muted hover:ink-primary p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm ink-secondary leading-relaxed mb-3">
            &quot;{mushafSelectedAyat.teksIndonesia}&quot;
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleVerseAudioClick(mushafSelectedAyat)}
              className="px-3 py-1.5 rounded-xl bg-[#1B4332] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Dengar Ayat</span>
            </button>
            <button
              type="button"
              onClick={() => handleMarkLastRead(mushafSelectedAyat)}
              className="px-3 py-1.5 rounded-xl surface-elevated border border-theme ink-primary text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 ink-brass" />
              <span>Tandai Terakhir</span>
            </button>
            <button
              type="button"
              onClick={() => openReflection(mushafSelectedAyat)}
              className="px-3 py-1.5 rounded-xl surface-elevated border border-theme ink-primary text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ScrollText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tafsir &amp; Catatan</span>
            </button>
            <button
              type="button"
              onClick={() => openStoryModal(mushafSelectedAyat)}
              className="px-3 py-1.5 rounded-xl surface-elevated border border-theme ink-primary text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 ink-muted" />
              <span>Kartu Ayat</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Audio Player Bar */}
      <AudioPlayerBar
        currentTrack={currentTrack}
        playlist={surat.ayat}
        currentIndex={activeAyatIndex}
        onTrackChange={(nextIdx) => playAyatIndex(nextIdx)}
        onClose={() => {
          setCurrentTrack(null);
          setActiveAyatIndex(null);
          setIsPlayingAudio(false);
          setLoopRange(null);
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
        loopRange={loopRange}
        onClearLoopRange={() => setLoopRange(null)}
        onPlayStateChange={setIsPlayingAudio}
        toggleRef={audioToggleRef}
        isZenOpenExternal={isZenOpen}
        setIsZenOpenExternal={setIsZenOpen}
        transitioningToNext={transitioningToNext}
        onNext={autoNextSurat && surat?.suratSelanjutnya?.nomor ? handleNextSurat : null}
        onPrev={surat?.suratSebelumnya?.nomor ? handlePrevSurat : null}
      />

      {transitioningToNext && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#161E1B]/95 text-stone-100 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl border border-white/15 text-xs font-medium flex items-center gap-2">
          <Headphones className="w-3.5 h-3.5 text-emerald-300" />
          <span>Melanjutkan ke QS. {transitioningToNext}...</span>
        </div>
      )}

      <ReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setIsReflectionModalOpen(false)}
        ayatData={selectedAyatForReflection}
      />

      <VerseStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        verseData={storyVerseData}
      />

      <BottomNav
        activeTab={activeMode}
        setActiveTab={handleBottomTabClick}
        items={detailBottomTabs}
      />

      {/* Native <dialog> Confirmation when navigating Home during active playback */}
      <dialog
        ref={backConfirmDialogRef}
        closedby="any"
        aria-labelledby="back-audio-confirm-title"
        className="app-modal p-4 w-full max-w-sm"
      >
        <div className="surface-card rounded-3xl p-6 w-full border border-theme shadow-2xl space-y-4 text-center">
          <div className="w-11 h-11 rounded-2xl surface-accent-soft text-emerald-700 flex items-center justify-center mx-auto">
            <Headphones className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <h2
              id="back-audio-confirm-title"
              className="font-editorial font-semibold text-lg ink-primary"
            >
              Murattal Sedang Diputar
            </h2>
            <p className="text-xs ink-secondary leading-relaxed">
              Lantunan <strong>{currentTrack?.title || "Al-Qur'an"}</strong> masih aktif. Lanjutkan
              audio di beranda atau hentikan?
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleContinuePlaybackHome}
              className="w-full py-2.5 px-4 bg-[#1B4332] hover:bg-[#245640] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Tetap Putar di Beranda
            </button>
            <button
              type="button"
              onClick={handleStopAndGoHome}
              className="w-full py-2.5 px-4 surface-elevated hover:text-red-600 ink-primary text-xs font-medium rounded-xl border border-theme transition-colors cursor-pointer"
            >
              Hentikan &amp; Kembali
            </button>
            <button
              type="button"
              onClick={() => setIsBackConfirmOpen(false)}
              className="w-full py-1.5 text-xs ink-muted hover:ink-primary cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      </dialog>

      {/* Calm Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#161E1B]/95 text-stone-100 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl border border-white/10 text-xs font-medium animate-fade-in-up"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
