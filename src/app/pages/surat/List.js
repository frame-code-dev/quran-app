import React from "react";
import SuratCard from "@/components/SuratCard";

async function getSuratData() {
  try {
    const res = await fetch("https://equran.id/api/v2/surat", { next: { revalidate: 86400 } });
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    return [];
  }
}

export default async function ListSurat() {
  const surats = await getSuratData();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {surats.map((surat) => (
        <SuratCard key={surat.nomor} surat={surat} />
      ))}
    </div>
  );
}
