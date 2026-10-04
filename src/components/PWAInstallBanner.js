"use client";

import React, { useState, useEffect } from "react";
import { Download, WifiOff, X, Share } from "lucide-react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check standalone mode
    const standaloneCheck =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standaloneCheck);

    // Check if dismissed before
    const dismissed = sessionStorage.getItem("pwa_prompt_dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }

    // Check iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Online / Offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSPrompt(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
  };

  // If running as standalone app, only show offline banner if disconnected
  if (isStandalone) {
    if (!isOffline) return null;
    return (
      <div className="bg-amber-600/90 text-white text-xs px-3 py-1.5 flex items-center justify-center gap-2 backdrop-blur-md sticky top-0 z-50 animate-fade-in shadow-xs">
        <WifiOff className="w-3.5 h-3.5 animate-pulse" />
        <span>Mode Offline Aktif — Anda tetap bisa membaca ayat dari memori lokal.</span>
      </div>
    );
  }

  return (
    <>
      {/* Offline Toast */}
      {isOffline && (
        <div className="bg-amber-600/95 text-white text-xs px-3 py-2 flex items-center justify-center gap-2 backdrop-blur-md sticky top-0 z-50 animate-fade-in shadow-sm">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Mode Offline — Koneksi internet terputus. Membaca dari data cache lokal.</span>
        </div>
      )}

      {/* Install Prompt Banner (if available and not dismissed) */}
      {!isDismissed && (deferredPrompt || (isIOS && !showIOSPrompt)) && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white px-4 py-2.5 shadow-md text-xs relative z-40 border-b border-emerald-700/50">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="font-semibold text-white tracking-wide">
                  Pasang Qur&apos;an App di Layar Utama
                </p>
                <p className="text-[11px] text-emerald-200/80">
                  Akses lebih cepat dan baca offline tanpa kuota internet.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-emerald-950 font-bold rounded-lg transition-all shadow-xs"
              >
                {isIOS ? "Cara Pasang" : "Install"}
              </button>
              <button
                onClick={handleDismiss}
                aria-label="Tutup saran instalasi"
                className="p-1 text-emerald-300 hover:text-white rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-stone-800 shadow-2xl border border-stone-200 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-stone-900 text-base">Pasang di iPhone / iPad</h3>
              <button
                onClick={() => setShowIOSPrompt(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Safari di iOS tidak mendukung tombol install otomatis langsung. Ikuti 2 langkah mudah ini:
            </p>
            <ol className="text-xs text-stone-700 space-y-3 mb-5">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <span>
                  Tekan ikon <strong>Bagikan / Share</strong> (<Share className="w-3.5 h-3.5 inline text-emerald-600 mx-0.5" />) di bilah bawah browser Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <span>
                  Gulir ke bawah dan pilih <strong>&quot;Tambah ke Layar Utama&quot;</strong> (<em>Add to Home Screen</em>).
                </span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
