"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, WifiOff, X, Share } from "lucide-react";
import { attachDialogOutsideClickFallback } from "@/utils/quranStorage";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const iosDialogRef = useRef(null);

  useEffect(() => {
    const standaloneCheck =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standaloneCheck);

    const dismissed = sessionStorage.getItem("pwa_prompt_dismissed");
    if (dismissed) setIsDismissed(true);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

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

  useEffect(() => {
    const dialog = iosDialogRef.current;
    if (!dialog) return;
    if (showIOSPrompt) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [showIOSPrompt]);

  useEffect(() => {
    const dialog = iosDialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      dialog.returnValue = "";
      setShowIOSPrompt(false);
    };
    dialog.addEventListener("close", onClose);
    const detach = attachDialogOutsideClickFallback(dialog, () => setShowIOSPrompt(false));
    return () => {
      dialog.removeEventListener("close", onClose);
      detach();
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) setShowIOSPrompt(true);
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

  if (isStandalone) {
    if (!isOffline) return null;
    return (
      <div className="bg-amber-800 text-amber-50 text-xs px-3 py-1.5 flex items-center justify-center gap-2 sticky top-0 z-50">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Mode Offline — Surat yang pernah dibuka tetap dapat dibaca dari penyimpanan lokal.</span>
      </div>
    );
  }

  return (
    <>
      {isOffline && (
        <div className="bg-amber-800 text-amber-50 text-xs px-3 py-2 flex items-center justify-center gap-2 sticky top-0 z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Sedang offline — Menampilkan data bacaan yang tersimpan di perangkat.</span>
        </div>
      )}

      {!isDismissed && (deferredPrompt || (isIOS && !showIOSPrompt)) && (
        <div className="bg-[#1B4332] text-stone-100 px-4 py-2.5 text-xs relative z-40 border-b border-white/10">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-300 shrink-0" />
              <p className="text-stone-100 leading-snug">
                <strong className="font-semibold">Pasang di Layar Utama</strong>{" "}
                <span className="text-stone-300 hidden sm:inline">
                  untuk membuka mushaf lebih cepat dan membaca surat secara offline.
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1 bg-white text-[#1B4332] hover:bg-stone-100 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {isIOS ? "Cara Pasang" : "Pasang"}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Tutup pemberitahuan pemasangan"
                className="p-1 text-stone-300 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <dialog
        ref={iosDialogRef}
        closedby="any"
        aria-labelledby="ios-install-title"
        className="app-modal p-4 w-full max-w-sm"
      >
        <div className="surface-card rounded-2xl w-full p-5 shadow-2xl border border-theme">
          <div className="flex items-center justify-between mb-3">
            <h2 id="ios-install-title" className="font-editorial font-semibold ink-primary text-base">
              Pasang di iPhone / iPad
            </h2>
            <button
              type="button"
              onClick={() => setShowIOSPrompt(false)}
              aria-label="Tutup panduan"
              className="p-1 ink-muted hover:ink-primary rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs ink-secondary mb-4 leading-relaxed">
            Di Safari iOS, tambahkan halaman ini ke layar utama melalui dua langkah berikut:
          </p>
          <ol className="text-xs ink-primary space-y-3 mb-5">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full surface-accent-soft text-emerald-800 font-semibold flex items-center justify-center text-[10px] shrink-0">
                1
              </span>
              <span>
                Tekan tombol <strong>Bagikan</strong> (
                <Share className="w-3.5 h-3.5 inline text-emerald-700 mx-0.5" />) pada bilah Safari.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full surface-accent-soft text-emerald-800 font-semibold flex items-center justify-center text-[10px] shrink-0">
                2
              </span>
              <span>
                Pilih <strong>&quot;Tambah ke Layar Utama&quot;</strong> (<em>Add to Home Screen</em>).
              </span>
            </li>
          </ol>
          <button
            type="button"
            onClick={() => setShowIOSPrompt(false)}
            className="w-full py-2.5 bg-[#1B4332] hover:bg-[#245640] text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Mengerti
          </button>
        </div>
      </dialog>
    </>
  );
}
