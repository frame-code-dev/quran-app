import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nomorSurat, namaSurat, nomorAyat, teksArab, teksIndonesia, tafsir } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Anda adalah seorang ahli tadabbur Al-Qur'an dan psikologi Islam yang bijak, hangat, dan menyejukkan hati.
Bantu renungkan ayat berikut:
- Surat: ${namaSurat || nomorSurat} ayat ${nomorAyat}
- Teks Arab: ${teksArab || ""}
- Terjemahan: "${teksIndonesia || ""}"
${tafsir ? `- Catatan Tafsir: "${tafsir.slice(0, 500)}..."` : ""}

Berikan tadabbur mendalam dan terstruktur dalam format JSON dengan key:
1. "konteks": (1-2 kalimat pesan pokok ayat ini)
2. "hikmah": (2-3 butir hikmah/pelajaran hidup yang menyentuh hati)
3. "relevansi": (1-2 kalimat bagaimana ayat ini relevan bagi kehidupan modern, tantangan kerja, stres, atau relasi)
4. "aksiNyata": (1 langkah amalan praktis atau doa yang dapat dilakukan hari ini)

Keluarkan HANYA format JSON murni tanpa markdown triple backticks.`;

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
            return NextResponse.json({
              success: true,
              source: "gemini_ai",
              reflection: parsed,
            });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call skipped/failed, using structured tafsir fallback:", geminiErr);
      }
    }

    // Fallback cerdas berbasis Tafsir & Kontemplasi Islami jika belum ada GEMINI_API_KEY
    const cleanTafsir = tafsir ? tafsir.replace(/\r?\n|\r/g, " ").trim() : "";
    
    // Potong intisari tafsir secara elegan
    let intisariTafsir = cleanTafsir;
    if (intisariTafsir.length > 300) {
      const dotIndex = intisariTafsir.indexOf(".", 200);
      intisariTafsir = dotIndex !== -1 ? intisariTafsir.substring(0, dotIndex + 1) : intisariTafsir.substring(0, 280) + "...";
    }

    const fallbackReflection = {
      konteks: intisariTafsir || `Ayat ke-${nomorAyat} dari surat ${namaSurat || "Al-Qur'an"} menegaskan petunjuk mulia bagi orang-orang yang beriman dan bertakwa.`,
      hikmah: [
        `Menyadarkan kita bahwa setiap firman Allah menyimpan ketenangan bagi hati yang sedang gundah.`,
        `Mengajarkan keseimbangan antara ikhtiar lahiriah dan kepasrahan batin (tawakal) kepada Sang Pencipta.`,
        `Menjadi pengingat agar senantiasa bersyukur atas nikmat dan bersabar saat menghadapi ujian hidup.`
      ],
      relevansi: `Di tengah kesibukan dan tantangan kehidupan modern, ayat ini mengajak kita untuk sejenak melambat (slow down), menata niat kembali, dan menemukan kedamaian sejati di hadapan Allah SWT.`,
      aksiNyata: `Amalkan ayat ini dengan membaca doa memohon petunjuk dan kelapangan hati, serta perbanyak istighfar dalam setiap aktivitas hari ini.`
    };

    return NextResponse.json({
      success: true,
      source: "curated_tafsir",
      reflection: fallbackReflection,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memproses refleksi ayat",
      },
      { status: 500 }
    );
  }
}
