"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Headphones, BookmarkCheck } from "lucide-react";

export default function SuratCard({ surat, onQuickAction, memorizeStats }) {
  const router = useRouter();

  const handleCardClick = (e) => {
    if (e.target.closest("button, a")) return;
    router.push(`/surat/${surat.nomor}`);
  };

  const mutqin = memorizeStats?.mutqin || 0;
  const proses = memorizeStats?.proses || 0;
  const hasProgress = mutqin > 0 || proses > 0;
  const mutqinPct = hasProgress ? Math.round((mutqin / surat.jumlahAyat) * 100) : 0;

  return (
    <article
      onClick={handleCardClick}
      className="group relative surface-card rounded-2xl border border-theme hover:border-[var(--brand-brass)] p-4 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Row: Geometric Surah Number + Name + Arabic Calligraphy */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Traditional diamond/octagon Mushaf badge */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <span
              className="absolute inset-1 rotate-45 rounded-[6px] surface-elevated border border-theme group-hover:bg-[#1B4332] group-hover:border-[#1B4332] transition-colors"
              aria-hidden="true"
            />
            <span className="relative z-10 text-xs font-semibold ink-primary group-hover:text-white transition-colors tabular-nums">
              {surat.nomor}
            </span>
          </div>

          <div className="min-w-0">
            <Link
              href={`/surat/${surat.nomor}`}
              className="font-semibold ink-primary group-hover:text-emerald-700 text-[15px] transition-colors line-clamp-1 before:absolute before:inset-0 before:z-0"
            >
              {surat.namaLatin}
            </Link>
            <p className="text-xs ink-muted line-clamp-1 mt-0.5">{surat.arti}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-arabic text-2xl ink-arabic group-hover:text-emerald-800 transition-colors leading-none block">
            {surat.nama}
          </span>
        </div>
      </div>

      {/* Optional Memorize Progress Line */}
      {hasProgress && (
        <div className="mb-2.5 space-y-1">
          <div className="w-full h-1 rounded-full surface-elevated overflow-hidden flex">
            <div
              className="h-full bg-[#2D6A4F]"
              style={{ width: `${(mutqin / surat.jumlahAyat) * 100}%` }}
            />
            <div
              className="h-full bg-[#C8A978]"
              style={{ width: `${(proses / surat.jumlahAyat) * 100}%` }}
            />
          </div>
          <p className="text-[10px] ink-muted">
            Hafalan: <span className="font-medium ink-primary">{mutqin} mutqin</span>
            {proses > 0 ? `, ${proses} proses` : ""} ({mutqinPct}%)
          </p>
        </div>
      )}

      {/* Bottom Meta & Restrained Quick Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-theme text-[11px] ink-muted">
        <div className="flex items-center gap-1.5">
          <span>{surat.tempatTurun}</span>
          <span>•</span>
          <span>{surat.jumlahAyat} Ayat</span>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 flex items-center gap-1"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickAction) onQuickAction("listen");
            }}
            title={`Dengarkan Murattal ${surat.namaLatin}`}
            aria-label={`Dengarkan Murattal ${surat.namaLatin}`}
            className="p-1.5 rounded-lg ink-muted hover:ink-primary hover:bg-black/5 transition-colors cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>
          <Link
            href={`/surat/${surat.nomor}?mode=memorize`}
            onClick={(e) => e.stopPropagation()}
            title={`Muraja'ah Hafalan ${surat.namaLatin}`}
            aria-label={`Muraja'ah Hafalan ${surat.namaLatin}`}
            className="p-1.5 rounded-lg ink-muted hover:ink-primary hover:bg-black/5 transition-colors"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
