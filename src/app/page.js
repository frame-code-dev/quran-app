import React from "react";
import HomeClientView from "@/components/HomeClientView";

async function getSuratList() {
  try {
    const res = await fetch("https://equran.id/api/v2/surat", {
      next: { revalidate: 86400 }, // Cache 24 jam
    });
    const json = await res.json();
    return json?.data || [];
  } catch (error) {
    console.error("Gagal mengambil data surat:", error);
    return [];
  }
}

export const metadata = {
  title: "Al-Qur'an Al-Karim — Tilawah, Tafsir & Muraja'ah",
  description:
    "Ruang baca Al-Qur'an digital yang tenang dengan terjemahan Indonesia, murattal 5 qari, mode mushaf fokus, hafalan, dan tadabbur tafsir Kemenag RI.",
};

export default async function Home() {
  const suratList = await getSuratList();
  return <HomeClientView initialSuratList={suratList} />;
}
