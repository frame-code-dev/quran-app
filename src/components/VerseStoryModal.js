"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Eye,
  Type,
  BookOpen,
  Palette,
} from "lucide-react";
import { formatAyatMarker, attachDialogOutsideClickFallback } from "@/utils/quranStorage";

export const STORY_THEMES = [
  {
    id: "mushaf",
    name: "Kertas Mushaf",
    description: "Gading klasik dengan bingkai hijau zaitun",
    bgClass: "bg-[#F7F3E8] text-stone-900",
    canvas: {
      bgGradient: ["#FAF7EE", "#F6F1E4", "#EFE8D6"],
      border: "rgba(27, 67, 50, 0.35)",
      badgeBg: "rgba(27, 67, 50, 0.08)",
      badgeBorder: "rgba(27, 67, 50, 0.3)",
      badgeText: "#1B4332",
      accent: "#9A7B4F",
      arabic: "#14221B",
      latin: "#6B655E",
      translation: "#292524",
      brand: "#1B4332",
    },
    chipColor: "bg-[#F6F1E4] border-emerald-800",
  },
  {
    id: "emerald",
    name: "Zamrud Teduh",
    description: "Hijau zamrud pekat dengan aksen kuningan lembut",
    bgClass: "bg-gradient-to-b from-[#0E2A1F] via-[#153B2B] to-[#0B2118] text-stone-100",
    canvas: {
      bgGradient: ["#0E2A1F", "#153B2B", "#0B2118"],
      border: "rgba(200, 169, 120, 0.35)",
      badgeBg: "rgba(200, 169, 120, 0.14)",
      badgeBorder: "rgba(200, 169, 120, 0.45)",
      badgeText: "#E2C999",
      accent: "#D4B680",
      arabic: "#F7F4EC",
      latin: "#A3CFBB",
      translation: "#E2E8E4",
      brand: "#A3CFBB",
    },
    chipColor: "bg-[#153B2B] border-amber-400",
  },
  {
    id: "midnight",
    name: "Malam Lail",
    description: "Kelam tenang dengan tipografi gading",
    bgClass: "bg-gradient-to-b from-[#101513] via-[#161E1B] to-[#0D110F] text-stone-100",
    canvas: {
      bgGradient: ["#101513", "#161E1B", "#0D110F"],
      border: "rgba(163, 207, 187, 0.25)",
      badgeBg: "rgba(163, 207, 187, 0.1)",
      badgeBorder: "rgba(163, 207, 187, 0.35)",
      badgeText: "#A3CFBB",
      accent: "#C8A978",
      arabic: "#F4F1EA",
      latin: "#9CA69F",
      translation: "#D6D3CB",
      brand: "#9CA69F",
    },
    chipColor: "bg-[#161E1B] border-stone-500",
  },
  {
    id: "sand",
    name: "Pasir Hangat",
    description: "Nuansa krem hangat dengan tinta gelap",
    bgClass: "bg-gradient-to-b from-[#FAF8F5] via-[#F3ECE3] to-[#EBE1D4] text-stone-800",
    canvas: {
      bgGradient: ["#FAF8F5", "#F3ECE3", "#EBE1D4"],
      border: "rgba(154, 123, 79, 0.38)",
      badgeBg: "rgba(154, 123, 79, 0.12)",
      badgeBorder: "rgba(154, 123, 79, 0.42)",
      badgeText: "#7C5C2E",
      accent: "#9A7B4F",
      arabic: "#1C1917",
      latin: "#2D6A4F",
      translation: "#44403C",
      brand: "#78716C",
    },
    chipColor: "bg-[#F3ECE3] border-amber-700",
  },
];

export default function VerseStoryModal({ isOpen, onClose, verseData }) {
  const [selectedThemeId, setSelectedThemeId] = useState("mushaf");
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [arabicFontSize, setArabicFontSize] = useState("normal");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const canvasRef = useRef(null);
  const dialogRef = useRef(null);
  const selectedTheme = STORY_THEMES.find((t) => t.id === selectedThemeId) || STORY_THEMES[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && verseData) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, verseData]);

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

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0] || "";
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawStoryToCanvas = useCallback(async () => {
    if (!canvasRef.current || !verseData) return null;
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts.ready;
    }

    const canvas = canvasRef.current;
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const theme = selectedTheme.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;

    // 1. Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, theme.bgGradient[0]);
    bgGrad.addColorStop(0.5, theme.bgGradient[1]);
    bgGrad.addColorStop(1, theme.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Classic Mushaf Double Frame
    const margin = 58;
    ctx.save();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 14, margin + 14, width - (margin + 14) * 2, height - (margin + 14) * 2);
    ctx.restore();

    // 3. Top Header Badge
    let currentY = 175;
    const badgeText = `QS. ${verseData.suratNamaLatin || "Al-Qur'an"} : ${verseData.nomorAyat || 1}`;
    ctx.font = "600 26px 'Plus Jakarta Sans', sans-serif";
    const badgeWidth = ctx.measureText(badgeText).width + 64;
    const badgeHeight = 56;
    const badgeX = centerX - badgeWidth / 2;

    ctx.fillStyle = theme.badgeBg;
    ctx.beginPath();
    ctx.roundRect(badgeX, currentY, badgeWidth, badgeHeight, 28);
    ctx.fill();
    ctx.strokeStyle = theme.badgeBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = theme.badgeText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, centerX, currentY + badgeHeight / 2);

    // 4. Bismillah accent
    currentY += 135;
    ctx.font = "400 38px 'Amiri', serif";
    ctx.fillStyle = theme.accent;
    ctx.fillText("بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ", centerX, currentY);

    currentY += 46;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(centerX - 130, currentY);
    ctx.lineTo(centerX + 130, currentY);
    ctx.stroke();

    // 5. Arabic Text (Regular 400 weight for crisp diacritics)
    const contentMaxWidth = width - 210;
    const arabTextWithMarker = `${verseData.teksArab || ""} ${formatAyatMarker(verseData.nomorAyat)}`;
    const isLongVerse = arabTextWithMarker.length > 180;
    const arabBaseSize = arabicFontSize === "large" ? (isLongVerse ? 44 : 58) : isLongVerse ? 38 : 50;

    ctx.font = `400 ${arabBaseSize}px 'Amiri', 'Traditional Arabic', serif`;
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const arabLines = wrapText(ctx, arabTextWithMarker, contentMaxWidth);
    const arabLineHeight = arabBaseSize * 2.05;

    currentY += 95;
    ctx.fillStyle = theme.arabic;
    for (let i = 0; i < arabLines.length; i++) {
      ctx.fillText(arabLines[i], centerX, currentY + i * arabLineHeight);
    }
    currentY += arabLines.length * arabLineHeight + 24;
    ctx.direction = "ltr";

    // 6. Transliteration
    if (showLatin && verseData.teksLatin) {
      currentY += 12;
      ctx.font = "italic 25px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = theme.latin;
      const latinLines = wrapText(ctx, verseData.teksLatin, contentMaxWidth - 40);
      for (let i = 0; i < latinLines.length; i++) {
        ctx.fillText(latinLines[i], centerX, currentY + i * 38);
      }
      currentY += latinLines.length * 38 + 20;
    }

    // 7. Divider
    currentY += 20;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 90, currentY);
    ctx.lineTo(centerX + 90, currentY);
    ctx.stroke();

    // 8. Translation
    if (showTranslation && verseData.teksIndonesia) {
      currentY += 54;
      ctx.font = "400 27px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = theme.translation;
      const transLines = wrapText(ctx, `"${verseData.teksIndonesia}"`, contentMaxWidth - 40);
      for (let i = 0; i < transLines.length; i++) {
        ctx.fillText(transLines[i], centerX, currentY + i * 44);
      }
    }

    // 9. Restrained Editorial Footer
    const footerY = height - 130;
    ctx.font = "600 24px 'Lora', Georgia, serif";
    ctx.fillStyle = theme.accent;
    ctx.fillText("Al-Qur'an Al-Karim", centerX, footerY);

    ctx.font = "400 18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = theme.brand;
    ctx.fillText("Tilawah • Tafsir • Muraja'ah", centerX, footerY + 34);

    return canvas;
  }, [selectedTheme, verseData, showLatin, showTranslation, arabicFontSize]);

  const handleDownloadImage = async () => {
    try {
      setIsExporting(true);
      const canvas = await drawStoryToCanvas();
      if (!canvas) return;
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `kartu-ayat-${verseData?.suratNamaLatin || "quran"}-${verseData?.nomorAyat || 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Gagal mengunduh gambar:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFallbackShare = (shareText, canvas) => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `kartu-ayat-${verseData?.suratNamaLatin}-${verseData?.nomorAyat}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  const handleShare = async () => {
    try {
      setIsExporting(true);
      const canvas = await drawStoryToCanvas();
      if (!canvas) return;

      const shareText = `QS. ${verseData.suratNamaLatin} : ${verseData.nomorAyat}\n\n"${verseData.teksIndonesia}"`;

      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File(
            [blob],
            `kartu-ayat-${verseData.suratNamaLatin}-${verseData.nomorAyat}.png`,
            { type: "image/png" }
          );
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: `QS. ${verseData.suratNamaLatin} : ${verseData.nomorAyat}`,
                text: shareText,
                files: [file],
              });
              setShareSuccess(true);
              setTimeout(() => setShareSuccess(false), 2500);
              return;
            } catch (err) {
              if (err.name !== "AbortError") console.warn(err);
            }
          }
          handleFallbackShare(shareText, canvas);
        }, "image/png");
      } else {
        handleFallbackShare(shareText, canvas);
      }
    } catch (e) {
      console.error("Gagal membagikan kartu ayat:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCaption = () => {
    if (!verseData) return;
    const text = `QS. ${verseData.suratNamaLatin} : ${verseData.nomorAyat}\n\n${verseData.teksArab}\n\n"${verseData.teksIndonesia}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="story-modal-title"
      className="app-modal p-3 sm:p-4 w-full max-w-4xl"
    >
      {verseData && (
        <div className="surface-card rounded-3xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-theme overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-theme flex items-center justify-between surface-elevated">
            <div>
              <h2
                id="story-modal-title"
                className="font-editorial font-semibold ink-primary text-base sm:text-lg"
              >
                Buat Kartu Ayat (9:16)
              </h2>
              <p className="text-xs ink-muted">
                QS. {verseData.suratNamaLatin} : Ayat {verseData.nomorAyat}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pembuat kartu ayat"
              className="w-8 h-8 rounded-full hover:bg-black/5 ink-muted hover:ink-primary flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Split Body */}
          <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Live 9:16 Card Preview */}
            <div className="md:col-span-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-[260px] sm:max-w-[290px] aspect-[9/16] rounded-3xl shadow-lg border border-theme relative overflow-hidden">
                <div
                  className={`absolute inset-0 p-5 flex flex-col justify-between transition-colors duration-300 ${selectedTheme.bgClass}`}
                >
                  <div className="border border-current/20 rounded-2xl h-full p-4 flex flex-col justify-between">
                    <div className="text-center space-y-1.5 pt-1">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold border border-current/25">
                        QS. {verseData.suratNamaLatin} : {verseData.nomorAyat}
                      </span>
                      <p className="font-arabic text-xs opacity-75 pt-1 text-center">
                        بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                      </p>
                    </div>

                    <div className="my-auto py-2 text-center space-y-2.5 overflow-hidden">
                      <p
                        dir="rtl"
                        className={`font-arabic text-center leading-loose px-1 ${
                          arabicFontSize === "large" ? "text-xl" : "text-lg"
                        }`}
                      >
                        {verseData.teksArab} {formatAyatMarker(verseData.nomorAyat)}
                      </p>

                      {showLatin && verseData.teksLatin && (
                        <p className="text-[10px] italic opacity-75 leading-snug line-clamp-3">
                          {verseData.teksLatin}
                        </p>
                      )}

                      <div className="w-12 h-px mx-auto bg-current opacity-25" />

                      {showTranslation && verseData.teksIndonesia && (
                        <p className="text-[10px] sm:text-[11px] leading-relaxed opacity-90 line-clamp-5">
                          &quot;{verseData.teksIndonesia}&quot;
                        </p>
                      )}
                    </div>

                    <div className="text-center pt-2 border-t border-current/15">
                      <p className="font-editorial text-[10px] font-semibold">
                        Al-Qur&apos;an Al-Karim
                      </p>
                      <p className="text-[8px] opacity-65">Tilawah • Tafsir • Muraja&apos;ah</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] ink-muted mt-2.5 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Pratinjau rasio 9:16 (1080 × 1920 px)</span>
              </p>
            </div>

            {/* Right: Controls */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <p className="text-xs font-semibold ink-primary flex items-center gap-1.5 mb-2.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tema Visual</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STORY_THEMES.map((theme) => {
                    const isSelected = theme.id === selectedThemeId;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedThemeId(theme.id)}
                        className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? "border-[#1B4332] surface-accent-soft ring-1 ring-[#1B4332]/30"
                            : "border-theme surface-card hover:border-[var(--border-strong)]"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full shrink-0 border ${theme.chipColor}`}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold ink-primary block truncate">
                            {theme.name}
                          </span>
                          <span className="text-[10px] ink-muted block truncate">
                            {theme.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl surface-elevated border border-theme">
                <p className="text-xs font-semibold ink-primary flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Isi Kartu</span>
                </p>

                <label className="flex items-center justify-between p-2.5 rounded-xl surface-card border border-theme cursor-pointer">
                  <span className="text-xs font-medium ink-primary flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 ink-muted" />
                    Terjemahan Indonesia
                  </span>
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                    className="w-4 h-4 accent-[#1B4332] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl surface-card border border-theme cursor-pointer">
                  <span className="text-xs font-medium ink-primary flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 ink-muted" />
                    Transliterasi Latin
                  </span>
                  <input
                    type="checkbox"
                    checked={showLatin}
                    onChange={(e) => setShowLatin(e.target.checked)}
                    className="w-4 h-4 accent-[#1B4332] rounded cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between p-2.5 rounded-xl surface-card border border-theme">
                  <span className="text-xs font-medium ink-primary">Ukuran Teks Arab</span>
                  <div className="flex items-center gap-1 surface-elevated p-0.5 rounded-lg">
                    {[
                      { id: "normal", label: "Sedang" },
                      { id: "large", label: "Besar" },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setArabicFontSize(sz.id)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                          arabicFontSize === sz.id
                            ? "bg-[#1B4332] text-white"
                            : "ink-muted hover:ink-primary"
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isExporting}
                  className="w-full py-3 px-4 rounded-xl bg-[#1B4332] hover:bg-[#245640] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {shareSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Kartu Siap Dibagikan</span>
                    </>
                  ) : isExporting ? (
                    <span>Menyiapkan gambar...</span>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Bagikan ke WhatsApp / Story</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={isExporting}
                    className="py-2.5 px-3 rounded-xl surface-card border border-theme hover:border-[var(--border-strong)] ink-primary font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Unduh PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="py-2.5 px-3 rounded-xl surface-card border border-theme hover:border-[var(--border-strong)] ink-primary font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                </div>
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </dialog>
  );
}
