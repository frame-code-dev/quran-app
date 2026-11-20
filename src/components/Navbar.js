"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Bookmark,
  BookMarked,
  PenLine,
  Trash2,
  ArrowUpRight,
  Sun,
  Moon,
  BookOpenText,
  Monitor,
} from "lucide-react";
import {
  getLastRead,
  getBookmarks,
  removeBookmark,
  getAllNotes,
  getReadingTheme,
  applyReadingTheme,
  attachDialogOutsideClickFallback,
} from "@/utils/quranStorage";

export default function Navbar({
  searchQuery,
  setSearchQuery,
  externalDrawerOpen,
  setExternalDrawerOpen,
}) {
  const [lastRead, setLastRead] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [readingTheme, setReadingTheme] = useState("system");
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("bookmarks"); // 'bookmarks' | 'notes' | 'appearance'

  const dialogRef = useRef(null);
  const isDrawerOpen =
    externalDrawerOpen !== undefined ? externalDrawerOpen : internalDrawerOpen;
  const setIsDrawerOpen = setExternalDrawerOpen || setInternalDrawerOpen;

  const syncData = () => {
    setLastRead(getLastRead());
    setBookmarks(getBookmarks());
    setNotes(getAllNotes());
    setReadingTheme(getReadingTheme());
  };

  useEffect(() => {
    syncData();
    const handleUpdate = () => syncData();
    const handleStorage = (e) => {
      if (e.key === "quran_reading_theme") {
        const next = getReadingTheme();
        applyReadingTheme(next);
      }
      syncData();
    };
    window.addEventListener("quran-storage-update", handleUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("quran-storage-update", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isDrawerOpen) {
      syncData();
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      dialog.returnValue = "";
      setIsDrawerOpen(false);
    };
    dialog.addEventListener("close", handleClose);
    const detachFallback = attachDialogOutsideClickFallback(dialog, () =>
      setIsDrawerOpen(false)
    );
    return () => {
      dialog.removeEventListener("close", handleClose);
      detachFallback();
    };
  }, [setIsDrawerOpen]);

  const handleSelectTheme = (nextTheme) => {
    setReadingTheme(nextTheme);
    applyReadingTheme(nextTheme);
  };

  const savedCount = bookmarks.length + notes.length;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-theme backdrop-blur-md transition-colors duration-200 bg-[var(--bg-canvas)]/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Editorial Brand Masthead */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors"
              style={{
                backgroundColor: "var(--brand-forest)",
                borderColor: "var(--brand-forest)",
                color: "#FAF8F2",
              }}
              aria-hidden="true"
            >
              {/* Clean geometric Rub el Hizb octagonal mark */}
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="5" y="5" width="14" height="14" rx="1.5" />
                <rect x="5" y="5" width="14" height="14" rx="1.5" transform="rotate(45 12 12)" />
                <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="font-editorial font-semibold text-base sm:text-lg tracking-tight ink-primary block">
                Al-Qur&apos;an
              </span>
              <span className="text-[11px] ink-muted hidden sm:block tracking-wide">
                Tilawah • Tafsir • Muraja&apos;ah
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar (Home) */}
          {setSearchQuery !== undefined && (
            <div className="flex-1 max-w-sm relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ink-muted pointer-events-none" />
              <input
                type="search"
                aria-label="Cari surat, nomor ayat, atau topik"
                placeholder="Cari surat, 2:255, atau topik (sabar, rezeki)..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-10 pr-8 py-2 rounded-xl surface-card border border-theme ink-primary placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 ink-muted hover:ink-primary p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Right Tools: Last Read & Koleksi Tersimpan */}
          <div className="flex items-center gap-2 shrink-0">
            {lastRead && (
              <Link
                href={`/surat/${lastRead.nomor}?ayat=${lastRead.ayat || 1}#ayat-${lastRead.ayat || 1}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl surface-brass-soft border border-theme ink-primary hover:border-[var(--brand-brass)] transition-colors"
                title={`Lanjutkan bacaan: QS. ${lastRead.namaLatin} Ayat ${lastRead.ayat || 1}`}
              >
                <Bookmark className="w-3.5 h-3.5 ink-brass fill-current shrink-0" />
                <span className="hidden sm:inline truncate max-w-[130px]">
                  {lastRead.namaLatin}: {lastRead.ayat || 1}
                </span>
                <span className="sm:hidden text-[11px] font-semibold">
                  Ayat {lastRead.ayat || 1}
                </span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl surface-card border border-theme ink-primary hover:border-[var(--border-strong)] transition-colors cursor-pointer"
              aria-label="Buka koleksi tersimpan dan preferensi baca"
            >
              <BookMarked className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Koleksi</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold surface-accent-soft text-emerald-800 dark:text-emerald-300">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Native <dialog> Drawer: Koleksi Ayat, Catatan Hati & Preferensi Tampilan */}
      <dialog
        ref={dialogRef}
        closedby="any"
        aria-labelledby="koleksi-drawer-title"
        className="app-drawer"
      >
        <div className="w-full sm:max-w-md h-[84dvh] sm:h-full surface-card border-t sm:border-t-0 sm:border-l border-theme rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col overflow-hidden">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-theme flex items-center justify-between surface-elevated">
            <div>
              <h2
                id="koleksi-drawer-title"
                className="font-editorial font-semibold text-base ink-primary"
              >
                Ruang Pribadi &amp; Tampilan
              </h2>
              <p className="text-xs ink-muted">
                Ayat tersimpan, catatan hati, dan kenyamanan baca
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Tutup panel"
              className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center ink-muted hover:ink-primary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Tabs */}
          <div className="px-4 pt-3 pb-2 border-b border-theme flex gap-1.5">
            {[
              { id: "bookmarks", label: `Tersimpan (${bookmarks.length})`, icon: BookMarked },
              { id: "notes", label: `Catatan (${notes.length})`, icon: PenLine },
              { id: "appearance", label: "Tampilan", icon: BookOpenText },
            ].map((t) => {
              const Icon = t.icon;
              const active = drawerTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDrawerTab(t.id)}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    active
                      ? "bg-[#1B4332] text-white"
                      : "surface-elevated ink-secondary hover:ink-primary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
            {/* TAB 1: BOOKMARKS */}
            {drawerTab === "bookmarks" && (
              <>
                {lastRead && (
                  <Link
                    href={`/surat/${lastRead.nomor}?ayat=${lastRead.ayat || 1}#ayat-${lastRead.ayat || 1}`}
                    onClick={() => setIsDrawerOpen(false)}
                    className="block p-3.5 rounded-2xl surface-brass-soft border border-theme hover:border-[var(--brand-brass)] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider ink-brass block">
                          Terakhir Dibaca
                        </span>
                        <p className="font-semibold text-sm ink-primary mt-0.5">
                          QS. {lastRead.namaLatin} : Ayat {lastRead.ayat || 1}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 ink-brass shrink-0" />
                    </div>
                  </Link>
                )}

                {bookmarks.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-2xl surface-elevated border border-theme">
                    <BookMarked className="w-6 h-6 mx-auto ink-muted mb-2" />
                    <p className="text-sm font-medium ink-primary">Belum ada ayat tersimpan</p>
                    <p className="text-xs ink-muted mt-1 leading-relaxed">
                      Tekan ikon simpan pada ayat mana pun saat membaca agar mudah ditemukan kembali.
                    </p>
                  </div>
                ) : (
                  bookmarks.map((item) => (
                    <div
                      key={`${item.suratNomor}:${item.nomorAyat}`}
                      className="p-3.5 rounded-2xl surface-card border border-theme space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/surat/${item.suratNomor}?ayat=${item.nomorAyat}#ayat-${item.nomorAyat}`}
                          onClick={() => setIsDrawerOpen(false)}
                          className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <span>
                            QS. {item.suratNamaLatin} : Ayat {item.nomorAyat}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeBookmark(item.suratNomor, item.nomorAyat)}
                          aria-label="Hapus dari tersimpan"
                          className="p-1 rounded-lg ink-muted hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.teksArab && (
                        <p className="font-arabic text-lg ink-arabic line-clamp-2">
                          {item.teksArab}
                        </p>
                      )}
                      {item.teksIndonesia && (
                        <p className="text-xs ink-secondary line-clamp-2 leading-relaxed">
                          &quot;{item.teksIndonesia}&quot;
                        </p>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {/* TAB 2: PERSONAL NOTES */}
            {drawerTab === "notes" && (
              <>
                {notes.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-2xl surface-elevated border border-theme">
                    <PenLine className="w-6 h-6 mx-auto ink-muted mb-2" />
                    <p className="text-sm font-medium ink-primary">Belum ada catatan tadabbur</p>
                    <p className="text-xs ink-muted mt-1 leading-relaxed">
                      Buka &quot;Tafsir &amp; Tadabbur&quot; pada ayat mana pun lalu pilih tab{" "}
                      <strong>Catatan Hati</strong> untuk menyimpan renungan pribadi Anda.
                    </p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <Link
                      key={note.key}
                      href={`/surat/${note.suratNomor}?ayat=${note.nomorAyat}#ayat-${note.nomorAyat}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="block p-3.5 rounded-2xl surface-card border border-theme hover:border-[var(--brand-brass)] transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-emerald-700">
                          QS. {note.suratNamaLatin || `Surat ${note.suratNomor}`} : Ayat {note.nomorAyat}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 ink-muted" />
                      </div>
                      <p className="text-xs ink-secondary whitespace-pre-line leading-relaxed line-clamp-4">
                        {note.text}
                      </p>
                    </Link>
                  ))
                )}
              </>
            )}

            {/* TAB 3: READING APPEARANCE */}
            {drawerTab === "appearance" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider ink-muted mb-2.5">
                    Tema Kertas Baca
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: "system",
                        label: "Ikuti Sistem",
                        desc: "Otomatis siang/malam",
                        icon: Monitor,
                      },
                      {
                        id: "mushaf",
                        label: "Kertas Mushaf",
                        desc: "Gading hangat teduh",
                        icon: BookOpenText,
                      },
                      {
                        id: "light",
                        label: "Terang Bersih",
                        desc: "Kontras kertas putih",
                        icon: Sun,
                      },
                      {
                        id: "dark",
                        label: "Malam Teduh",
                        desc: "Nyaman di ruang redup",
                        icon: Moon,
                      },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const active = readingTheme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectTheme(opt.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                            active
                              ? "border-[#1B4332] surface-accent-soft ring-1 ring-[#1B4332]/30"
                              : "border-theme surface-card hover:border-[var(--border-strong)]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-emerald-700" />
                            <span className="text-xs font-semibold ink-primary">{opt.label}</span>
                          </div>
                          <p className="text-[11px] ink-muted">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl surface-elevated border border-theme text-xs ink-secondary leading-relaxed">
                  Seluruh tanda bacaan terakhir, ayat tersimpan, progress hafalan, dan catatan hati
                  tersimpan langsung secara lokal di perangkat Anda tanpa perlu membuat akun.
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
