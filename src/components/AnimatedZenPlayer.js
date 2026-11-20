"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Image as ImageIcon,
  CloudRain,
  Wind,
  Waves,
  Moon,
  Settings,
} from "lucide-react";
import ambientEngine from "@/utils/ambientSound";
import { RECITERS } from "./AudioPlayerBar";
import { formatAyatMarker } from "@/utils/quranStorage";

const BACKGROUND_PRESETS = [
  {
    id: "rain",
    name: "Hujan Tenang",
    subtitle: "Rintik hujan di balik jendela",
    url: "/backgrounds/rain.png",
  },
  {
    id: "wind",
    name: "Hutan Berkabut",
    subtitle: "Semilir angin pepohonan",
    url: "/backgrounds/wind.png",
  },
  {
    id: "night",
    name: "Malam Berbintang",
    subtitle: "Langit malam gurun yang sunyi",
    url: "/backgrounds/night.png",
  },
];

const SOUND_PRESETS = [
  { id: "rain", label: "Rintik Hujan", icon: CloudRain, defaultVol: 0.5 },
  { id: "wind", label: "Semilir Angin", icon: Wind, defaultVol: 0.5 },
  { id: "waves", label: "Aliran Air / Ombak", icon: Waves, defaultVol: 0.4 },
  { id: "night", label: "Suasana Malam", icon: Moon, defaultVol: 0.35 },
];

export default function AnimatedZenPlayer({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  togglePlay,
  handleNextTrack,
  handlePrevTrack,
  hasNext,
  hasPrev,
  currentTime,
  duration,
  handleSeek,
  formatTime,
  reciterKey,
  setReciterKey,
  repeatCount,
  setRepeatCount,
  transitioningToNext,
}) {
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_PRESETS[0].url);
  const [overlayDarkness, setOverlayDarkness] = useState(0.6);
  const [isKenBurnsActive, setIsKenBurnsActive] = useState(true);

  const [activeSounds, setActiveSounds] = useState({});
  const [soundVolumes, setSoundVolumes] = useState({
    rain: 0.5,
    wind: 0.5,
    waves: 0.4,
    night: 0.35,
  });
  const [masterAmbientVol, setMasterAmbientVol] = useState(0.55);
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);

  const [activePanel, setActivePanel] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [arabicSize, setArabicSize] = useState("large");

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const savedBg = localStorage.getItem("quran_zen_bg");
      if (savedBg) setSelectedBg(savedBg);
      const savedSounds = localStorage.getItem("quran_zen_sounds");
      if (savedSounds) setActiveSounds(JSON.parse(savedSounds));
      const savedVol = localStorage.getItem("quran_zen_vol");
      if (savedVol) setMasterAmbientVol(Number(savedVol));
    } catch {}
  }, []);

  useEffect(() => {
    if (!isOpen || !ambientEngine) return;
    ambientEngine.init();
    Object.entries(activeSounds).forEach(([soundId, isActive]) => {
      if (isActive && !ambientEngine.activeNodes[soundId]) {
        const vol = soundVolumes[soundId] || 0.5;
        if (soundId === "rain") ambientEngine.startRain(vol);
        if (soundId === "wind") ambientEngine.startWind(vol);
        if (soundId === "waves") ambientEngine.startWaves(vol);
        if (soundId === "night") ambientEngine.startNight(vol);
      }
    });
  }, [isOpen, activeSounds, soundVolumes]);

  const toggleAmbientSound = (soundId) => {
    if (!ambientEngine) return;
    const nextState = !activeSounds[soundId];
    const updated = { ...activeSounds, [soundId]: nextState };
    setActiveSounds(updated);

    if (nextState) {
      if (soundId === "rain") ambientEngine.startRain(soundVolumes.rain);
      if (soundId === "wind") ambientEngine.startWind(soundVolumes.wind);
      if (soundId === "waves") ambientEngine.startWaves(soundVolumes.waves);
      if (soundId === "night") ambientEngine.startNight(soundVolumes.night);
    } else {
      ambientEngine.stopSound(soundId);
    }

    try {
      localStorage.setItem("quran_zen_sounds", JSON.stringify(updated));
    } catch {}
  };

  const handleSoundVolumeChange = (soundId, newVol) => {
    setSoundVolumes((prev) => ({ ...prev, [soundId]: newVol }));
    if (ambientEngine && activeSounds[soundId]) {
      ambientEngine.setVolume(soundId, newVol);
    }
  };

  const handleMasterAmbientVolume = (vol) => {
    setMasterAmbientVol(vol);
    if (ambientEngine) ambientEngine.setMasterVolume(vol);
    try {
      localStorage.setItem("quran_zen_vol", String(vol));
    } catch {}
  };

  const handleToggleAmbientMute = () => {
    if (ambientEngine) {
      setIsAmbientMuted(ambientEngine.toggleMute());
    }
  };

  const handleSelectBg = (url) => {
    setSelectedBg(url);
    try {
      localStorage.setItem("quran_zen_bg", url);
    } catch {}
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedBg(event.target.result);
          try {
            localStorage.setItem("quran_zen_bg", event.target.result);
          } catch {}
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !document.fullscreenElement) {
        onClose();
      }
    };
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    if (ambientEngine) {
      ambientEngine.stopAll();
      setActiveSounds({});
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  };

  if (!isOpen) return null;

  const activeSoundCount = Object.values(activeSounds).filter(Boolean).length;

  const getArabicSizeClass = () => {
    if (arabicSize === "normal") return "text-2xl sm:text-3xl leading-[2.3]";
    if (arabicSize === "huge") return "text-4xl sm:text-6xl leading-[2.45]";
    return "text-3xl sm:text-5xl leading-[2.4]";
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between bg-[#0E1310] text-stone-100 select-none"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
            isKenBurnsActive ? "animate-kenburns" : ""
          }`}
          style={{
            backgroundImage: `url(${selectedBg})`,
            filter: "brightness(0.85) contrast(1.04)",
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ backgroundColor: `rgba(10, 14, 12, ${overlayDarkness})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70" />
      </div>

      {transitioningToNext && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-[#161E1B]/95 text-stone-100 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-xs font-medium">
          Melanjutkan lantunan ke QS. {transitioningToNext}...
        </div>
      )}

      {/* Top Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 gap-2">
        <div className="truncate min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-stone-300">
            <span className="uppercase tracking-widest font-medium text-[#D4B680]">
              Ruang Khusyuk
            </span>
            {currentTrack?.ayatNomor && (
              <>
                <span>•</span>
                <span>
                  Ayat {currentTrack.ayatNomor}
                  {currentTrack.totalAyat ? ` dari ${currentTrack.totalAyat}` : ""}
                </span>
              </>
            )}
          </div>
          <h2 className="font-editorial text-lg sm:text-2xl font-semibold text-white truncate mt-0.5">
            {currentTrack?.suratNamaLatin ? `QS. ${currentTrack.suratNamaLatin}` : currentTrack?.title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActivePanel(activePanel === "soundscape" ? null : "soundscape")}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium backdrop-blur-md border transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSoundCount > 0 || activePanel === "soundscape"
                ? "bg-[#2D6A4F] text-white border-emerald-500/50"
                : "bg-white/10 text-stone-200 hover:bg-white/15 border-white/15"
            }`}
            title="Suara Alam"
          >
            <Wind className="w-4 h-4" />
            <span className="hidden sm:inline">Suara Alam</span>
            {activeSoundCount > 0 && (
              <span className="text-[10px] px-1.5 rounded-full bg-black/30">{activeSoundCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActivePanel(activePanel === "background" ? null : "background")}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium backdrop-blur-md border transition-colors flex items-center gap-1.5 cursor-pointer ${
              activePanel === "background"
                ? "bg-white/25 text-white border-white/30"
                : "bg-white/10 text-stone-200 hover:bg-white/15 border-white/15"
            }`}
            title="Latar Suasana"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Latar</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel(activePanel === "settings" ? null : "settings")}
            className={`p-2 rounded-xl backdrop-blur-md border transition-colors cursor-pointer ${
              activePanel === "settings"
                ? "bg-white/25 text-white border-white/30"
                : "bg-white/10 text-stone-200 hover:bg-white/15 border-white/15"
            }`}
            title="Pengaturan Teks"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 backdrop-blur-md border border-white/15 transition-colors cursor-pointer"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-colors cursor-pointer"
            title="Tutup Ruang Khusyuk"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Panel A: Soundscape */}
      {activePanel === "soundscape" && (
        <div className="fixed sm:absolute inset-x-3 bottom-24 sm:bottom-auto sm:inset-auto sm:top-20 sm:right-8 z-30 max-w-sm sm:w-96 mx-auto sm:mx-0 bg-[#161E1B]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl text-stone-100 max-h-[68dvh] overflow-y-auto custom-scroll">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-300" />
              <span>Suara Alam</span>
            </h3>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-stone-400 mt-2 mb-4 leading-relaxed">
            Padukan suara rintik hujan, angin, atau malam sebagai pengiring lembut saat menyimak murattal.
          </p>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10 mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-300">Volume Utama</span>
              <button
                type="button"
                onClick={handleToggleAmbientMute}
                className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {isAmbientMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                )}
                <span>{isAmbientMuted ? "Bisu" : `${Math.round(masterAmbientVol * 100)}%`}</span>
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterAmbientVol}
              onChange={(e) => handleMasterAmbientVolume(Number(e.target.value))}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          <div className="space-y-2.5">
            {SOUND_PRESETS.map((snd) => {
              const Icon = snd.icon;
              const isActive = !!activeSounds[snd.id];
              const vol = soundVolumes[snd.id] ?? snd.defaultVol;
              return (
                <div
                  key={snd.id}
                  className={`p-3 rounded-xl border transition-colors ${
                    isActive
                      ? "bg-emerald-950/50 border-emerald-700/60"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-emerald-300" : "text-stone-400"}`} />
                      <span className="text-xs font-medium text-white">{snd.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAmbientSound(snd.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#2D6A4F] text-white"
                          : "bg-white/10 hover:bg-white/15 text-stone-200"
                      }`}
                    >
                      {isActive ? "Aktif" : "Nyalakan"}
                    </button>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-2 pt-1.5">
                      <input
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.05"
                        value={vol}
                        onChange={(e) => handleSoundVolumeChange(snd.id, Number(e.target.value))}
                        className="flex-1 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                      <span className="text-[10px] text-stone-400 w-8 text-right tabular-nums">
                        {Math.round(vol * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Panel B: Background */}
      {activePanel === "background" && (
        <div className="fixed sm:absolute inset-x-3 bottom-24 sm:bottom-auto sm:inset-auto sm:top-20 sm:right-8 z-30 max-w-sm sm:w-96 mx-auto sm:mx-0 bg-[#161E1B]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl text-stone-100 max-h-[68dvh] overflow-y-auto custom-scroll">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-300" />
              <span>Latar Suasana</span>
            </h3>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 my-3.5">
            {BACKGROUND_PRESETS.map((bg) => {
              const isSelected = selectedBg === bg.url;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => handleSelectBg(bg.url)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-emerald-950/60 border-emerald-600"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div
                    className="w-14 h-10 rounded-lg bg-cover bg-center shrink-0 border border-white/15"
                    style={{ backgroundImage: `url(${bg.url})` }}
                  />
                  <div className="truncate">
                    <p className="text-xs font-medium text-white truncate">{bg.name}</p>
                    <p className="text-[10px] text-stone-400 truncate">{bg.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-stone-100 text-xs font-medium rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Pilih Gambar dari Perangkat</span>
            </button>
          </div>
        </div>
      )}

      {/* Panel C: Display Settings */}
      {activePanel === "settings" && (
        <div className="fixed sm:absolute inset-x-3 bottom-24 sm:bottom-auto sm:inset-auto sm:top-20 sm:right-8 z-30 max-w-sm sm:w-80 mx-auto sm:mx-0 bg-[#161E1B]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl text-stone-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-300" />
              <span>Tampilan Ayat</span>
            </h3>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <span className="text-xs font-medium text-stone-300 block mb-2">Ukuran Teks Arab</span>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl">
              {[
                { id: "normal", label: "Sedang" },
                { id: "large", label: "Besar" },
                { id: "huge", label: "Ekstra" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setArabicSize(s.id)}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    arabicSize === s.id ? "bg-[#2D6A4F] text-white" : "text-stone-400 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs text-stone-300">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Transliterasi Latin</span>
              <input
                type="checkbox"
                checked={showLatin}
                onChange={(e) => setShowLatin(e.target.checked)}
                className="accent-emerald-500 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Terjemahan Indonesia</span>
              <input
                type="checkbox"
                checked={showTranslation}
                onChange={(e) => setShowTranslation(e.target.checked)}
                className="accent-emerald-500 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Gerak Latar Halus</span>
              <input
                type="checkbox"
                checked={isKenBurnsActive}
                onChange={(e) => setIsKenBurnsActive(e.target.checked)}
                className="accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span>Redupkan Latar</span>
              <span className="tabular-nums">{Math.round(overlayDarkness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.88"
              step="0.05"
              value={overlayDarkness}
              onChange={(e) => setOverlayDarkness(Number(e.target.value))}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>
      )}

      {/* Center Verse Display */}
      <main
        className="relative z-10 flex-1 flex flex-col justify-center items-center px-5 sm:px-12 py-6 max-w-4xl mx-auto w-full text-center overflow-y-auto custom-scroll"
        onClick={() => setActivePanel(null)}
      >
        <div
          key={currentTrack?.ayatNomor || "track"}
          className="animate-fade-in-up space-y-6 sm:space-y-8 my-auto max-w-3xl"
        >
          {currentTrack?.teksArab ? (
            <p
              dir="rtl"
              className={`font-arabic text-[#F5F2EA] quran-arabic-glow text-center ${getArabicSizeClass()}`}
            >
              {currentTrack.teksArab}
              {currentTrack.ayatNomor && (
                <span className="ayat-end-ornament" style={{ color: "#D4B680" }}>
                  {formatAyatMarker(currentTrack.ayatNomor)}
                </span>
              )}
            </p>
          ) : (
            <p className="font-editorial text-2xl sm:text-3xl font-semibold text-white quran-text-glow">
              {currentTrack?.title}
            </p>
          )}

          {showLatin && currentTrack?.teksLatin && (
            <p className="text-sm sm:text-base text-[#D4B680]/90 italic quran-text-glow max-w-2xl mx-auto leading-relaxed">
              {currentTrack.teksLatin}
            </p>
          )}

          {showTranslation && currentTrack?.teksIndonesia && (
            <p className="text-sm sm:text-lg text-stone-200 leading-relaxed max-w-2xl mx-auto quran-text-glow">
              &quot;{currentTrack.teksIndonesia}&quot;
            </p>
          )}
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="relative z-20 px-4 sm:px-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-7 pt-3 bg-gradient-to-t from-black/90 via-black/75 to-transparent">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-stone-400 w-9 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              aria-label="Posisi audio"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="text-[11px] text-stone-400 w-9 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center justify-between w-full sm:w-auto gap-2">
              {setReciterKey && (
                <select
                  aria-label="Pilih Qari"
                  value={reciterKey || "05"}
                  onChange={(e) => setReciterKey(e.target.value)}
                  className="text-xs bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-stone-200 max-w-[175px] truncate cursor-pointer"
                >
                  {Object.entries(RECITERS).map(([key, val]) => (
                    <option key={key} value={key} className="bg-stone-900 text-white">
                      {val.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => setActivePanel(activePanel === "soundscape" ? null : "soundscape")}
                className="sm:hidden text-stone-200 flex items-center gap-1.5 text-xs bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/15 cursor-pointer"
              >
                <Wind className="w-3.5 h-3.5 text-emerald-300" />
                <span>{activeSoundCount > 0 ? `${activeSoundCount} Suara` : "Suara Alam"}</span>
              </button>
            </div>

            <div className="flex items-center gap-4 sm:gap-5 justify-center">
              {setRepeatCount && (
                <button
                  type="button"
                  onClick={() => {
                    const nextCycles = [1, 3, 5, 10, Infinity];
                    const currentIdx = nextCycles.indexOf(repeatCount || 1);
                    setRepeatCount(nextCycles[(currentIdx + 1) % nextCycles.length]);
                  }}
                  className={`p-2 rounded-full border transition-colors cursor-pointer ${
                    repeatCount > 1
                      ? "bg-[#2D6A4F] border-emerald-400/50 text-white"
                      : "bg-white/10 hover:bg-white/15 border-white/15 text-stone-300"
                  }`}
                  title="Ulangi Ayat"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handlePrevTrack}
                disabled={!hasPrev}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-stone-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-[#2D6A4F] hover:bg-[#388060] text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                title={isPlaying ? "Jeda" : "Putar"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNextTrack}
                disabled={!hasNext}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-stone-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
