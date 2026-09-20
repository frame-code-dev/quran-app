import React from "react";
import HomeClientView from "@/components/HomeClientView";

async function getSuratList() {
  try {
    const res = await fetch("https://equran.id/api/v2/surat", {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });
    const json = await res.json();
    return json?.data || [];
  } catch (error) {
    console.error("Gagal mengambil data surat:", error);
    return [];
  }
}

export const metadata = {
  title: "Qur'an App - Read, Listen, Memorize, Reflect",
  description: "Platform Al-Qur'an digital modern dan minimalis dengan 4 pilar utama: Read, Listen, Memorize, dan Reflect.",
};

export default async function Home() {
  const suratList = await getSuratList();
  return <HomeClientView initialSuratList={suratList} />;
}
