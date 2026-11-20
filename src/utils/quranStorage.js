// Utilitas penyimpanan lokal (localStorage), format angka Arab, dan pintasan sunnah kontekstual

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicNumber(num) {
  if (num === null || num === undefined) return "";
  return String(num).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

export function formatAyatMarker(num) {
  return `﴿${toArabicNumber(num)}﴾`;
}

function notifyStorageChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("quran-storage-update"));
  }
}

// --- 1. Bacaan Terakhir (Backward-compatible key: quran_last_read) ---
export function getLastRead() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("quran_last_read");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastRead(payload) {
  if (typeof window === "undefined") return;
  try {
    const data = {
      ...payload,
      timestamp: payload?.timestamp || Date.now(),
    };
    localStorage.setItem("quran_last_read", JSON.stringify(data));
    notifyStorageChange();
  } catch {
    // ignore quota errors
  }
}

// --- 2. Koleksi Ayat Tersimpan / Multi-Bookmark (quran_bookmarks) ---
export function getBookmarks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("quran_bookmarks");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isAyatBookmarked(suratNomor, nomorAyat) {
  const list = getBookmarks();
  return list.some(
    (b) => Number(b.suratNomor) === Number(suratNomor) && Number(b.nomorAyat) === Number(nomorAyat)
  );
}

export function toggleBookmark(ayatPayload) {
  if (typeof window === "undefined") return { saved: false, list: [] };
  const list = getBookmarks();
  const idx = list.findIndex(
    (b) =>
      Number(b.suratNomor) === Number(ayatPayload.suratNomor) &&
      Number(b.nomorAyat) === Number(ayatPayload.nomorAyat)
  );

  let next;
  let saved;
  if (idx !== -1) {
    next = list.filter((_, i) => i !== idx);
    saved = false;
  } else {
    next = [
      {
        suratNomor: Number(ayatPayload.suratNomor),
        suratNamaLatin: ayatPayload.suratNamaLatin,
        nomorAyat: Number(ayatPayload.nomorAyat),
        teksArab: ayatPayload.teksArab || "",
        teksIndonesia: ayatPayload.teksIndonesia || "",
        savedAt: Date.now(),
      },
      ...list,
    ];
    saved = true;
  }

  try {
    localStorage.setItem("quran_bookmarks", JSON.stringify(next));
    notifyStorageChange();
  } catch {
    // ignore
  }
  return { saved, list: next };
}

export function removeBookmark(suratNomor, nomorAyat) {
  if (typeof window === "undefined") return [];
  const next = getBookmarks().filter(
    (b) =>
      !(
        Number(b.suratNomor) === Number(suratNomor) &&
        Number(b.nomorAyat) === Number(nomorAyat)
      )
  );
  try {
    localStorage.setItem("quran_bookmarks", JSON.stringify(next));
    notifyStorageChange();
  } catch {
    // ignore
  }
  return next;
}

// --- 3. Catatan Tadabbur Pribadi / Jurnal Hati (quran_notes) ---
export function getAllNotes() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("quran_notes");
    const map = raw ? JSON.parse(raw) : {};
    return Object.entries(map)
      .map(([key, value]) => ({ key, ...value }))
      .filter((item) => item.text && item.text.trim().length > 0)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch {
    return [];
  }
}

export function getAyatNote(suratNomor, nomorAyat) {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("quran_notes");
    const map = raw ? JSON.parse(raw) : {};
    const key = `${suratNomor}:${nomorAyat}`;
    return map[key]?.text || "";
  } catch {
    return "";
  }
}

export function saveAyatNote(suratNomor, nomorAyat, suratNamaLatin, text) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("quran_notes");
    const map = raw ? JSON.parse(raw) : {};
    const key = `${suratNomor}:${nomorAyat}`;
    const trimmed = (text || "").trim();
    if (!trimmed) {
      delete map[key];
    } else {
      map[key] = {
        suratNomor: Number(suratNomor),
        nomorAyat: Number(nomorAyat),
        suratNamaLatin: suratNamaLatin || "",
        text: trimmed,
        updatedAt: Date.now(),
      };
    }
    localStorage.setItem("quran_notes", JSON.stringify(map));
    notifyStorageChange();
  } catch {
    // ignore
  }
}

// --- 4. Ringkasan Progress Hafalan (Backward-compatible keys: quran_memorize_{nomor}) ---
export function getAllMemorizeProgress() {
  if (typeof window === "undefined") return {};
  const summary = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("quran_memorize_")) {
        const nomor = parseInt(key.replace("quran_memorize_", ""), 10);
        if (!isNaN(nomor)) {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          const values = Object.values(data);
          const mutqin = values.filter((v) => v === "mutqin").length;
          const proses = values.filter((v) => v === "proses").length;
          if (mutqin > 0 || proses > 0) {
            summary[nomor] = { mutqin, proses };
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return summary;
}

// --- 5. Tema Bacaan (system | mushaf | light | dark) & Color-Scheme Meta Sync ---
export function getReadingTheme() {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem("quran_reading_theme");
    if (saved === "mushaf" || saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // ignore
  }
  return "system";
}

export function applyReadingTheme(theme) {
  if (typeof window === "undefined") return;
  const meta = document.querySelector('meta[name="color-scheme"]');

  if (theme === "system") {
    delete document.documentElement.dataset.theme;
    if (meta) meta.setAttribute("content", "light dark");
    try {
      localStorage.removeItem("quran_reading_theme");
      notifyStorageChange();
    } catch {
      // ignore
    }
    return;
  }

  const validTheme = theme === "dark" || theme === "light" || theme === "mushaf" ? theme : "mushaf";
  document.documentElement.dataset.theme = validTheme;
  if (meta) {
    meta.setAttribute("content", validTheme === "dark" ? "dark" : "light");
  }

  try {
    localStorage.setItem("quran_reading_theme", validTheme);
    notifyStorageChange();
  } catch {
    // ignore
  }
}

// --- 6. Konteks Waktu & Pintasan Surat Sunnah Harian ---
export function getContextualGreetingAndSunnah(now = new Date()) {
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Minggu, 4 = Kamis, 5 = Jumat

  const isFridayWindow = (day === 4 && hour >= 18) || (day === 5 && hour < 18);
  const isNight = hour >= 19 || hour < 4;
  const isMorning = hour >= 4 && hour < 11;

  let timeLabel = "Tilawah Harian";
  let subtitle =
    "Luangkan jeda sejenak untuk membaca, menyimak murattal, dan merenungi petunjuk Al-Qur'an.";

  if (isFridayWindow) {
    timeLabel = "Keutamaan Hari Jumat";
    subtitle = "Disunnahkan membaca Surat Al-Kahf sebagai penerang di antara dua Jumat.";
  } else if (isMorning) {
    timeLabel = "Tilawah Pagi";
    subtitle = "Awali langkah hari ini dengan ketenangan kalam Ilahi sebelum kesibukan dimulai.";
  } else if (isNight) {
    timeLabel = "Tilawah Malam";
    subtitle = "Tutup hari dengan lantunan yang meneduhkan hati, seperti Surat Al-Mulk sebelum beristirahat.";
  } else if (hour >= 15 && hour < 19) {
    timeLabel = "Jeda Petang";
    subtitle = "Sejenak menepi di penghujung sore untuk membasahi lisan dengan tilawah dan zikir.";
  }

  const shortcuts = [
    {
      id: "kahf",
      label: "Al-Kahf",
      note: isFridayWindow ? "Sunnah Jumat" : "Surat ke-18",
      href: "/surat/18",
      featured: isFridayWindow,
    },
    {
      id: "mulk",
      label: "Al-Mulk",
      note: isNight ? "Sebelum Tidur" : "Surat ke-67",
      href: "/surat/67",
      featured: !isFridayWindow && isNight,
    },
    {
      id: "ayat-kursi",
      label: "Ayat Kursi",
      note: "Al-Baqarah: 255",
      href: "/surat/2?ayat=255#ayat-255",
      featured: false,
    },
    {
      id: "yasin",
      label: "Yasin",
      note: "Surat ke-36",
      href: "/surat/36",
      featured: false,
    },
    {
      id: "ar-rahman",
      label: "Ar-Rahman",
      note: "Surat ke-55",
      href: "/surat/55",
      featured: false,
    },
    {
      id: "al-waqiah",
      label: "Al-Waqi'ah",
      note: "Surat ke-56",
      href: "/surat/56",
      featured: false,
    },
  ];

  // Put featured shortcut first
  shortcuts.sort((a, b) => Number(b.featured) - Number(a.featured));

  return { timeLabel, subtitle, shortcuts };
}

// --- 7. Native <dialog> outside-click fallback (when closedBy is unsupported, e.g. Safari) ---
export function attachDialogOutsideClickFallback(dialogEl, onDismiss) {
  if (!dialogEl || typeof window === "undefined") return () => {};
  if ("closedBy" in HTMLDialogElement.prototype) return () => {};

  const isOutside = (e) => {
    const rect = dialogEl.getBoundingClientRect();
    return (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    );
  };

  let pressedOutside = false;
  const handleDown = (e) => {
    pressedOutside = isOutside(e);
  };
  const handleUp = (e) => {
    if (pressedOutside && isOutside(e)) {
      onDismiss();
    }
    pressedOutside = false;
  };

  dialogEl.addEventListener("pointerdown", handleDown);
  dialogEl.addEventListener("pointerup", handleUp);

  return () => {
    dialogEl.removeEventListener("pointerdown", handleDown);
    dialogEl.removeEventListener("pointerup", handleUp);
  };
}
