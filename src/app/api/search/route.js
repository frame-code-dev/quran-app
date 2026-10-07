import { NextResponse } from "next/server";
import { matchThematicTopics, parseSuratAyatPattern } from "@/utils/quranSearch";

export async function POST(request) {
  try {
    const body = await request.json();
    const query = (body?.query || "").trim();

    if (!query) {
      return NextResponse.json({ success: true, results: [], source: "empty" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Coba Semantic Search menggunakan Gemini AI jika GEMINI_API_KEY tersedia
    if (apiKey) {
      try {
        const prompt = `Anda adalah asisten pencarian cerdas Al-Qur'an (Islamic AI Search Engine).
Pengguna mencari ayat Al-Qur'an dengan kueri/topik/kondisi hidup: "${query}".

Tentukan 1 sampai 3 ayat Al-Qur'an yang PALING TEPAT dan RELEVAN.
Format respon WAJIB berupa JSON murni dengan struktur:
{
  "results": [
    {
      "suratNomor": (integer 1-114),
      "suratNamaLatin": (string nama surat, contoh: "Al-Baqarah", "Ar-Rum", "At-Talaq"),
      "nomorAyat": (integer nomor ayat),
      "judulTopik": (string ringkas 3-6 kata, contoh: "Ayat 1000 Dinar Rezeki", "Penciptaan Jodoh dan Pasangan"),
      "alasanRelevansi": (string 1-2 kalimat mengapa ayat ini menjawab topik pencarian),
      "teksIndonesia": (string terjemahan inti ayat yang relevan)
    }
  ]
}
Keluarkan HANYA JSON murni tanpa markdown triple backticks.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed?.results) && parsed.results.length > 0) {
              return NextResponse.json({
                success: true,
                source: "gemini_ai",
                results: parsed.results,
              });
            }
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini AI Search gagal, menggunakan fallback cerdas:", geminiErr);
      }
    }

    // 2. Fallback Cerdas Tematik Lokal & Regex Pattern
    const pattern = parseSuratAyatPattern(query);
    const thematic = matchThematicTopics(query);

    const fallbackResults = [];

    if (pattern) {
      fallbackResults.push({
        suratNomor: pattern.suratNomor,
        suratNamaLatin: pattern.suratNamaLatin,
        nomorAyat: pattern.nomorAyat,
        judulTopik: pattern.label,
        alasanRelevansi: `Ditemukan berdasarkan pencarian spesifik surat ${pattern.suratNamaLatin} ayat ${pattern.nomorAyat}.`,
        teksIndonesia: `QS. ${pattern.suratNamaLatin} : Ayat ${pattern.nomorAyat}`,
      });
    }

    thematic.forEach((item) => {
      fallbackResults.push({
        suratNomor: item.suratNomor,
        suratNamaLatin: item.suratNamaLatin,
        nomorAyat: item.nomorAyat,
        judulTopik: item.title,
        alasanRelevansi: item.description,
        teksIndonesia: `${item.title} (${item.ayatRange})`,
      });
    });

    return NextResponse.json({
      success: true,
      source: "thematic_fallback",
      results: fallbackResults,
    });
  } catch (error) {
    console.error("Error pada /api/search:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pencarian cerdas" },
      { status: 500 }
    );
  }
}
