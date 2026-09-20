import React from "react";
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
        title: `Surat ${data.data.namaLatin} (${data.data.nama}) - Qur'an App`,
        description: `Baca teks Arab, terjemahan, dengarkan murattal, mode hafalan, dan tadabbur Surat ${data.data.namaLatin}.`,
      };
    }
  } catch (e) {
    // fallback
  }
  return {
    title: "Surat - Qur'an App",
  };
}

export default async function SuratPage({ params, searchParams }) {
  const { surat, tafsir } = await getSuratData(params.nomor);
  const initialMode = searchParams?.mode || "read";

  if (!surat) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-md max-w-sm">
          <span className="text-4xl mb-3 block">⚠️</span>
          <h2 className="text-lg font-bold text-stone-900 mb-2">Surat Tidak Ditemukan</h2>
          <p className="text-xs text-stone-500 mb-4">
            Terjadi kendala saat memuat data surat nomor {params.nomor}.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return <SuratDetailView surat={surat} tafsirData={tafsir} initialMode={initialMode} />;
}
