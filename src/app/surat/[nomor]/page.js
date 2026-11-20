import React from "react";
import Link from "next/link";
import SuratDetailView from "@/components/SuratDetailView";

async function getSuratData(nomor) {
  try {
    const [suratRes, tafsirRes] = await Promise.all([
      fetch(`https://equran.id/api/v2/surat/${nomor}`, { next: { revalidate: 3600 } }),
      fetch(`https://equran.id/api/v2/tafsir/${nomor}`, { next: { revalidate: 3600 } }),
    ]);

    const suratData = await suratRes.json();
    const tafsirData = await tafsirRes.json();

    return {
      surat: suratData?.data || null,
      tafsir: tafsirData?.data || null,
    };
  } catch (error) {
    console.error("Gagal memuat data surat/tafsir:", error);
    return { surat: null, tafsir: null };
  }
}

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`https://equran.id/api/v2/surat/${params.nomor}`);
    const data = await res.json();
    if (data?.data) {
      return {
        title: `Surat ${data.data.namaLatin} (${data.data.nama}) — Al-Qur'an Al-Karim`,
        description: `Baca Surat ${data.data.namaLatin} lengkap dengan terjemahan Indonesia, tafsir Kemenag RI, murattal 5 qari, mode mushaf fokus, dan muraja'ah hafalan.`,
      };
    }
  } catch {
    // fallback
  }
  return {
    title: "Surat — Al-Qur'an Al-Karim",
  };
}

export default async function SuratPage({ params, searchParams }) {
  const { surat, tafsir } = await getSuratData(params.nomor);
  const initialMode = searchParams?.mode || "read";

  if (!surat) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="surface-card p-8 rounded-3xl border border-theme max-w-sm space-y-3">
          <h1 className="font-editorial text-xl font-semibold ink-primary">
            Surat Tidak Ditemukan
          </h1>
          <p className="text-xs ink-secondary leading-relaxed">
            Data surat nomor {params.nomor} belum dapat dimuat saat ini. Periksa koneksi internet
            Anda atau kembali ke daftar surat.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-[#1B4332] hover:bg-[#245640] text-white text-xs font-medium rounded-xl transition-colors"
          >
            Kembali ke Daftar Surat
          </Link>
        </div>
      </div>
    );
  }

  return <SuratDetailView surat={surat} tafsirData={tafsir} initialMode={initialMode} />;
}
