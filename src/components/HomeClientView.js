"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookMarked,
  Bookmark,
  BookmarkCheck,
  Search,
  X,
  Shuffle,
  Share2,
  ScrollText,
  ArrowUpRight,
  Compass,
  Clock,
} from "lucide-react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import SuratCard from "./SuratCard";
import AudioPlayerBar from "./AudioPlayerBar";
import ReflectionModal from "./ReflectionModal";
import VerseStoryModal from "./VerseStoryModal";
import Footer from "./Footer";
import { getDailyVerse, getRandomVerse } from "@/utils/dailyVerse";
import { executeLocalSmartSearch } from "@/utils/quranSearch";
import {
  formatAyatMarker,
  getLastRead,
  getAllMemorizeProgress,
  getContextualGreetingAndSunnah,
} from "@/utils/quranStorage";

const QUICK_LIFE_TOPICS = [
  { label: "Ketenangan Hati", query: "ketenangan" },
  { label: "Rezeki & Tawakal", query: "1000 dinar" },
  { label: "Sabar & Ujian", query: "sabar" },
  { label: "Keluarga & Jodoh", query: "jodoh" },
  { label: "Hutang & Muamalah", query: "hutang" },
  { label: "Taubat & Ampunan", query: "taubat" },
  { label: "Berbakti Orang Tua", query: "orang tua" },
];

export default function HomeClientView({ initialSuratList = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all"); // 'all' | 'juz_amma' | 'makkiyyah' | 'madaniyyah' | 'memorizing'
  const [activeBottomTab, setActiveBottomTab] = useState("home");
  const [isKoleksiDrawerOpen, setIsKoleksiDrawerOpen] = useState(false);

  const [lastRead, setLastRead] = useState(null);
  const [memorizeMap, setMemorizeMap] = useState({});
  const [dailyVerse, setDailyVerse] = useState(() => getDailyVerse());
  const [contextInfo, setContextInfo] = useState(() =>
    getContextualGreetingAndSunnah(new Date("2026-01-01T08:00:00"))
  );

  // Audio & Modals
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentPlayingSuratNomor, setCurrentPlayingSuratNomor] = useState(null);
  const [reciterKey, setReciterKey] = useState("05");
  const [repeatCount, setRepeatCount] = useState(1);
  const [reflectionAyat, setReflectionAyat] = useState(null);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [transferredPlaylist, setTransferredPlaylist] = useState(null);
  const [transferredIndex, setTransferredIndex] = useState(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const syncLocalState = useCallback(() => {
    setLastRead(getLastRead());
    setMemorizeMap(getAllMemorizeProgress());
  }, []);

  useEffect(() => {
    setDailyVerse(getDailyVerse());
    setContextInfo(getContextualGreetingAndSunnah(new Date()));
    syncLocalState();

    try {
      const transfer = sessionStorage.getItem("quran_playback_transfer");
      if (transfer) {
        const data = JSON.parse(transfer);
        if (data?.currentTrack) {
          setCurrentTrack(data.currentTrack);
          if (data.reciterKey) setReciterKey(data.reciterKey);
          if (data.repeatCount) setRepeatCount(data.repeatCount);
          if (data.playlist) setTransferredPlaylist(data.playlist);
          if (data.currentIndex !== undefined) setTransferredIndex(data.currentIndex);
        }
        sessionStorage.removeItem("quran_playback_transfer");
      }
    } catch {}

    window.addEventListener("quran-storage-update", syncLocalState);
    return () => window.removeEventListener("quran-storage-update", syncLocalState);
  }, [syncLocalState]);

  const smartResults = useMemo(() => executeLocalSmartSearch(searchQuery), [searchQuery]);
  const memorizingSurahCount = Object.keys(memorizeMap).length;

  const filteredSurat = useMemo(() => {
    return initialSuratList.filter((s) => {
      const query = searchQuery.trim().toLowerCase();

      const matchesCategory = () => {
        if (category === "juz_amma") return s.nomor >= 78 && s.nomor <= 114;
        if (category === "makkiyyah") return s.tempatTurun.toLowerCase() === "mekah";
        if (category === "madaniyyah") return s.tempatTurun.toLowerCase() === "madinah";
        if (category === "memorizing") return Boolean(memorizeMap[s.nomor]);
        return true;
      };

      if (!query) return matchesCategory();

      if (smartResults.patternResult && smartResults.patternResult.suratNomor === s.nomor) {
        return true;
      }
      if (smartResults.thematicResults.some((t) => t.suratNomor === s.nomor)) {
        return true;
      }

      const matchSearch =
        s.namaLatin.toLowerCase().includes(query) ||
        s.arti.toLowerCase().includes(query) ||
        s.nomor.toString() === query ||
        s.nama.includes(query);

      if (!matchSearch) return false;
      return matchesCategory();
    });
  }, [initialSuratList, searchQuery, category, smartResults, memorizeMap]);

  const handleOpenDailyReflection = () => {
    setReflectionAyat(dailyVerse);
    setIsReflectionOpen(true);
  };

  const handleShuffleDailyVerse = () => {
    setDailyVerse(getRandomVerse(dailyVerse?.index));
  };

  const handleQuickPlay = useCallback(
    (suratItem) => {
      const audioUrl =
        suratItem.audioFull?.[reciterKey] || Object.values(suratItem.audioFull || {})[0];
      setCurrentPlayingSuratNomor(suratItem.nomor);
      setCurrentTrack({
        title: `QS. ${suratItem.namaLatin} (Lengkap)`,
        audioUrl,
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

  const homeBottomTabs = [
    { id: "home", label: "Beranda", icon: BookOpen },
    { id: "saved", label: "Koleksi", icon: BookMarked },
    { id: "memorize", label: "Hafalan", icon: BookmarkCheck },
    { id: "daily", label: "Tadabbur", icon: ScrollText },
  ];

  const handleBottomNavChange = (tabId) => {
    setActiveBottomTab(tabId);
    if (tabId === "saved") {
      setIsKoleksiDrawerOpen(true);
    } else if (tabId === "daily") {
      handleOpenDailyReflection();
    } else if (tabId === "memorize") {
      setCategory(memorizingSurahCount > 0 ? "memorizing" : "juz_amma");
      document.getElementById("daftar-surat")?.scrollIntoView({ behavior: "smooth" });
    } else {
      setCategory("all");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        currentTrack ? "pb-44 md:pb-32" : "pb-24 md:pb-12"
      }`}
    >
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        externalDrawerOpen={isKoleksiDrawerOpen}
        setExternalDrawerOpen={setIsKoleksiDrawerOpen}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-5 sm:mt-8 space-y-7">
        {/* 1. EDITORIAL WELCOME & CONTEXTUAL SUNNAH BAND */}
        <section className="rounded-3xl bg-[#1B4332] text-stone-100 p-6 sm:p-8 border border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-[#D4B680]">
                <Clock className="w-3.5 h-3.5" />
                <span>{contextInfo.timeLabel}</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
                Tenangkan Hati Bersama Kalam Ilahi
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {contextInfo.subtitle}
              </p>
            </div>

            {lastRead ? (
              <Link
                href={`/surat/${lastRead.nomor}?ayat=${lastRead.ayat || 1}#ayat-${lastRead.ayat || 1}`}
                className="inline-flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-colors self-start md:self-end min-w-[230px]"
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4 text-[#D4B680] fill-[#D4B680] shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-300 block">
                      Lanjutkan Tilawah
                    </span>
                    <span className="text-sm font-semibold text-white">
                      QS. {lastRead.namaLatin} : {lastRead.ayat || 1}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-300 shrink-0" />
              </Link>
            ) : (
              <Link
                href="/surat/1"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1B4332] hover:bg-stone-100 text-xs font-semibold transition-colors self-start md:self-end"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mulai dari Al-Fatihah</span>
              </Link>
            )}
          </div>

          {/* Contextual Sunnah & Daily Reading Shortcuts */}
          <div className="pt-5">
            <p className="text-[11px] uppercase tracking-wider text-stone-300/90 font-medium mb-2.5">
              Surat &amp; Bacaan Pilihan
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scroll">
              {contextInfo.shortcuts.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl border text-xs transition-colors shrink-0 flex items-center gap-2 ${
                    item.featured
                      ? "bg-[#F7F4EC] text-[#1B4332] border-transparent font-semibold"
                      : "bg-white/10 hover:bg-white/15 text-stone-100 border-white/10"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] ${
                      item.featured ? "text-emerald-800/80" : "text-stone-300"
                    }`}
                  >
                    • {item.note}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 2. AYAT HARI INI — EDITORIAL QUOTATION CARD */}
        <section
          aria-label="Ayat Hari Ini"
          className="surface-card rounded-3xl p-5 sm:p-7 border border-theme relative"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-theme">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest ink-brass">
                Renungan Hari Ini
              </span>
              <span className="ink-muted text-xs">•</span>
              <Link
                href={`/surat/${dailyVerse?.suratNomor}?ayat=${dailyVerse?.nomorAyat}#ayat-${dailyVerse?.nomorAyat}`}
                className="text-xs font-semibold ink-primary hover:text-emerald-700 hover:underline transition-colors"
              >
                QS. {dailyVerse?.suratNamaLatin} : Ayat {dailyVerse?.nomorAyat}
              </Link>
            </div>

            <button
              type="button"
              onClick={handleShuffleDailyVerse}
              className="inline-flex items-center gap-1.5 text-xs font-medium ink-muted hover:ink-primary transition-colors cursor-pointer"
              title="Tampilkan ayat renungan lain"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Ayat Lain</span>
            </button>
          </div>

          <div className="py-5 space-y-3.5">
            <p className="font-arabic text-2xl sm:text-[32px] ink-arabic leading-[2.4]">
              {dailyVerse?.teksArab}
              <span className="ayat-end-ornament">{formatAyatMarker(dailyVerse?.nomorAyat)}</span>
            </p>

            {dailyVerse?.teksLatin && (
              <p className="text-xs sm:text-sm ink-brass italic leading-relaxed">
                {dailyVerse.teksLatin}
              </p>
            )}

            <blockquote className="pl-3.5 border-l-2 border-[#9A7B4F]/60 text-xs sm:text-sm ink-secondary leading-relaxed">
              &quot;{dailyVerse?.teksIndonesia}&quot;
            </blockquote>
          </div>

          <div className="pt-4 border-t border-theme flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenDailyReflection}
              className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#245640] text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>Tafsir &amp; Tadabbur</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStoryModalOpen(true)}
              className="px-4 py-2 rounded-xl surface-elevated hover:border-[var(--border-strong)] border border-theme ink-primary text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Buat Kartu Ayat</span>
            </button>

            <Link
              href={`/surat/${dailyVerse?.suratNomor}?ayat=${dailyVerse?.nomorAyat}#ayat-${dailyVerse?.nomorAyat}`}
              className="ml-auto text-xs font-medium ink-muted hover:ink-primary inline-flex items-center gap-1 transition-colors"
            >
              <span>Baca dalam surat</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* 3. SEARCH, LIFE TOPICS & SURAH FILTER */}
        <section id="daftar-surat" className="space-y-4">
          {/* Mobile Search Input */}
          <div className="relative md:hidden">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ink-muted pointer-events-none" />
            <input
              type="search"
              aria-label="Cari surat, nomor ayat, atau topik"
              placeholder="Cari surat, 2:255, atau topik (sabar, rezeki)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-10 pr-8 py-2.5 rounded-xl surface-card border border-theme ink-primary placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 ink-muted p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Curated Topic Explorer Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scroll">
            <span className="text-[11px] font-medium ink-muted shrink-0 flex items-center gap-1 pr-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Topik:</span>
            </span>
            {QUICK_LIFE_TOPICS.map((topic) => {
              const active = searchQuery.toLowerCase() === topic.query.toLowerCase();
              return (
                <button
                  key={topic.query}
                  type="button"
                  onClick={() => setSearchQuery(active ? "" : topic.query)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-colors cursor-pointer ${
                    active
                      ? "bg-[#1B4332] text-white border-[#1B4332] font-medium"
                      : "surface-card border-theme ink-secondary hover:border-[var(--brand-brass)]"
                  }`}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>

          {/* Smart Reference Match Panel (Surat:Ayat or Thematic) */}
          {searchQuery.trim().length > 0 &&
            (smartResults.patternResult || smartResults.thematicResults.length > 0) && (
              <div className="p-4 rounded-2xl surface-brass-soft border border-theme space-y-2.5 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold ink-primary flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 ink-brass" />
                    <span>Rujukan Ayat Terkait</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[11px] ink-muted hover:ink-primary cursor-pointer"
                  >
                    Bersihkan
                  </button>
                </div>

                {smartResults.patternResult && (
                  <div className="surface-card p-3 rounded-xl border border-theme flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold ink-primary">
                        {smartResults.patternResult.label}
                      </h3>
                      <p className="text-[11px] ink-muted">
                        Buka langsung Surat {smartResults.patternResult.suratNamaLatin} ayat{" "}
                        {smartResults.patternResult.nomorAyat}
                      </p>
                    </div>
                    <Link
                      href={`/surat/${smartResults.patternResult.suratNomor}?ayat=${smartResults.patternResult.nomorAyat}#ayat-${smartResults.patternResult.nomorAyat}`}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#245640] text-white text-xs font-medium inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Buka Ayat</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                {smartResults.thematicResults.map((t) => (
                  <div
                    key={t.id}
                    className="surface-card p-3 rounded-xl border border-theme flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs ink-primary">{t.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded surface-elevated ink-brass font-medium border border-theme">
                          QS. {t.suratNamaLatin} : {t.ayatRange}
                        </span>
                      </div>
                      <p className="text-[11px] ink-secondary mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                    <Link
                      href={`/surat/${t.suratNomor}?ayat=${t.nomorAyat}#ayat-${t.nomorAyat}`}
                      className="px-3 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#245640] text-white text-xs font-medium inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Buka</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}

          {/* Category Filter Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll">
              {[
                { id: "all", label: "Semua Surat (114)" },
                { id: "juz_amma", label: "Juz 'Amma" },
                { id: "makkiyyah", label: "Makkiyyah" },
                { id: "madaniyyah", label: "Madaniyyah" },
                ...(memorizingSurahCount > 0
                  ? [{ id: "memorizing", label: `Sedang Dihafal (${memorizingSurahCount})` }]
                  : []),
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCategory(pill.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
                    category === pill.id
                      ? "bg-[#1B4332] text-white border-[#1B4332]"
                      : "surface-card ink-secondary border-theme hover:ink-primary"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <span className="text-xs ink-muted hidden sm:block whitespace-nowrap tabular-nums">
              {filteredSurat.length} Surat
            </span>
          </div>

          {/* 4. SURAH GRID */}
          {filteredSurat.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSurat.map((surat) => (
                <SuratCard
                  key={surat.nomor}
                  surat={surat}
                  memorizeStats={memorizeMap[surat.nomor]}
                  onQuickAction={(action) => {
                    if (action === "listen") handleQuickPlay(surat);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 surface-card rounded-2xl border border-theme p-6">
              <Search className="w-5 h-5 mx-auto mb-2 ink-muted" />
              <h3 className="font-semibold ink-primary text-sm">Surat tidak ditemukan</h3>
              <p className="text-xs ink-muted mt-1">
                Tidak ada surat yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategory("all");
                }}
                className="mt-3 px-3.5 py-1.5 rounded-xl surface-elevated border border-theme text-xs ink-primary font-medium cursor-pointer"
              >
                Tampilkan Semua Surat
              </button>
            </div>
          )}
        </section>

        <Footer />
      </main>

      {/* Sticky Audio Bar */}
      <AudioPlayerBar
        currentTrack={currentTrack}
        playlist={transferredPlaylist}
        currentIndex={transferredIndex}
        onTrackChange={(newIdx) => {
          if (transferredPlaylist && transferredPlaylist[newIdx]) {
            setTransferredIndex(newIdx);
            const ayat = transferredPlaylist[newIdx];
            const audioUrl = ayat.audio?.[reciterKey] || Object.values(ayat.audio || {})[0];
            setCurrentTrack((prev) => ({
              ...prev,
              audioUrl,
              ayatNomor: ayat.nomorAyat,
              teksArab: ayat.teksArab,
              teksIndonesia: ayat.teksIndonesia,
              teksLatin: ayat.teksLatin,
              title: prev?.suratNamaLatin
                ? `QS. ${prev.suratNamaLatin} : Ayat ${ayat.nomorAyat}`
                : prev?.title,
            }));
          }
        }}
        onClose={() => {
          setCurrentTrack(null);
          setCurrentPlayingSuratNomor(null);
          setTransferredPlaylist(null);
          setTransferredIndex(null);
        }}
        reciterKey={reciterKey}
        setReciterKey={setReciterKey}
        repeatCount={repeatCount}
        setRepeatCount={setRepeatCount}
        onNext={handleNextSuratHome}
        onPrev={handlePrevSuratHome}
      />

      <ReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        ayatData={reflectionAyat}
      />

      <VerseStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        verseData={dailyVerse}
      />

      <BottomNav
        activeTab={activeBottomTab}
        setActiveTab={handleBottomNavChange}
        items={homeBottomTabs}
      />
    </div>
  );
}
