"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Headphones, Brain, Sparkles } from "lucide-react";

export default function SuratCard({ surat, onQuickAction }) {
  const router = useRouter();
  const isMekah = surat.tempatTurun?.toLowerCase() === "mekah";

  const handleCardClick = (e) => {
    // If clicked inside interactive buttons or action links, let them handle it
    if (e.target.closest("button, a")) return;
    router.push(`/surat/${surat.nomor}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-700/40 p-4 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.99] flex flex-col justify-between cursor-pointer"
    >
      {/* Top row: Number badge & Arabic Name */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          {/* Circular badge */}
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 group-hover:bg-emerald-800 group-hover:text-stone-100 flex items-center justify-center font-bold text-sm transition-colors duration-200 border border-stone-200/60 shrink-0">
            {surat.nomor}
          </div>
          <div>
            <Link
              href={`/surat/${surat.nomor}`}
              className="font-bold text-stone-900 group-hover:text-emerald-850 text-base transition-colors line-clamp-1 before:absolute before:inset-0 before:z-0"
            >
              {surat.namaLatin}
            </Link>
            <p className="text-xs text-stone-500 line-clamp-1">{surat.arti}</p>
          </div>
        </div>

        {/* Calligraphy in Arabic */}
        <div className="text-right">
          <span className="font-arabic text-2xl text-emerald-950 font-bold group-hover:text-emerald-800 transition-colors">
            {surat.nama}
          </span>
        </div>
      </div>

      {/* Info Pills & Quick Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              isMekah
                ? "bg-stone-100 text-stone-700 border-stone-200"
                : "bg-emerald-50/70 text-emerald-800 border-emerald-200/50"
            }`}
          >
            {surat.tempatTurun}
          </span>
          <span className="text-stone-400">•</span>
          <span>{surat.jumlahAyat} Ayat</span>
        </div>

        {/* 4 Quick Mode Action Links - Isolated with z-10 */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
        >
          <Link
            href={`/surat/${surat.nomor}?mode=read`}
            onClick={(e) => e.stopPropagation()}
            title="Baca Surat"
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-emerald-800 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickAction) onQuickAction("listen");
            }}
            title="Dengarkan Murattal"
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-emerald-800 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>
          <Link
            href={`/surat/${surat.nomor}?mode=memorize`}
            onClick={(e) => e.stopPropagation()}
            title="Mode Hafalan"
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-emerald-800 transition-colors"
          >
            <Brain className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/surat/${surat.nomor}?mode=reflect`}
            onClick={(e) => e.stopPropagation()}
            title="AI Tadabbur / Refleksi"
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-emerald-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
