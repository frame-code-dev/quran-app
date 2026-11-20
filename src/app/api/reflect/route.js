import { NextResponse } from "next/server";

/**
 * Memecah teks tafsir Kemenag menjadi kalimat yang rapi untuk ekstraksi intisari kontekstual
 */
function splitSentences(text = "") {
  return text
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}

/**
 * Membangun refleksi kontekstual langsung dari teks Tafsir Kemenag & terjemahan ayat
 * (menghindari kalimat template generik yang sama di setiap ayat)
 */
function buildTafsirBasedReflection({ namaSurat, nomorAyat, teksIndonesia = "", tafsir = "" }) {
  const sentences = splitSentences(tafsir);
  const combined = `${teksIndonesia} ${tafsir}`.toLowerCase();

  // 1. Inti pesan diambil langsung dari kalimat pembuka tafsir resmi ayat ini
  const konteks =
    sentences.length > 0
      ? sentences.slice(0, 2).join(" ")
      : `Pada QS. ${namaSurat || "Al-Qur'an"} ayat ${nomorAyat}, Allah menegaskan: "${teksIndonesia}".`;

  // 2. Butir pelajaran (hikmah) diambil dari bagian lanjutan tafsir jika tersedia
  const hikmah = [];
  if (sentences.length >= 3) {
    hikmah.push(sentences[2]);
  }
  if (sentences.length >= 4) {
    hikmah.push(sentences[3]);
  }
  if (sentences.length >= 5) {
    hikmah.push(sentences[4]);
  }

  // Deteksi tema ayat agar relevansi dan amalan nyata sesuai konteks ayat yang dibaca
  const themes = [
    {
      match: /sabar|ujian|cobaan|kesulitan|musibah|berat|duka|sedih/,
      hikmahAdd: "Kesabaran yang disertai keyakinan kepada Allah melahirkan keteguhan sikap dalam menghadapi ujian.",
      relevansi:
        "Ketika tekanan hidup atau pekerjaan terasa berat, ayat ini mengingatkan agar tidak larut dalam keluh kesah, melainkan menata kembali ketenangan batin melalui sabar dan ikhtiar.",
      aksiNyata:
        "Tarik napas tenang saat menghadapi persoalan hari ini, ucapkan istighfar, dan mohon kekuatan dalam sujud salat.",
    },
    {
      match: /rezeki|harta|infak|sedekah|nafkah|hutang|jual beli|riba|kaya|miskin/,
      hikmahAdd: "Keberkahan harta tidak semata diukur dari jumlahnya, melainkan dari kehalalan sumber dan kepedulian berbagi.",
      relevansi:
        "Dalam urusan nafkah dan keuangan sehari-hari, kejujuran, transparansi, serta tawakal menjaga hati tetap lapang dan tidak diperbudak kecemasan materi.",
      aksiNyata:
        "Evaluasi niat dalam mencari nafkah hari ini dan sisihkan sebagian rezeki untuk membantu sesama yang membutuhkan.",
    },
    {
      match: /doa|memohon|ampun|taubat|rahmat|kasih sayang|dekat|mengabulkan/,
      hikmahAdd: "Pintu doa dan ampunan Allah selalu terbuka bagi setiap hamba yang bersungguh-sungguh kembali kepada-Nya.",
      relevansi:
        "Saat merasa jauh atau buntu menghadapi persoalan pribadi, ayat ini menjadi penguat bahwa pengaduan yang paling aman adalah langsung kepada Sang Pencipta.",
      aksiNyata:
        "Luangkan waktu sejenak selepas salat fardu untuk memanjatkan doa secara khusus dengan penuh kerendahan hati.",
    },
    {
      match: /syukur|nikmat|karunia|pujian|alhamdulillah/,
      hikmahAdd: "Mengakui nikmat yang ada adalah jalan menuju ketenteraman hati dan bertambahnya keberkahan.",
      relevansi:
        "Di tengah kebiasaan membandingkan diri dengan orang lain, ayat ini mengajak menengok kembali nikmat kesehatan, iman, dan keluarga yang sering terlupakan.",
      aksiNyata:
        "Tuliskan atau ucapkan tiga nikmat sederhana yang Anda rasakan hari ini sebagai bentuk syukur nyata.",
    },
    {
      match: /orang tua|ibu|bapak|keluarga|pasangan|istri|suami|anak|keturunan/,
      hikmahAdd: "Keharmonisan rumah tangga dan bakti kepada orang tua merupakan fondasi utama keberkahan hidup.",
      relevansi:
        "Kesibukan harian sering menggerus perhatian terhadap orang-orang terdekat; ayat ini mengingatkan untuk menjaga kelembutan tutur kata dan kasih sayang di lingkup keluarga.",
      aksiNyata:
        "Sapa atau doakan orang tua dan anggota keluarga Anda hari ini dengan tutur kata yang lembut.",
    },
    {
      match: /adil|keadilan|saksi|hukum|amanah|jujur|janji/,
      hikmahAdd: "Keadilan dan amanah adalah prinsip yang tetap harus dijaga meski berat bagi kepentingan pribadi.",
      relevansi:
        "Dalam interaksi kerja, pertemanan, maupun tanggung jawab sosial, integritas menjaga kepercayaan manusia sekaligus mendatangkan rida Allah.",
      aksiNyata:
        "Tunaikan satu amanah atau janji yang sempat tertunda hari ini dengan jujur dan sungguh-sungguh.",
    },
    {
      match: /langit|bumi|cipta|tanda|malam|siang|hujan|alam|matahari|bulan/,
      hikmahAdd: "Keteraturan penciptaan alam semesta adalah tanda nyata kebesaran dan kebijaksanaan Allah bagi orang yang berpikir.",
      relevansi:
        "Merenungi tanda-tanda kebesaran Allah di sekitar kita menumbuhkan rasa rendah hati dan menyadarkan bahwa segala urusan berada dalam kendali-Nya.",
      aksiNyata:
        "Luangkan beberapa menit untuk memperhatikan lingkungan sekitar sembari bertasbih mengagungkan kebesaran Sang Pencipta.",
    },
    {
      match: /salat|zikir|ingat|ibadah|sujud|rukuk|takwa|iman/,
      hikmahAdd: "Kualitas hubungan dengan Allah melalui ibadah dan zikir menjadi sumber ketenangan serta arah hidup seorang mukmin.",
      relevansi:
        "Menjaga kekhusyukan ibadah di sela rutinitas harian membantu menjaga kejernihan hati dan kejujuran niat.",
      aksiNyata:
        "Perbaiki ketepatan waktu dan kekhusyukan salat pada waktu salat berikutnya hari ini.",
    },
  ];

  const matchedTheme = themes.find((t) => t.match.test(combined));

  if (hikmah.length === 0) {
    hikmah.push(
      matchedTheme?.hikmahAdd ||
        `Ayat ke-${nomorAyat} dalam Surat ${namaSurat || "ini"} menghadirkan pelajaran penting tentang kesadaran iman dan arah hidup yang lurus.`
    );
  }
  if (hikmah.length === 1) {
    hikmah.push(
      `Merujuk terjemahan "${teksIndonesia.slice(0, 140)}${teksIndonesia.length > 140 ? "..." : ""}", ayat ini mengajak pembaca memadukan pemahaman ilmu dengan ketulusan amal.`
    );
  }

  return {
    konteks,
    hikmah: hikmah.slice(0, 3),
    relevansi:
      matchedTheme?.relevansi ||
      `Membaca QS. ${namaSurat || "Al-Qur'an"} ayat ${nomorAyat} bersama tafsirnya membantu kita menimbang setiap keputusan harian agar tetap selaras dengan nilai petunjuk Al-Qur'an.`,
    aksiNyata:
      matchedTheme?.aksiNyata ||
      `Baca kembali terjemahan dan tafsir QS. ${namaSurat || "ini"} ayat ${nomorAyat} dengan perlahan, lalu catat satu pelajaran yang paling dekat dengan keadaan Anda saat ini pada tab Catatan Hati.`,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nomorSurat, namaSurat, nomorAyat, teksArab, teksIndonesia, tafsir } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Anda adalah penyusun catatan tadabbur Al-Qur'an berbahasa Indonesia yang santun, berwibawa, jernih, dan berlandaskan tafsir muktabar. Hindari bahasa pemasaran, hindari istilah bahasa Inggris yang tidak perlu, dan tetap setia pada makna tafsir.
Bantu susun intisari tadabbur untuk ayat berikut:
- Surat: ${namaSurat || nomorSurat} ayat ${nomorAyat}
- Teks Arab: ${teksArab || ""}
- Terjemahan: "${teksIndonesia || ""}"
${tafsir ? `- Rujukan Tafsir Kemenag: "${tafsir.slice(0, 800)}"` : ""}

Keluarkan JSON murni dengan struktur tepat:
{
  "konteks": "1-2 kalimat ringkas tentang pesan pokok ayat ini berdasarkan tafsirnya",
  "hikmah": ["2 sampai 3 butir pelajaran nyata yang spesifik pada isi ayat ini"],
  "relevansi": "1-2 kalimat bagaimana pesan ayat ini membimbing sikap hidup sehari-hari",
  "aksiNyata": "1 langkah amalan sederhana dan konkret yang bisa diamalkan hari ini"
}
Keluarkan HANYA JSON valid tanpa markdown backticks.`;

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
        console.warn("Gemini API call skipped/failed, using structured tafsir extraction:", geminiErr);
      }
    }

    const reflection = buildTafsirBasedReflection({
      namaSurat,
      nomorAyat,
      teksIndonesia,
      tafsir,
    });

    return NextResponse.json({
      success: true,
      source: "curated_tafsir",
      reflection,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat intisari tadabbur ayat",
      },
      { status: 500 }
    );
  }
}
