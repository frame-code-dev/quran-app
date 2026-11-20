"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCw,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  Wind,
  X,
} from "lucide-react";
import AnimatedZenPlayer from "./AnimatedZenPlayer";
import { formatAyatMarker } from "@/utils/quranStorage";

export const RECITERS = {
  "05": { name: "Misyari Rasyid Al-Afasi", slug: "Misyari-Rasyid-Al-Afasi" },
  "03": { name: "Abdurrahman as-Sudais", slug: "Abdurrahman-as-Sudais" },
  "01": { name: "Abdullah Al-Juhany", slug: "Abdullah-Al-Juhany" },
  "02": { name: "Abdul-Muhsin Al-Qasim", slug: "Abdul-Muhsin-Al-Qasim" },
  "04": { name: "Ibrahim Al-Dossari", slug: "Ibrahim-Al-Dossari" },
};

export default function AudioPlayerBar({
  currentTrack,
  playlist,
  currentIndex,
  onTrackChange,
  onClose,
  reciterKey,
  setReciterKey,
  repeatCount,
  setRepeatCount,
  loopRange, // Optional: { startIdx, endIdx } for memorization range loop
  onClearLoopRange,
  onPlayStateChange,
  onNext,
  onPrev,
  toggleRef,
  isZenOpenExternal,
  setIsZenOpenExternal,
  transitioningToNext,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLoop, setCurrentLoop] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);

  // Ruang Khusyuk (Fullscreen Recitation + Nature Soundscape)
  const [internalZenOpen, setInternalZenOpen] = useState(false);
  const isZenOpen = isZenOpenExternal !== undefined ? isZenOpenExternal : internalZenOpen;
  const setIsZenOpen = setIsZenOpenExternal || setInternalZenOpen;

  // Picture-in-Picture State
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipContainer, setPipContainer] = useState(null);
  const pipWindowRef = useRef(null);
  const videoPipRef = useRef(null);
  const canvasPipRef = useRef(null);

  const onPlayStateChangeRef = useRef(onPlayStateChange);
  useEffect(() => {
    onPlayStateChangeRef.current = onPlayStateChange;
    if (toggleRef) {
      toggleRef.current = togglePlay;
    }
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    setCurrentLoop(1);

    if (!audio.src.includes(currentTrack.audioUrl)) {
      audio.src = currentTrack.audioUrl;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            onPlayStateChangeRef.current?.(true);
          })
          .catch((err) => {
            console.warn("Audio playback notice:", err);
          });
      }
    } else if (audio.paused) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          onPlayStateChangeRef.current?.(true);
        })
        .catch((err) => console.warn("Audio playback resume notice:", err));
    }
  }, [currentTrack?.audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      onPlayStateChangeRef.current?.(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          onPlayStateChangeRef.current?.(true);
        })
        .catch((e) => console.warn("Toggle play error:", e));
    }
  };

  const handleClose = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    }
    if (pipWindowRef.current) {
      try {
        pipWindowRef.current.close();
      } catch {}
      pipWindowRef.current = null;
      setPipContainer(null);
      setIsPipActive(false);
    }
    setIsPlaying(false);
    onPlayStateChangeRef.current?.(false);
    if (onClose) onClose();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const jumpToPlaylistIndex = (targetIdx) => {
    if (!playlist || targetIdx < 0 || targetIdx >= playlist.length) return;
    const targetAyat = playlist[targetIdx];
    const targetAudioUrl =
      targetAyat.audio?.[reciterKey || "05"] || Object.values(targetAyat.audio || {})[0];

    setCurrentLoop(1);
    if (audioRef.current && targetAudioUrl) {
      audioRef.current.src = targetAudioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          onPlayStateChangeRef.current?.(true);
        })
        .catch((e) => console.warn("Gapless advance error:", e));
    }
    if (onTrackChange) onTrackChange(targetIdx);
  };

  const handleEnded = () => {
    // 1. Repeat single verse
    if (repeatCount && currentLoop < repeatCount) {
      setCurrentLoop((prev) => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
      return;
    }

    // 2. Range loop (Muraja'ah blok ayat)
    if (
      loopRange &&
      playlist &&
      currentIndex !== null &&
      currentIndex !== undefined
    ) {
      const { startIdx, endIdx } = loopRange;
      if (currentIndex >= endIdx) {
        jumpToPlaylistIndex(startIdx);
        return;
      }
      if (currentIndex + 1 <= endIdx && currentIndex + 1 < playlist.length) {
        jumpToPlaylistIndex(currentIndex + 1);
        return;
      }
    }

    // 3. Normal sequential playlist
    if (playlist && currentIndex !== null && currentIndex !== undefined) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < playlist.length) {
        jumpToPlaylistIndex(nextIndex);
        return;
      }
    }

    if (onNext) {
      onNext();
      return;
    }

    setIsPlaying(false);
    onPlayStateChangeRef.current?.(false);
  };

  const handleNextTrack = () => {
    if (playlist && currentIndex !== null && currentIndex !== undefined) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < playlist.length) {
        jumpToPlaylistIndex(nextIndex);
        return;
      } else if (onNext) {
        onNext();
        return;
      }
    } else if (onNext) {
      onNext();
    }
  };

  const handlePrevTrack = () => {
    if (playlist && currentIndex !== null && currentIndex !== undefined) {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        jumpToPlaylistIndex(prevIndex);
        return;
      } else if (onPrev) {
        onPrev();
        return;
      }
    } else if (onPrev) {
      onPrev();
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const hasNext =
    playlist && currentIndex !== null && currentIndex !== undefined
      ? currentIndex < playlist.length - 1 || !!onNext
      : !!onNext;
  const hasPrev =
    playlist && currentIndex !== null && currentIndex !== undefined
      ? currentIndex > 0 || !!onPrev
      : !!onPrev;

  const handleNextTrackRef = useRef(handleNextTrack);
  const handlePrevTrackRef = useRef(handlePrevTrack);
  const togglePlayRef = useRef(togglePlay);
  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
    handlePrevTrackRef.current = handlePrevTrack;
    togglePlayRef.current = togglePlay;
  });

  // Media Session API
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    if (currentTrack) {
      const reciterName = RECITERS[reciterKey || "05"]?.name || "Qari Al-Qur'an";
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title || "Lantunan Al-Qur'an",
          artist: reciterName,
          album: currentTrack.suratNamaLatin
            ? `QS. ${currentTrack.suratNamaLatin}`
            : "Al-Qur'an Al-Karim",
        });

        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
        navigator.mediaSession.setActionHandler("play", () => togglePlayRef.current?.());
        navigator.mediaSession.setActionHandler("pause", () => togglePlayRef.current?.());
        navigator.mediaSession.setActionHandler(
          "previoustrack",
          hasPrev ? () => handlePrevTrackRef.current?.() : null
        );
        navigator.mediaSession.setActionHandler(
          "nexttrack",
          hasNext ? () => handleNextTrackRef.current?.() : null
        );
      } catch {}
    }
  }, [currentTrack, isPlaying, reciterKey, hasNext, hasPrev]);

  const drawCanvasFrame = useCallback(() => {
    const canvas = canvasPipRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#161E1B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#2D6A4F";
    ctx.fillRect(0, 0, canvas.width, 5);

    ctx.fillStyle = "#A3CFBB";
    ctx.font = "600 20px sans-serif";
    ctx.fillText(currentTrack?.title || "Al-Qur'an Al-Karim", 24, 44);

    ctx.fillStyle = "#9CA69F";
    ctx.font = "15px sans-serif";
    ctx.fillText(RECITERS[reciterKey || "05"]?.name || "Qari", 24, 72);

    if (currentTrack?.teksArab) {
      ctx.fillStyle = "#F5F2EA";
      ctx.font = "400 26px serif";
      ctx.textAlign = "right";
      const snippet =
        currentTrack.teksArab.length > 55
          ? currentTrack.teksArab.substring(0, 55) + "..."
          : currentTrack.teksArab;
      ctx.fillText(snippet, canvas.width - 24, 152);
      ctx.textAlign = "left";
    }

    if (currentTrack?.teksIndonesia) {
      ctx.fillStyle = "#D6D3CB";
      ctx.font = "italic 14px sans-serif";
      const transSnippet =
        currentTrack.teksIndonesia.length > 72
          ? currentTrack.teksIndonesia.substring(0, 72) + "..."
          : currentTrack.teksIndonesia;
      ctx.fillText(`"${transSnippet}"`, 24, 215);
    }
  }, [currentTrack, reciterKey]);

  const togglePictureInPicture = async () => {
    if (pipWindowRef.current) {
      try {
        pipWindowRef.current.close();
      } catch {}
      pipWindowRef.current = null;
      setPipContainer(null);
      setIsPipActive(false);
      return;
    }

    if (typeof window !== "undefined" && "documentPictureInPicture" in window) {
      try {
        const pipWin = await window.documentPictureInPicture.requestWindow({
          width: 440,
          height: 280,
        });
        pipWindowRef.current = pipWin;

        try {
          Array.from(document.styleSheets).forEach((styleSheet) => {
            try {
              if (styleSheet.href) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = styleSheet.href;
                pipWin.document.head.appendChild(link);
              } else if (styleSheet.cssRules) {
                const style = document.createElement("style");
                Array.from(styleSheet.cssRules).forEach((rule) => {
                  style.appendChild(document.createTextNode(rule.cssText));
                });
                pipWin.document.head.appendChild(style);
              }
            } catch {
              if (styleSheet.href) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = styleSheet.href;
                pipWin.document.head.appendChild(link);
              }
            }
          });
        } catch {}

        pipWin.document.body.style.margin = "0";
        pipWin.document.body.style.padding = "0";
        pipWin.document.body.style.backgroundColor = "#161E1B";
        pipWin.document.body.style.color = "#F5F2EA";
        pipWin.document.title = `Al-Qur'an — ${currentTrack?.title || "Murattal"}`;

        setPipContainer(pipWin.document.body);
        setIsPipActive(true);

        pipWin.addEventListener("pagehide", () => {
          pipWindowRef.current = null;
          setPipContainer(null);
          setIsPipActive(false);
        });
        return;
      } catch (err) {
        console.warn("Document PiP fallback:", err);
      }
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else if (videoPipRef.current && canvasPipRef.current) {
        drawCanvasFrame();
        if (!videoPipRef.current.srcObject) {
          const stream = canvasPipRef.current.captureStream(10);
          videoPipRef.current.srcObject = stream;
        }
        await videoPipRef.current.play();
        await videoPipRef.current.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (e) {
      console.warn("Video PiP fallback error:", e);
    }
  };

  useEffect(() => {
    if (isPipActive && canvasPipRef.current) {
      drawCanvasFrame();
    }
  }, [currentTrack, isPipActive, drawCanvasFrame]);

  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        try {
          pipWindowRef.current.close();
        } catch {}
      }
    };
  }, []);

  if (!currentTrack?.audioUrl) return null;

  return (
    <>
      <canvas ref={canvasPipRef} width={480} height={270} className="hidden" />
      <video ref={videoPipRef} playsInline muted className="hidden" />

      <div
        className={`fixed z-50 transition-all duration-300 pointer-events-none ${
          isMinimized
            ? "bottom-[66px] md:bottom-5 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-sm sm:w-auto"
            : "bottom-[66px] md:bottom-4 left-0 right-0 px-2 sm:px-6"
        }`}
      >
        <audio
          ref={audioRef}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => {
            setIsPlaying(true);
            onPlayStateChangeRef.current?.(true);
          }}
          onPause={() => {
            setIsPlaying(false);
            onPlayStateChangeRef.current?.(false);
          }}
        />

        {isMinimized ? (
          <div className="flex items-center justify-between gap-2.5 bg-[#161E1B]/95 text-stone-100 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white/10 pointer-events-auto w-full sm:w-auto">
            <div
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2.5 truncate cursor-pointer flex-1 min-w-0"
              title="Perbesar Pemutar"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800/70 flex items-center justify-center shrink-0">
                {isPlaying ? (
                  <div className="flex items-center gap-0.5 h-3.5">
                    <span className="w-0.5 h-2 bg-emerald-400 rounded audio-bar-1 inline-block" />
                    <span className="w-0.5 h-3 bg-emerald-400 rounded audio-bar-2 inline-block" />
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded audio-bar-3 inline-block" />
                  </div>
                ) : (
                  <Headphones className="w-4 h-4 text-emerald-300" />
                )}
              </div>
              <div className="truncate flex-1 min-w-0">
                <span className="text-xs font-semibold text-white truncate block">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] text-stone-400 truncate block">
                  {RECITERS[reciterKey || "05"]?.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center hover:bg-[#388060] transition-colors cursor-pointer"
                title={isPlaying ? "Jeda" : "Putar"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsZenOpen(true)}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Buka Ruang Khusyuk"
              >
                <Wind className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Perbesar"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-[#161E1B]/95 text-stone-100 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/10 pointer-events-auto">
            {/* Top Row */}
            <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
              <div className="truncate flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                    Murattal
                  </span>
                  {repeatCount > 1 && (
                    <span className="text-amber-200 text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                      Ulang {currentLoop}/{repeatCount === Infinity ? "∞" : repeatCount}
                    </span>
                  )}
                  {loopRange && (
                    <span className="text-emerald-200 text-[10px] bg-emerald-900/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span>
                        Blok Ayat {loopRange.startAyat}–{loopRange.endAyat}
                      </span>
                      {onClearLoopRange && (
                        <button
                          type="button"
                          onClick={onClearLoopRange}
                          aria-label="Hentikan ulang blok ayat"
                          className="hover:text-white cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
                  {currentTrack.title}
                </h4>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {setReciterKey && (
                  <select
                    aria-label="Pilih Qari"
                    value={reciterKey || "05"}
                    onChange={(e) => setReciterKey(e.target.value)}
                    className="hidden sm:block text-xs bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-stone-200 focus:outline-none max-w-[140px] truncate cursor-pointer"
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
                  onClick={() => setIsZenOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-stone-100 border border-white/10 flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
                  title="Buka Ruang Khusyuk (Layar Penuh & Suara Alam)"
                >
                  <Wind className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden sm:inline">Ruang Khusyuk</span>
                </button>

                <button
                  type="button"
                  onClick={togglePictureInPicture}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isPipActive
                      ? "bg-[#2D6A4F] text-white"
                      : "hover:bg-white/10 text-stone-400 hover:text-white"
                  }`}
                  title={isPipActive ? "Tutup Layar Mengambang" : "Layar Mengambang (PiP)"}
                >
                  <PictureInPicture2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Kecilkan Pemutar"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                {onClose && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Tutup Pemutar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrubber */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-stone-400 w-8 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                aria-label="Posisi audio"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[10px] text-stone-400 w-8 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-0.5 gap-1">
              <div className="flex items-center gap-1.5 shrink-0">
                {setRepeatCount && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextCycles = [1, 3, 5, 10, Infinity];
                      const currentIdx = nextCycles.indexOf(repeatCount || 1);
                      const next = nextCycles[(currentIdx + 1) % nextCycles.length];
                      setRepeatCount(next);
                      setCurrentLoop(1);
                    }}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                      repeatCount > 1
                        ? "bg-emerald-950 border-emerald-700 text-emerald-300 font-medium"
                        : "bg-white/5 border-white/10 text-stone-400 hover:text-stone-200"
                    }`}
                    title="Ulangi Ayat"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span className="text-[10px]">
                      {repeatCount === Infinity ? "∞" : `${repeatCount || 1}×`}
                    </span>
                  </button>
                )}

                {setReciterKey && (
                  <select
                    aria-label="Pilih Qari"
                    value={reciterKey || "05"}
                    onChange={(e) => setReciterKey(e.target.value)}
                    className="sm:hidden text-[10px] bg-white/10 border border-white/10 rounded-lg px-1.5 py-1 text-stone-200 max-w-[105px] truncate"
                  >
                    {Object.entries(RECITERS).map(([key, val]) => (
                      <option key={key} value={key} className="bg-stone-900 text-white">
                        {val.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  disabled={!hasPrev}
                  className="w-8 h-8 rounded-full hover:bg-white/10 text-stone-300 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                  title="Sebelumnya"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-[#2D6A4F] text-white hover:bg-[#388060] active:scale-95 flex items-center justify-center shadow transition-all cursor-pointer"
                  title={isPlaying ? "Jeda" : "Putar"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleNextTrack}
                  disabled={!hasNext}
                  className="w-8 h-8 rounded-full hover:bg-white/10 text-stone-300 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                  title="Selanjutnya"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="min-w-[52px] text-right shrink-0">
                <span className="text-[11px] text-stone-400">
                  {currentTrack.ayatNomor ? `Ayat ${currentTrack.ayatNomor}` : "Lengkap"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {pipContainer &&
        createPortal(
          <PipPortalContent
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            handleNextTrack={handleNextTrack}
            handlePrevTrack={handlePrevTrack}
            hasNext={hasNext}
            hasPrev={hasPrev}
            reciterName={RECITERS[reciterKey || "05"]?.name || "Misyari Rasyid"}
            currentTime={currentTime}
            duration={duration}
            formatTime={formatTime}
            onClosePip={togglePictureInPicture}
          />,
          pipContainer
        )}

      <AnimatedZenPlayer
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        handleNextTrack={handleNextTrack}
        handlePrevTrack={handlePrevTrack}
        hasNext={hasNext}
        hasPrev={hasPrev}
        currentTime={currentTime}
        duration={duration}
        handleSeek={handleSeek}
        formatTime={formatTime}
        reciterKey={reciterKey}
        setReciterKey={setReciterKey}
        repeatCount={repeatCount}
        setRepeatCount={setRepeatCount}
        currentLoop={currentLoop}
        transitioningToNext={transitioningToNext}
      />
    </>
  );
}

function PipPortalContent({
  currentTrack,
  isPlaying,
  togglePlay,
  handleNextTrack,
  handlePrevTrack,
  hasNext,
  hasPrev,
  reciterName,
  currentTime,
  duration,
  formatTime,
  onClosePip,
}) {
  return (
    <div className="bg-[#161E1B] text-stone-100 p-4 h-full min-h-screen flex flex-col justify-between select-none box-border">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="truncate">
          <h4 className="text-xs font-semibold text-white truncate leading-tight">
            {currentTrack?.title || "Al-Qur'an Al-Karim"}
          </h4>
          <p className="text-[10px] text-stone-400 truncate leading-tight">{reciterName}</p>
        </div>
        <button
          type="button"
          onClick={onClosePip}
          className="text-stone-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="my-auto py-3 text-center">
        {currentTrack?.teksArab ? (
          <p
            dir="rtl"
            className="text-xl sm:text-2xl text-[#F5F2EA] leading-loose font-arabic mb-2 text-center"
          >
            {currentTrack.teksArab}{" "}
            {currentTrack.ayatNomor ? formatAyatMarker(currentTrack.ayatNomor) : ""}
          </p>
        ) : (
          <p className="text-sm font-semibold text-white">{currentTrack?.title}</p>
        )}
        {currentTrack?.teksIndonesia && (
          <p className="text-xs text-stone-300 italic line-clamp-2 px-2">
            &quot;{currentTrack.teksIndonesia}&quot;
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1.5 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePrevTrack}
            disabled={!hasPrev}
            className="w-8 h-8 rounded-full hover:bg-white/10 text-stone-300 hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-[#2D6A4F] text-white hover:bg-[#388060] flex items-center justify-center cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={handleNextTrack}
            disabled={!hasNext}
            className="w-8 h-8 rounded-full hover:bg-white/10 text-stone-300 hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
