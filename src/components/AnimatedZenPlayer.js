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
  Sliders,
  Image as ImageIcon,
  CloudRain,
  Wind,
  Waves,
  Moon,
  Sparkles,
  Settings,
} from "lucide-react";
import ambientEngine from "@/utils/ambientSound";
import { RECITERS } from "./AudioPlayerBar";

// Default Preset Backgrounds
const BACKGROUND_PRESETS = [
  {
    id: "rain",
    name: "Hujan Tenang",
    subtitle: "Rintik hujan di jendela",
    url: "/backgrounds/rain.png",
    recommendedSound: "rain",
    color: "#0F2027",
  },
  {
    id: "wind",
    name: "Semilir Angin Hutan",
    subtitle: "Hutan pinus berkabut",
    url: "/backgrounds/wind.png",
    recommendedSound: "wind",
    color: "#13271F",
  },
  {
    id: "night",
    name: "Malam Berbintang",
    subtitle: "Gurun pasir & hilal",
    url: "/backgrounds/night.png",
    recommendedSound: "night",
    color: "#080c14",
  },
];

const SOUND_PRESETS = [
  { id: "rain", label: "Hujan (Rain)", icon: CloudRain, defaultVol: 0.5 },
  { id: "wind", label: "Angin (Wind)", icon: Wind, defaultVol: 0.5 },
  { id: "waves", label: "Ombak / Air (Waves)", icon: Waves, defaultVol: 0.4 },
  { id: "night", label: "Malam & Jangkrik", icon: Moon, defaultVol: 0.35 },
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
  currentLoop,
  transitioningToNext,
}) {
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_PRESETS[0].url);
  const [customBgUrl, setCustomBgUrl] = useState("");
  const [overlayDarkness, setOverlayDarkness] = useState(0.55); // 0.3 - 0.8
  const [isKenBurnsActive, setIsKenBurnsActive] = useState(true);

  // Soundscape State
  const [activeSounds, setActiveSounds] = useState({}); // { rain: true, wind: false, ... }
  const [soundVolumes, setSoundVolumes] = useState({
    rain: 0.5,
    wind: 0.5,
    waves: 0.4,
    night: 0.35,
  });
  const [masterAmbientVol, setMasterAmbientVol] = useState(0.6);
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);

  // UI Panels
  const [activePanel, setActivePanel] = useState(null); // null | 'soundscape' | 'background' | 'settings'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [arabicSize, setArabicSize] = useState("large"); // 'normal' | 'large' | 'huge'

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedBg = localStorage.getItem("quran_zen_bg");
      if (savedBg) setSelectedBg(savedBg);

      const savedSounds = localStorage.getItem("quran_zen_sounds");
      if (savedSounds) setActiveSounds(JSON.parse(savedSounds));

      const savedVol = localStorage.getItem("quran_zen_vol");
      if (savedVol) setMasterAmbientVol(Number(savedVol));
    } catch (e) {
      // ignore
    }
  }, []);

  // Auto-resume active ambient sounds when open (e.g. after navigating between surahs)
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

  // Sync ambient sounds with ambientEngine
  const toggleAmbientSound = (soundId) => {
    if (!ambientEngine) return;
    const nextState = !activeSounds[soundId];
    const updated = { ...activeSounds, [soundId]: nextState };
    setActiveSounds(updated);

    if (nextState) {
      ambientEngine.startRain && soundId === "rain" && ambientEngine.startRain(soundVolumes.rain);
      ambientEngine.startWind && soundId === "wind" && ambientEngine.startWind(soundVolumes.wind);
      ambientEngine.startWaves && soundId === "waves" && ambientEngine.startWaves(soundVolumes.waves);
      ambientEngine.startNight && soundId === "night" && ambientEngine.startNight(soundVolumes.night);
    } else {
      ambientEngine.stopSound(soundId);
    }

    try {
      localStorage.setItem("quran_zen_sounds", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSoundVolumeChange = (soundId, newVol) => {
    setSoundVolumes((prev) => ({ ...prev, [soundId]: newVol }));
    if (ambientEngine && activeSounds[soundId]) {
      ambientEngine.setVolume(soundId, newVol);
    }
  };

  const handleMasterAmbientVolume = (vol) => {
    setMasterAmbientVol(vol);
    if (ambientEngine) {
      ambientEngine.setMasterVolume(vol);
    }
    try {
      localStorage.setItem("quran_zen_vol", String(vol));
    } catch (e) {}
  };

  const handleToggleAmbientMute = () => {
    if (ambientEngine) {
      const muted = ambientEngine.toggleMute();
      setIsAmbientMuted(muted);
    }
  };

  // Switch Background
  const handleSelectBg = (url) => {
    setSelectedBg(url);
    try {
      localStorage.setItem("quran_zen_bg", url);
    } catch (e) {}
  };

  // Upload Custom Background Image (e.g. image.png)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultUrl = event.target.result;
          setSelectedBg(resultUrl);
          try {
            localStorage.setItem("quran_zen_bg", resultUrl);
          } catch (e) {}
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fullscreen browser toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Listen for escape key or fullscreen change
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !document.fullscreenElement) {
        onClose();
      }
    };
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, [isOpen, onClose]);

  // Cleanup ambient sound when closing or unmounting
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
    if (arabicSize === "normal") return "text-2xl sm:text-3xl leading-[2.2]";
    if (arabicSize === "huge") return "text-4xl sm:text-6xl leading-[2.4]";
    return "text-3xl sm:text-5xl leading-[2.3]";
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between bg-stone-950 text-white select-none transition-all duration-300"
    >
      {/* 1. Cinematic Background Layer with Ken Burns Pan/Zoom */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
            isKenBurnsActive ? "animate-kenburns" : ""
          }`}
          style={{
            backgroundImage: `url(${selectedBg})`,
            filter: "brightness(0.9) contrast(1.05)",
          }}
        />

        {/* Ambient Dark Vignette & Gradient Overlays for optimal typography readability */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: `rgba(10, 15, 20, ${overlayDarkness})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* Transition Banner between Surahs inside Zen Mode */}
      {transitioningToNext && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/95 text-white backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/80 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Melanjutkan lantunan ke QS. {transitioningToNext}...</span>
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
        {/* Surat & Ayah Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-400 shadow-lg">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Mode Animasi Sinematik
              </span>
              {currentTrack?.ayatNomor && (
                <span className="text-[11px] text-stone-300 font-medium">
                  Ayat {currentTrack.ayatNomor} {currentTrack.totalAyat ? `dari ${currentTrack.totalAyat}` : ""}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white drop-shadow-md">
              {currentTrack?.suratNamaLatin ? `QS. ${currentTrack.suratNamaLatin}` : currentTrack?.title}
            </h2>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          {/* Soundscape Mixer Button */}
          <button
            onClick={() => setActivePanel(activePanel === "soundscape" ? null : "soundscape")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all flex items-center gap-2 ${
              activeSoundCount > 0 || activePanel === "soundscape"
                ? "bg-emerald-600/90 text-white border-emerald-400 shadow-lg shadow-emerald-950/40"
                : "bg-white/10 text-stone-200 hover:bg-white/20 border-white/15"
            }`}
            title="Pengaturan Suara Alam (Hujan, Angin, Ombak)"
          >
            {activeSoundCount > 0 ? (
              <Wind className="w-4 h-4 animate-spin" style={{ animationDuration: "6s" }} />
            ) : (
              <Wind className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Suara Alam</span>
            {activeSoundCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold flex items-center justify-center">
                {activeSoundCount}
              </span>
            )}
          </button>

          {/* Background Selector Button */}
          <button
            onClick={() => setActivePanel(activePanel === "background" ? null : "background")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all flex items-center gap-1.5 ${
              activePanel === "background"
                ? "bg-white/30 text-white border-white/40"
                : "bg-white/10 text-stone-200 hover:bg-white/20 border-white/15"
            }`}
            title="Ganti Background Image"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Latar Belakang</span>
          </button>

          {/* Settings Panel Button */}
          <button
            onClick={() => setActivePanel(activePanel === "settings" ? null : "settings")}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
              activePanel === "settings"
                ? "bg-white/30 text-white border-white/40"
                : "bg-white/10 text-stone-200 hover:bg-white/20 border-white/15"
            }`}
            title="Pengaturan Tampilan & Teks"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 backdrop-blur-md border border-white/15 transition-all"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh (Fullscreen)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Zen Player */}
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-red-500/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-md"
            title="Kembali ke Mode Normal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Dropdown Floating Modals / Tool Panels */}
      {/* 3A. Soundscape Mixer Panel */}
      {activePanel === "soundscape" && (
        <div className="absolute top-20 right-4 sm:right-8 z-30 w-80 sm:w-96 bg-stone-900/90 backdrop-blur-2xl border border-stone-700/60 rounded-3xl p-5 shadow-2xl text-stone-100 animate-fade-in-up">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm">Mixer Suara Alam (Soundscape)</h3>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-stone-400 mt-2 mb-4 leading-relaxed">
            Nyalakan suara hujan, semilir angin, atau ombak untuk mengiringi lantunan suci Al-Qur&apos;an secara syahdu.
          </p>

          {/* Master Ambient Volume */}
          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/40 mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-300">Master Volume Suara Alam:</span>
              <button
                onClick={handleToggleAmbientMute}
                className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1"
              >
                {isAmbientMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                <span>{isAmbientMuted ? "Muted" : `${Math.round(masterAmbientVol * 100)}%`}</span>
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterAmbientVol}
              onChange={(e) => handleMasterAmbientVolume(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Preset Sound List */}
          <div className="space-y-3">
            {SOUND_PRESETS.map((snd) => {
              const Icon = snd.icon;
              const isActive = !!activeSounds[snd.id];
              const vol = soundVolumes[snd.id] ?? snd.defaultVol;

              return (
                <div
                  key={snd.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-emerald-950/50 border-emerald-600/60 shadow-sm"
                      : "bg-stone-800/40 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-700 text-stone-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-white">{snd.label}</span>
                    </div>

                    <button
                      onClick={() => toggleAmbientSound(snd.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                          : "bg-stone-700 hover:bg-stone-600 text-stone-200"
                      }`}
                    >
                      {isActive ? "Aktif" : "Putar"}
                    </button>
                  </div>

                  {/* Volume Slider for each individual sound */}
                  {isActive && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-stone-400 w-12">Volume:</span>
                      <input
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.05"
                        value={vol}
                        onChange={(e) => handleSoundVolumeChange(snd.id, Number(e.target.value))}
                        className="flex-1 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                      <span className="text-[10px] text-stone-400 w-8 text-right">
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

      {/* 3B. Background Selector Panel */}
      {activePanel === "background" && (
        <div className="absolute top-20 right-4 sm:right-8 z-30 w-80 sm:w-96 bg-stone-900/90 backdrop-blur-2xl border border-stone-700/60 rounded-3xl p-5 shadow-2xl text-stone-100 animate-fade-in-up">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm">Pilih Gambar Background</h3>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-stone-400 mt-2 mb-3">
            Pilih suasana pemandangan animasi atau pasang gambar pilihan Anda sendiri.
          </p>

          <div className="grid grid-cols-1 gap-2.5 mb-4">
            {BACKGROUND_PRESETS.map((bg) => {
              const isSelected = selectedBg === bg.url;
              return (
                <button
                  key={bg.id}
                  onClick={() => handleSelectBg(bg.url)}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-emerald-950/70 border-emerald-500 shadow-md ring-1 ring-emerald-500"
                      : "bg-stone-800/40 border-stone-800 hover:border-stone-700 hover:bg-stone-800/70"
                  }`}
                >
                  <div
                    className="w-16 h-12 rounded-xl bg-cover bg-center shrink-0 border border-white/20 shadow-xs"
                    style={{ backgroundImage: `url(${bg.url})` }}
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{bg.name}</p>
                    <p className="text-[10px] text-stone-400 truncate">{bg.subtitle}</p>
                  </div>
                  {isSelected && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Image Upload or URL */}
          <div className="pt-3 border-t border-stone-800 space-y-2">
            <span className="text-[11px] font-semibold text-stone-300 block">
              Gunakan Gambar Sendiri:
            </span>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Foto / image.png</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3C. Settings Panel (Typography & Overlay) */}
      {activePanel === "settings" && (
        <div className="absolute top-20 right-4 sm:right-8 z-30 w-80 bg-stone-900/90 backdrop-blur-2xl border border-stone-700/60 rounded-3xl p-5 shadow-2xl text-stone-100 animate-fade-in-up space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm">Pengaturan Tampilan</h3>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Arabic Font Size */}
          <div>
            <span className="text-xs font-semibold text-stone-300 block mb-2">Ukuran Teks Arab:</span>
            <div className="grid grid-cols-3 gap-1 bg-stone-800 p-1 rounded-xl">
              {[
                { id: "normal", label: "Sedang" },
                { id: "large", label: "Besar" },
                { id: "huge", label: "Ekstra" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setArabicSize(s.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    arabicSize === s.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Toggles */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer">
              <span>Tampilkan Latin:</span>
              <input
                type="checkbox"
                checked={showLatin}
                onChange={(e) => setShowLatin(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer">
              <span>Tampilkan Terjemahan:</span>
              <input
                type="checkbox"
                checked={showTranslation}
                onChange={(e) => setShowTranslation(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer">
              <span>Animasi Gerak Background:</span>
              <input
                type="checkbox"
                checked={isKenBurnsActive}
                onChange={(e) => setIsKenBurnsActive(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
            </label>
          </div>

          {/* Overlay Darkness Slider */}
          <div className="pt-2 border-t border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span>Kegelapan Latar (Kontras):</span>
              <span>{Math.round(overlayDarkness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.85"
              step="0.05"
              value={overlayDarkness}
              onChange={(e) => setOverlayDarkness(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      )}

      {/* 4. Center Main Content: Ayat Display with Cinematic Animation */}
      <main
        className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-12 py-6 max-w-4xl mx-auto w-full text-center overflow-y-auto"
        onClick={() => setActivePanel(null)}
      >
        <div key={currentTrack?.ayatNomor || "track"} className="animate-fade-in-up space-y-6 sm:space-y-8 my-auto max-w-3xl">
          {/* Ayat Badge */}
          {currentTrack?.ayatNomor && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-emerald-300 text-xs sm:text-sm font-bold">
              <span>Ayat ke-{currentTrack.ayatNomor}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          )}

          {/* Arabic Text with soft glow */}
          {currentTrack?.teksArab ? (
            <p
              dir="rtl"
              className={`font-arabic text-emerald-100 font-bold quran-arabic-glow transition-all duration-300 text-center tracking-normal ${getArabicSizeClass()}`}
            >
              {currentTrack.teksArab}
            </p>
          ) : (
            <p className="text-2xl sm:text-3xl font-bold text-white quran-text-glow">
              {currentTrack?.title}
            </p>
          )}

          {/* Latin Transliteration */}
          {showLatin && currentTrack?.teksLatin && (
            <p className="text-sm sm:text-base text-emerald-200/90 font-medium italic quran-text-glow max-w-2xl mx-auto leading-relaxed">
              {currentTrack.teksLatin}
            </p>
          )}

          {/* Indonesian Translation */}
          {showTranslation && currentTrack?.teksIndonesia && (
            <p className="text-sm sm:text-lg text-stone-200 font-normal leading-relaxed max-w-2xl mx-auto quran-text-glow">
              &quot;{currentTrack.teksIndonesia}&quot;
            </p>
          )}
        </div>
      </main>

      {/* 5. Bottom Cinematic Player Controls Bar */}
      <footer className="relative z-20 px-4 sm:px-8 pb-6 sm:pb-8 pt-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent backdrop-blur-xs">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Scrubber Timeline */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 w-10 text-right font-medium">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-stone-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="text-xs text-stone-400 w-10 font-medium">
              {formatTime(duration)}
            </span>
          </div>

          {/* Playback Controls & Info */}
          <div className="flex items-center justify-between">
            {/* Left: Reciter and Surah Info */}
            <div className="flex items-center gap-2 truncate max-w-[140px] sm:max-w-[200px]">
              {setReciterKey && (
                <select
                  value={reciterKey || "05"}
                  onChange={(e) => setReciterKey(e.target.value)}
                  className="text-xs bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1.5 text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-400 truncate cursor-pointer"
                >
                  {Object.entries(RECITERS).map(([key, val]) => (
                    <option key={key} value={key} className="bg-stone-900 text-white">
                      {val.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Center: Main Playback Controls */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Loop Repeat Button */}
              {setRepeatCount && (
                <button
                  onClick={() => {
                    const nextCycles = [1, 3, 5, 10, Infinity];
                    const currentIdx = nextCycles.indexOf(repeatCount || 1);
                    const next = nextCycles[(currentIdx + 1) % nextCycles.length];
                    setRepeatCount(next);
                  }}
                  className={`p-2 rounded-full border transition-all ${
                    repeatCount > 1
                      ? "bg-emerald-600 border-emerald-400 text-white shadow-md"
                      : "bg-white/10 hover:bg-white/20 border-white/15 text-stone-300"
                  }`}
                  title="Ulangi Ayat (Hafalan Loop)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}

              {/* Prev Button */}
              <button
                onClick={handlePrevTrack}
                disabled={!hasPrev}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-stone-200 disabled:opacity-30 disabled:hover:bg-white/10 flex items-center justify-center transition-all shadow-md"
                title="Ayat Sebelumnya"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Big Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white flex items-center justify-center shadow-xl shadow-emerald-950/60 transition-transform hover:scale-105 active:scale-95"
                title={isPlaying ? "Jeda Audio" : "Putar Audio"}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
              </button>

              {/* Next Button */}
              <button
                onClick={handleNextTrack}
                disabled={!hasNext}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-stone-200 disabled:opacity-30 disabled:hover:bg-white/10 flex items-center justify-center transition-all shadow-md"
                title="Ayat Selanjutnya"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Ambient Sound Quick Indicator */}
            <div className="flex items-center gap-1.5 text-right">
              <button
                onClick={() => setActivePanel(activePanel === "soundscape" ? null : "soundscape")}
                className="text-stone-400 hover:text-white flex items-center gap-1 text-xs"
                title="Buka Mixer Suara Alam"
              >
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-[11px]">
                  {activeSoundCount > 0 ? `${activeSoundCount} Suara Alam` : "Suara Alam"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
