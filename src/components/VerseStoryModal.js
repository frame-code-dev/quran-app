"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Eye,
  Type,
  BookOpen,
  Palette,
} from "lucide-react";

// 5 Pilihan Tema Visual Story Estetik
export const STORY_THEMES = [
  {
    id: "emerald",
    name: "Emerald Royal",
    description: "Nuansa hijau zamrud mewah & aksen emas islami",
    bgClass: "bg-gradient-to-b from-[#092218] via-[#123D2B] to-[#0B251A] text-white",
    canvas: {
      bgGradient: ["#092218", "#123D2B", "#0B251A"],
      border: "rgba(212, 175, 55, 0.35)",
      badgeBg: "rgba(212, 175, 55, 0.15)",
      badgeBorder: "rgba(212, 175, 55, 0.5)",
      badgeText: "#E5C378",
      accent: "#E5C378",
      arabic: "#FFFFFF",
      latin: "#95D5B2",
      translation: "#D1E7DD",
      brand: "#A3CFBB",
      isDark: true,
    },
    chipColor: "bg-[#123D2B] border-emerald-500",
  },
  {
    id: "midnight",
    name: "Midnight Lail",
    description: "Hitam malam obsidian dengan kilau teal & perak",
    bgClass: "bg-gradient-to-b from-[#060A0E] via-[#0F172A] to-[#05080C] text-stone-100",
    canvas: {
      bgGradient: ["#060A0E", "#0F172A", "#05080C"],
      border: "rgba(52, 211, 153, 0.3)",
      badgeBg: "rgba(52, 211, 153, 0.12)",
      badgeBorder: "rgba(52, 211, 153, 0.4)",
      badgeText: "#34D399",
      accent: "#34D399",
      arabic: "#F8FAFC",
      latin: "#6EE7B7",
      translation: "#CBD5E1",
      brand: "#94A3B8",
      isDark: true,
    },
    chipColor: "bg-[#0F172A] border-teal-500",
  },
  {
    id: "sand",
    name: "Desert Noor",
    description: "Kehangatan pasir gading lembut dengan aksen zaitun",
    bgClass: "bg-gradient-to-b from-[#FAF8F5] via-[#F5EFEB] to-[#EFE7DE] text-stone-800",
    canvas: {
      bgGradient: ["#FAF8F5", "#F5EFEB", "#EFE7DE"],
      border: "rgba(179, 143, 92, 0.4)",
      badgeBg: "rgba(179, 143, 92, 0.15)",
      badgeBorder: "rgba(179, 143, 92, 0.5)",
      badgeText: "#8A642B",
      accent: "#B38F5C",
      arabic: "#1C1917",
      latin: "#2D6A4F",
      translation: "#44403C",
      brand: "#78716C",
      isDark: false,
    },
    chipColor: "bg-[#F5EFEB] border-amber-600",
  },
  {
    id: "mushaf",
    name: "Classic Mushaf",
    description: "Kertas Al-Qur'an klasik dengan bingkai ornamen hijau",
    bgClass: "bg-[#FCFAF5] text-stone-900",
    canvas: {
      bgGradient: ["#FCFAF5", "#F7F3E8", "#F2ECE0"],
      border: "rgba(27, 67, 50, 0.45)",
      badgeBg: "rgba(27, 67, 50, 0.08)",
      badgeBorder: "rgba(27, 67, 50, 0.35)",
      badgeText: "#1B4332",
      accent: "#1B4332",
      arabic: "#0D281E",
      latin: "#57534E",
      translation: "#292524",
      brand: "#1B4332",
      isDark: false,
    },
    chipColor: "bg-[#F7F3E8] border-emerald-700",
  },
  {
    id: "fajr",
    name: "Fajr Dawn",
    description: "Gradasi senja fajar lembut bernuansa spiritual",
    bgClass: "bg-gradient-to-b from-[#1E1B4B] via-[#352342] to-[#451A03] text-stone-100",
    canvas: {
      bgGradient: ["#1E1B4B", "#352342", "#451A03"],
      border: "rgba(253, 224, 71, 0.3)",
      badgeBg: "rgba(253, 224, 71, 0.12)",
      badgeBorder: "rgba(253, 224, 71, 0.4)",
      badgeText: "#FDE047",
      accent: "#FDE047",
      arabic: "#FFFBEB",
      latin: "#FDE68A",
      translation: "#FCE7F3",
      brand: "#FBCFE8",
      isDark: true,
    },
    chipColor: "bg-[#352342] border-pink-400",
  },
];

export default function VerseStoryModal({ isOpen, onClose, verseData }) {
  const [selectedThemeId, setSelectedThemeId] = useState("emerald");
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [arabicFontSize, setArabicFontSize] = useState("normal"); // 'normal' | 'large'
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const canvasRef = useRef(null);
  const selectedTheme = STORY_THEMES.find((t) => t.id === selectedThemeId) || STORY_THEMES[0];

  // Pastikan font Arabic 'Amiri' sudah termuat sempurna
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        // Font siap
      });
    }
  }, []);

  // Helper text wrapping untuk canvas HTML5
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
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  // Render Story Card ke Canvas 2D (Resolusi 1080x1920 Full HD 9:16)
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

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, theme.bgGradient[0]);
    bgGrad.addColorStop(0.5, theme.bgGradient[1]);
    bgGrad.addColorStop(1, theme.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Islamic Geometry / Border Card
    const margin = 54;
    const cardRadius = 40;

    // Outer decorative border
    ctx.save();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Inner fine border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 16, margin + 16, width - (margin + 16) * 2, height - (margin + 16) * 2);

    // Corner Ornaments
    const cornerSize = 28;
    const corners = [
      [margin + 16, margin + 16],
      [width - (margin + 16), margin + 16],
      [margin + 16, height - (margin + 16)],
      [width - (margin + 16), height - (margin + 16)],
    ];
    ctx.fillStyle = theme.accent;
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 3. Top Decorative Header (App Branding & Badge)
    const centerX = width / 2;
    let currentY = 160;

    // Pill Badge: "QS. [Surat] : [Ayat]"
    const badgeText = `QS. ${verseData.suratNamaLatin || "Al-Qur'an"} : ${verseData.nomorAyat || 1}`;
    ctx.font = "bold 28px 'Plus Jakarta Sans', sans-serif";
    const badgeMetrics = ctx.measureText(badgeText);
    const badgePaddingX = 32;
    const badgeHeight = 56;
    const badgeWidth = badgeMetrics.width + badgePaddingX * 2;
    const badgeX = centerX - badgeWidth / 2;
    const badgeY = currentY;

    // Draw Badge Background
    ctx.fillStyle = theme.badgeBg;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 28);
    ctx.fill();
    ctx.strokeStyle = theme.badgeBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Badge Text
    ctx.fillStyle = theme.badgeText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, centerX, badgeY + badgeHeight / 2);

    // Sub-title "Ayat Hari Ini • Tadabbur Harian"
    currentY += 90;
    ctx.font = "600 22px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = theme.brand;
    ctx.fillText("✦ AYAT HARI INI • TADABBUR ✦", centerX, currentY);

    // 4. Bismillah Calligraphy Accent
    currentY += 80;
    ctx.font = "40px 'Amiri', serif";
    ctx.fillStyle = theme.accent;
    ctx.fillText("بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ", centerX, currentY);

    // Top Divider Line
    currentY += 40;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 160, currentY);
    ctx.lineTo(centerX + 160, currentY);
    ctx.stroke();

    // Center Diamond
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(centerX, currentY, 4, 0, Math.PI * 2);
    ctx.fill();

    // 5. Arab Verse Text (Amiri font with adaptive sizing)
    const contentMaxWidth = width - 200;
    const arabBaseSize = arabicFontSize === "large" ? 54 : 46;
    ctx.font = `bold ${arabBaseSize}px 'Amiri', 'Traditional Arabic', serif`;
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const arabLines = wrapText(ctx, verseData.teksArab || "", contentMaxWidth);
    const arabLineHeight = arabBaseSize * 1.95;

    // Calculate vertical position centering
    currentY += 75;
    ctx.fillStyle = theme.arabic;
    for (let i = 0; i < arabLines.length; i++) {
      ctx.fillText(arabLines[i], centerX, currentY + i * arabLineHeight);
    }
    currentY += arabLines.length * arabLineHeight + 20;

    // Reset Direction for Latin text
    ctx.direction = "ltr";

    // 6. Transliterasi Latin (Optional)
    if (showLatin && verseData.teksLatin) {
      currentY += 15;
      ctx.font = "italic 26px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = theme.latin;
      const latinLines = wrapText(ctx, verseData.teksLatin, contentMaxWidth - 40);
      const latinLineHeight = 38;
      for (let i = 0; i < latinLines.length; i++) {
        ctx.fillText(latinLines[i], centerX, currentY + i * latinLineHeight);
      }
      currentY += latinLines.length * latinLineHeight + 15;
    }

    // 7. Middle Decorative Divider
    currentY += 25;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 120, currentY);
    ctx.lineTo(centerX + 120, currentY);
    ctx.stroke();

    // Divider ornament motif
    ctx.font = "20px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = theme.accent;
    ctx.fillText("❖", centerX, currentY + 6);

    // 8. Terjemahan Indonesia (Optional)
    if (showTranslation && verseData.teksIndonesia) {
      currentY += 45;
      ctx.font = "26px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = theme.translation;
      const transText = `"${verseData.teksIndonesia}"`;
      const transLines = wrapText(ctx, transText, contentMaxWidth - 40);
      const transLineHeight = 42;
      for (let i = 0; i < transLines.length; i++) {
        ctx.fillText(transLines[i], centerX, currentY + i * transLineHeight);
      }
      currentY += transLines.length * transLineHeight + 20;
    }

    // 9. Footer Watermark & Branding
    const footerY = height - 120;
    ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = theme.accent;
    ctx.fillText("Al-Qur'an Al-Karim Digital", centerX, footerY);

    ctx.font = "18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = theme.brand;
    ctx.fillText("Baca • Dengar • Tadabbur • Hafalan", centerX, footerY + 32);

    return canvas;
  }, [selectedTheme, verseData, showLatin, showTranslation, arabicFontSize]);

  // Download Story PNG
  const handleDownloadImage = async () => {
    try {
      setIsExporting(true);
      const canvas = await drawStoryToCanvas();
      if (!canvas) return;

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      const filename = `story-ayat-qs-${verseData?.suratNamaLatin || "quran"}-${
        verseData?.nomorAyat || "1"
      }.png`;
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Gagal mendownload gambar:", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Bagikan langsung ke WhatsApp Status / Web Share API
  const handleShareWhatsApp = async () => {
    try {
      setIsExporting(true);
      const canvas = await drawStoryToCanvas();
      if (!canvas) return;

      const shareText = `*Ayat Hari Ini*\nQS. ${verseData.suratNamaLatin}: ${verseData.nomorAyat}\n\n"${verseData.teksIndonesia}"\n\n_Dibagikan dari Al-Qur'an Digital_`;

      // Cek apakah browser mendukung Web Share API dengan File (Mobile Android / iOS)
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File(
            [blob],
            `story-qs-${verseData.suratNamaLatin}-${verseData.nomorAyat}.png`,
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
              if (err.name !== "AbortError") {
                console.warn("Share files batal atau tidak didukung:", err);
              }
            }
          }

          // Fallback Web Share jika file gagal: share text + download image
          handleFallbackShare(shareText, canvas);
        }, "image/png");
      } else {
        // Fallback Desktop
        handleFallbackShare(shareText, canvas);
      }
    } catch (e) {
      console.error("Gagal membagikan ke WhatsApp:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFallbackShare = (shareText, canvas) => {
    // 1. Download file gambar story
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `story-qs-${verseData?.suratNamaLatin}-${verseData?.nomorAyat}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 2. Buka WhatsApp Web / App dengan teks
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");

    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  // Salin teks ayat untuk caption
  const handleCopyCaption = () => {
    if (!verseData) return;
    const text = `QS. ${verseData.suratNamaLatin}: ${verseData.nomorAyat}\n\n${verseData.teksArab}\n\n"${verseData.teksIndonesia}"\n\n(Al-Qur'an Al-Karim Digital)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !verseData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-1.5">
                <span>Story WhatsApp & Instagram</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  9:16 HD
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                QS. {verseData.suratNamaLatin} : Ayat {verseData.nomorAyat}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content: Split Screen (Preview 9:16 kiri, Kontrol kanan) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* SISI KIRI: Live 9:16 Story Card Preview */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] rounded-[2rem] p-4 shadow-xl border-4 border-stone-800 relative overflow-hidden flex flex-col justify-between transition-all duration-300">
              {/* Actual Visual Card Preview */}
              <div
                className={`absolute inset-0 p-5 flex flex-col justify-between transition-colors duration-300 ${selectedTheme.bgClass}`}
              >
                {/* Simulated Story Top Status Bars */}
                <div className="w-full flex items-center gap-1 mb-2 opacity-60">
                  <div className="h-1 flex-1 rounded-full bg-white/70"></div>
                  <div className="h-1 flex-1 rounded-full bg-white/30"></div>
                </div>

                {/* Card Header */}
                <div className="text-center space-y-1.5 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border border-white/20 bg-white/10 backdrop-blur-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>
                      QS. {verseData.suratNamaLatin}: {verseData.nomorAyat}
                    </span>
                  </div>
                  <p className="text-[9px] uppercase tracking-widest font-semibold opacity-75">
                    Ayat Hari Ini • Tadabbur
                  </p>
                  <p className="font-arabic text-sm opacity-85 pt-0.5 text-amber-300">
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                </div>

                {/* Card Middle: Arabic & Translations */}
                <div className="my-auto py-2 text-center space-y-3">
                  <p
                    dir="rtl"
                    className={`font-arabic font-bold leading-relaxed px-1 text-center transition-all ${
                      arabicFontSize === "large" ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                    }`}
                  >
                    {verseData.teksArab}
                  </p>

                  {showLatin && verseData.teksLatin && (
                    <p className="text-[10px] sm:text-[11px] italic opacity-85 leading-snug px-1">
                      {verseData.teksLatin}
                    </p>
                  )}

                  <div className="w-16 h-px mx-auto bg-current opacity-30 my-1"></div>

                  {showTranslation && verseData.teksIndonesia && (
                    <p className="text-[10px] sm:text-[11px] leading-relaxed opacity-90 px-1 font-medium">
                      &quot;{verseData.teksIndonesia}&quot;
                    </p>
                  )}
                </div>

                {/* Card Footer: Branding Watermark */}
                <div className="text-center pt-2 border-t border-white/10">
                  <p className="text-[10px] font-bold tracking-wider">Al-Qur&apos;an Al-Karim</p>
                  <p className="text-[8px] opacity-70">Digital Quran App</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 mt-2 text-center flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Preview tampilan Story WhatsApp (9:16)</span>
            </p>
          </div>

          {/* SISI KANAN: Panel Pengaturan & Opsi Kustomisasi */}
          <div className="md:col-span-6 space-y-5">
            {/* 1. Pilih Tema Estetik */}
            <div>
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-2.5">
                <Palette className="w-3.5 h-3.5 text-emerald-800" />
                <span>Pilih Tema Estetik ({STORY_THEMES.length} Tema)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STORY_THEMES.map((theme) => {
                  const isSelected = theme.id === selectedThemeId;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? "border-emerald-800 bg-emerald-50/60 ring-2 ring-emerald-800/20 shadow-xs"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full shrink-0 border shadow-2xs ${theme.chipColor}`}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{theme.name}</h4>
                        <p className="text-[10px] text-stone-500 truncate">{theme.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Opsi Konten Story */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-emerald-800" />
                <span>Kustomisasi Tampilan</span>
              </label>

              <div className="space-y-2">
                {/* Toggle Terjemahan */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80 cursor-pointer hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                    <span className="text-xs font-semibold text-stone-700">Terjemahan Bahasa</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 cursor-pointer accent-emerald-700"
                  />
                </label>

                {/* Toggle Transliterasi Latin */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80 cursor-pointer hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-stone-600" />
                    <span className="text-xs font-semibold text-stone-700">
                      Teks Latin (Transliterasi)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showLatin}
                    onChange={(e) => setShowLatin(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 cursor-pointer accent-emerald-700"
                  />
                </label>

                {/* Ukuran Teks Arab */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80">
                  <span className="text-xs font-semibold text-stone-700">Ukuran Teks Arab</span>
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => setArabicFontSize("normal")}
                      className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                        arabicFontSize === "normal"
                          ? "bg-white text-emerald-950 shadow-2xs"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      Sedang
                    </button>
                    <button
                      onClick={() => setArabicFontSize("large")}
                      className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                        arabicFontSize === "large"
                          ? "bg-white text-emerald-950 shadow-2xs"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      Besar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Tombol Aksi Utama */}
            <div className="space-y-2.5 pt-1">
              {/* Tombol Bagikan ke WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                disabled={isExporting}
                className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Berhasil Dibagikan ke WhatsApp!</span>
                  </>
                ) : isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menyiapkan Story WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan ke Story WhatsApp</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Download Gambar PNG */}
                <button
                  onClick={handleDownloadImage}
                  disabled={isExporting}
                  className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG (HD)</span>
                </button>

                {/* Salin Teks Ayat */}
                <button
                  onClick={handleCopyCaption}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-600" />
                      <span>Salin Caption</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Canvas untuk ekspor 1080x1920 Full HD */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
