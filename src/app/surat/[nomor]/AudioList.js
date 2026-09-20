"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export const RECITERS_MAP = {
  "05": "Misyari-Rasyid-Al-Afasi",
  "03": "Abdurrahman-as-Sudais",
  "01": "Abdullah-Al-Juhany",
  "02": "Abdul-Muhsin-Al-Qasim",
  "04": "Ibrahim-Al-Dossari",
};

const AudioList = ({ surat }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reciter = searchParams.get("reciter") || "05";

  const handleReciterChange = (event) => {
    const params = new URLSearchParams(searchParams);
    params.set("reciter", event.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-stone-600">Pilih Qari:</label>
        <select
          onChange={handleReciterChange}
          value={reciter}
          className="p-2 border border-stone-200 rounded-xl bg-white text-xs text-stone-800 focus:ring-2 focus:ring-emerald-500"
        >
          {Object.entries(RECITERS_MAP).map(([key, name]) => (
            <option key={key} value={key}>
              {name.replace(/-/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {surat.ayat.map((ayat) => (
          <div
            key={ayat.nomorAyat}
            className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs">
                {ayat.nomorAyat}
              </span>
              <p className="font-arabic text-xl text-emerald-950 font-bold">{ayat.teksArab}</p>
            </div>
            <p className="text-xs text-stone-600 italic">{ayat.teksIndonesia}</p>
            <audio controls className="w-full h-8 mt-1">
              <source
                src={ayat.audio?.[reciter] || Object.values(ayat.audio || {})[0]}
                type="audio/mpeg"
              />
              Browser Anda tidak mendukung elemen audio.
            </audio>
          </div>
        ))}
      </div>
    </div>
  );
  //taraw
};

export default AudioList;
