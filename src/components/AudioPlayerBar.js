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
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  X,
} from "lucide-react";

export const RECITERS = {
  "05": { name: "Misyari Rasyid Al-Afasi", slug: "Misyari-Rasyid-Al-Afasi" },
  "03": { name: "Abdurrahman as-Sudais", slug: "Abdurrahman-as-Sudais" },
  "01": { name: "Abdullah Al-Juhany", slug: "Abdullah-Al-Juhany" },
  "02": { name: "Abdul-Muhsin Al-Qasim", slug: "Abdul-Muhsin-Al-Qasim" },
  "04": { name: "Ibrahim Al-Dossari", slug: "Ibrahim-Al-Dossari" },
};

export default function AudioPlayerBar({
  currentTrack, // { title, audioUrl, ayatNomor, totalAyat, teksArab, teksIndonesia, suratNamaLatin }
  playlist, // array of ayat objects: [ { nomorAyat, audio, ... } ]
  currentIndex, // number (0, 1, 2, ...)
  onTrackChange, // (newIndex) => void
  onClose,
  reciterKey,
  setReciterKey,
  repeatCount,
  setRepeatCount,
  onPlayStateChange,
  onNext,
  onPrev,
  toggleRef,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLoop, setCurrentLoop] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);

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

  // Playback sync when track changes from outside
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    setCurrentLoop(1);

    // Only set src and call play if the audio URL has actually changed
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
      } catch (e) {
        // ignore
      }
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

  const handleEnded = () => {
    if (repeatCount && currentLoop < repeatCount) {
      setCurrentLoop((prev) => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
      return;
    }

    if (playlist && currentIndex !== null && currentIndex !== undefined) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < playlist.length) {
        const nextAyat = playlist[nextIndex];
        const nextAudioUrl =
          nextAyat.audio?.[reciterKey || "05"] || Object.values(nextAyat.audio || {})[0];

        setCurrentLoop(1);

        if (audioRef.current && nextAudioUrl) {
          audioRef.current.src = nextAudioUrl;
          audioRef.current.currentTime = 0;
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              onPlayStateChangeRef.current?.(true);
            })
            .catch((e) => console.warn("Gapless auto-advance error:", e));
        }

        if (onTrackChange) {
          onTrackChange(nextIndex);
        }
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
        const nextAyat = playlist[nextIndex];
        const nextAudioUrl =
          nextAyat.audio?.[reciterKey || "05"] || Object.values(nextAyat.audio || {})[0];

        if (audioRef.current && nextAudioUrl) {
          audioRef.current.src = nextAudioUrl;
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.warn);
        }
        setCurrentLoop(1);
        if (onTrackChange) onTrackChange(nextIndex);
      }
    } else if (onNext) {
      onNext();
    }
  };

  const handlePrevTrack = () => {
    if (playlist && currentIndex !== null && currentIndex !== undefined) {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        const prevAyat = playlist[prevIndex];
        const prevAudioUrl =
          prevAyat.audio?.[reciterKey || "05"] || Object.values(prevAyat.audio || {})[0];

        if (audioRef.current && prevAudioUrl) {
          audioRef.current.src = prevAudioUrl;
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.warn);
        }
        setCurrentLoop(1);
        if (onTrackChange) onTrackChange(prevIndex);
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
      ? currentIndex < playlist.length - 1
      : !!onNext;
  const hasPrev =
    playlist && currentIndex !== null && currentIndex !== undefined
      ? currentIndex > 0
      : !!onPrev;

  const handleNextTrackRef = useRef(handleNextTrack);
  const handlePrevTrackRef = useRef(handlePrevTrack);
  const togglePlayRef = useRef(togglePlay);
  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
    handlePrevTrackRef.current = handlePrevTrack;
    togglePlayRef.current = togglePlay;
  });

  // Global Media Session API Integration
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
            : "Al-Qur'anul Karim",
          artwork: [
            {
              src: "https://equran.nos.wjv-1.neo.id/assets/quran-icon.png",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        });

        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

        navigator.mediaSession.setActionHandler("play", () => togglePlayRef.current?.());
        navigator.mediaSession.setActionHandler("pause", () => togglePlayRef.current?.());
        navigator.mediaSession.setActionHandler("previoustrack", hasPrev ? () => handlePrevTrackRef.current?.() : null);
        navigator.mediaSession.setActionHandler("nexttrack", hasNext ? () => handleNextTrackRef.current?.() : null);
      } catch (e) {
        // ignore MediaMetadata error
      }
    }
  }, [currentTrack, isPlaying, reciterKey, hasNext, hasPrev]);

  // Picture-in-Picture Toggle Handler
  const togglePictureInPicture = async () => {
    // 1. If Document PiP is open, close it
    if (pipWindowRef.current) {
      try {
        pipWindowRef.current.close();
      } catch (e) {
        // ignore
      }
      pipWindowRef.current = null;
      setPipContainer(null);
      setIsPipActive(false);
      return;
    }

    // 2. If modern Document Picture-in-Picture is supported
    if (typeof window !== "undefined" && "documentPictureInPicture" in window) {
      try {
        const pipWin = await window.documentPictureInPicture.requestWindow({
          width: 440,
          height: 280,
        });
        pipWindowRef.current = pipWin;

        // Copy styles to PiP window
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
            } catch (err) {
              if (styleSheet.href) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = styleSheet.href;
                pipWin.document.head.appendChild(link);
              }
            }
          });
        } catch (e) {
          // ignore styling copy errors
        }

        pipWin.document.body.style.margin = "0";
        pipWin.document.body.style.padding = "0";
        pipWin.document.body.style.backgroundColor = "#1c1917";
        pipWin.document.body.style.color = "#f5f5f4";
        pipWin.document.title = `Qur'an PiP - ${currentTrack?.title || "Audio"}`;

        setPipContainer(pipWin.document.body);
        setIsPipActive(true);

        pipWin.addEventListener("pagehide", () => {
          pipWindowRef.current = null;
          setPipContainer(null);
          setIsPipActive(false);
        });
        return;
      } catch (err) {
        console.warn("Document PiP request error, falling back to Video PiP:", err);
      }
    }

    // 3. Fallback: Canvas to Video Picture-in-Picture
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

  const drawCanvasFrame = useCallback(() => {
    const canvas = canvasPipRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1c1917";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Accent header
    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, 0, canvas.width, 6);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(currentTrack?.title || "Al-Qur'an Recitation", 24, 45);

    ctx.fillStyle = "#a8a29e";
    ctx.font = "16px sans-serif";
    ctx.fillText(RECITERS[reciterKey || "05"]?.name || "Qari", 24, 75);

    if (currentTrack?.teksArab) {
      ctx.fillStyle = "#fef3c7";
      ctx.font = "bold 26px serif";
      ctx.textAlign = "right";
      const snippet =
        currentTrack.teksArab.length > 55
          ? currentTrack.teksArab.substring(0, 55) + "..."
          : currentTrack.teksArab;
      ctx.fillText(snippet, canvas.width - 24, 155);
      ctx.textAlign = "left";
    }

    if (currentTrack?.teksIndonesia) {
      ctx.fillStyle = "#e7e5e4";
      ctx.font = "italic 15px sans-serif";
      const transSnippet =
        currentTrack.teksIndonesia.length > 70
          ? currentTrack.teksIndonesia.substring(0, 70) + "..."
          : currentTrack.teksIndonesia;
      ctx.fillText(`"${transSnippet}"`, 24, 215);
    }
  }, [currentTrack, reciterKey]);

  useEffect(() => {
    if (isPipActive && canvasPipRef.current) {
      drawCanvasFrame();
    }
  }, [currentTrack, isPipActive, drawCanvasFrame]);

  // Clean up PiP window when component unmounts
  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        try {
          pipWindowRef.current.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  if (!currentTrack?.audioUrl) return null;

  return (
    <>
      {/* Hidden canvas and video for Video PiP fallback */}
      <canvas ref={canvasPipRef} width={480} height={270} className="hidden" />
      <video ref={videoPipRef} playsInline muted className="hidden" />

      {/* Floating Audio Player Bar */}
      <div
        className={`fixed z-50 transition-all duration-300 pointer-events-none ${
          isMinimized
            ? "bottom-16 sm:bottom-6 right-3 sm:right-6 left-auto max-w-sm w-auto"
            : "bottom-16 sm:bottom-4 left-0 right-0 px-3 sm:px-6"
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

        {/* Minimized View (Compact Floating Island / Pill) */}
        {isMinimized ? (
          <div className="flex items-center justify-between gap-3 bg-stone-900/95 text-stone-100 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-stone-800 pointer-events-auto transition-all">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0">
                {isPlaying ? (
                  <div className="flex items-center gap-0.5 h-3.5">
                    <span className="w-0.5 h-2 bg-emerald-400 rounded audio-bar-1 inline-block"></span>
                    <span className="w-0.5 h-3 bg-emerald-400 rounded audio-bar-2 inline-block"></span>
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded audio-bar-3 inline-block"></span>
                  </div>
                ) : (
                  <Headphones className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className="truncate max-w-[120px] sm:max-w-[170px]">
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
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs hover:bg-emerald-600 transition-colors shadow-sm"
                title={isPlaying ? "Jeda (Pause)" : "Putar (Play)"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              <button
                onClick={togglePictureInPicture}
                className={`p-1.5 rounded-lg transition-colors ${
                  isPipActive
                    ? "bg-emerald-800 text-white"
                    : "text-stone-400 hover:text-white hover:bg-stone-800"
                }`}
                title="Picture-in-Picture (Layar Mengambang)"
              >
                <PictureInPicture2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(false)}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
                title="Perbesar Player"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {onClose && (
                <button
                  onClick={handleClose}
                  className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
                  title="Tutup Player"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Full Player View */
          <div className="max-w-2xl mx-auto bg-stone-900/95 text-stone-100 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-2xl border border-stone-800 pointer-events-auto transition-all duration-300">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="truncate flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300 text-[10px] font-semibold uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    Murattal
                  </span>
                  {repeatCount > 1 && (
                    <span className="text-amber-200 text-[10px] bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">
                      Putaran: {currentLoop}/{repeatCount === Infinity ? "∞" : repeatCount}
                    </span>
                  )}
                  {isPipActive && (
                    <span className="text-emerald-300 text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700 flex items-center gap-1">
                      <PictureInPicture2 className="w-2.5 h-2.5" />
                      PiP Aktif
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white truncate mt-1">{currentTrack.title}</h4>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Qari selector */}
                {setReciterKey && (
                  <select
                    value={reciterKey || "05"}
                    onChange={(e) => setReciterKey(e.target.value)}
                    className="text-xs bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 max-w-[130px] truncate"
                  >
                    {Object.entries(RECITERS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Picture-in-Picture Button */}
                <button
                  onClick={togglePictureInPicture}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isPipActive
                      ? "bg-emerald-800 text-white"
                      : "hover:bg-stone-800 text-stone-400 hover:text-white"
                  }`}
                  title={
                    isPipActive
                      ? "Tutup Picture-in-Picture"
                      : "Picture-in-Picture (Layar Mengambang)"
                  }
                >
                  <PictureInPicture2 className="w-3.5 h-3.5" />
                </button>

                {/* Minimize Button */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-7 h-7 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                  title="Kecilkan Player (Minimize)"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                {onClose && (
                  <button
                    onClick={handleClose}
                    className="w-7 h-7 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                    title="Tutup Player"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrubber slider */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-stone-400 w-8 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] text-stone-400 w-8">{formatTime(duration)}</span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-1">
              {/* Loop Repeat Button */}
              <div className="flex items-center gap-1">
                {setRepeatCount && (
                  <button
                    onClick={() => {
                      const nextCycles = [1, 3, 5, 10, Infinity];
                      const currentIdx = nextCycles.indexOf(repeatCount || 1);
                      const next = nextCycles[(currentIdx + 1) % nextCycles.length];
                      setRepeatCount(next);
                      setCurrentLoop(1);
                    }}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                      repeatCount > 1
                        ? "bg-emerald-950 border-emerald-700 text-emerald-300 font-semibold"
                        : "bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200"
                    }`}
                    title="Ulangi Ayat (Hafalan Loop)"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span className="text-[10px]">
                      {repeatCount === Infinity ? "∞" : `${repeatCount || 1}x`}
                    </span>
                  </button>
                )}
              </div>

              {/* Main controls (Prev, Play, Next) */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevTrack}
                  disabled={!hasPrev}
                  className="w-8 h-8 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-colors"
                  title="Ayat Sebelumnya"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-emerald-700 text-white hover:bg-emerald-600 flex items-center justify-center text-base shadow-lg transition-transform hover:scale-105"
                  title={isPlaying ? "Jeda (Pause)" : "Putar (Play)"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={handleNextTrack}
                  disabled={!hasNext}
                  className="w-8 h-8 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-colors"
                  title="Ayat Selanjutnya"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="w-16 text-right">
                <span className="text-[11px] text-stone-400">
                  {currentTrack.ayatNomor ? `Ayat ${currentTrack.ayatNomor}` : "Full Surat"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Picture-in-Picture Portal Window */}
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
    </>
  );
}

// React component rendered inside the Document Picture-in-Picture window
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
    <div className="bg-stone-900 text-stone-100 p-4 h-full min-h-screen flex flex-col justify-between select-none box-border">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate leading-tight">
              {currentTrack?.title || "Al-Qur'an"}
            </h4>
            <p className="text-[10px] text-stone-400 truncate leading-tight">{reciterName}</p>
          </div>
        </div>
        <button
          onClick={onClosePip}
          className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition-colors"
          title="Tutup PiP"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Arabic & Indonesian translation */}
      <div className="my-auto py-3 text-center">
        {currentTrack?.teksArab ? (
          <p
            dir="rtl"
            className="text-xl sm:text-2xl font-bold text-emerald-300 leading-relaxed font-arabic mb-2"
          >
            {currentTrack.teksArab}
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

      {/* Footer Controls */}
      <div className="pt-2 border-t border-stone-800">
        <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1.5 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevTrack}
            disabled={!hasPrev}
            className="w-8 h-8 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors"
            title="Ayat Sebelumnya"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-emerald-700 text-white hover:bg-emerald-600 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            title={isPlaying ? "Jeda" : "Putar"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={handleNextTrack}
            disabled={!hasNext}
            className="w-8 h-8 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors"
            title="Ayat Selanjutnya"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
