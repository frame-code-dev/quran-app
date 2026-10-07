// Utilitas Metadata 114 Surat & Pencarian Cerdas Al-Qur'an (Surat:Ayat, Tematik, dan AI)

export const SURAT_META = [
  { nomor: 1, namaLatin: "Al-Fatihah", jumlahAyat: 7, alias: ["fatihah", "al fatihah", "al-fatihah"] },
  { nomor: 2, namaLatin: "Al-Baqarah", jumlahAyat: 286, alias: ["baqarah", "al baqarah", "al-baqarah", "albaqarah"] },
  { nomor: 3, namaLatin: "Ali 'Imran", jumlahAyat: 200, alias: ["ali imran", "ali 'imran", "ali-imran", "imran"] },
  { nomor: 4, namaLatin: "An-Nisa'", jumlahAyat: 176, alias: ["nisa", "an nisa", "an-nisa", "annisa", "an nisa'"] },
  { nomor: 5, namaLatin: "Al-Ma'idah", jumlahAyat: 120, alias: ["maidah", "al maidah", "al-maidah", "almaidah"] },
  { nomor: 6, namaLatin: "Al-An'am", jumlahAyat: 165, alias: ["anam", "an'am", "al anam", "al-anam", "al-an'am"] },
  { nomor: 7, namaLatin: "Al-A'raf", jumlahAyat: 206, alias: ["araf", "a'raf", "al araf", "al-araf", "al-a'raf"] },
  { nomor: 8, namaLatin: "Al-Anfal", jumlahAyat: 75, alias: ["anfal", "al anfal", "al-anfal"] },
  { nomor: 9, namaLatin: "At-Taubah", jumlahAyat: 129, alias: ["taubah", "at taubah", "at-taubah", "attaubah"] },
  { nomor: 10, namaLatin: "Yunus", jumlahAyat: 109, alias: ["yunus"] },
  { nomor: 11, namaLatin: "Hud", jumlahAyat: 123, alias: ["hud"] },
  { nomor: 12, namaLatin: "Yusuf", jumlahAyat: 111, alias: ["yusuf"] },
  { nomor: 13, namaLatin: "Ar-Ra'd", jumlahAyat: 43, alias: ["rad", "ra'd", "ar rad", "ar-rad", "ar-ra'd"] },
  { nomor: 14, namaLatin: "Ibrahim", jumlahAyat: 52, alias: ["ibrahim"] },
  { nomor: 15, namaLatin: "Al-Hijr", jumlahAyat: 99, alias: ["hijr", "al hijr", "al-hijr"] },
  { nomor: 16, namaLatin: "An-Nahl", jumlahAyat: 128, alias: ["nahl", "an nahl", "an-nahl"] },
  { nomor: 17, namaLatin: "Al-Isra'", jumlahAyat: 111, alias: ["isra", "al isra", "al-isra", "al-isra'"] },
  { nomor: 18, namaLatin: "Al-Kahf", jumlahAyat: 110, alias: ["kahf", "al kahf", "al-kahf", "kahfi"] },
  { nomor: 19, namaLatin: "Maryam", jumlahAyat: 98, alias: ["maryam"] },
  { nomor: 20, namaLatin: "Taha", jumlahAyat: 135, alias: ["taha", "thaha", "thaahaa"] },
  { nomor: 21, namaLatin: "Al-Anbiya'", jumlahAyat: 112, alias: ["anbiya", "al anbiya", "al-anbiya", "al-anbiya'"] },
  { nomor: 22, namaLatin: "Al-Hajj", jumlahAyat: 78, alias: ["hajj", "al hajj", "al-hajj"] },
  { nomor: 23, namaLatin: "Al-Mu'minun", jumlahAyat: 118, alias: ["muminun", "mu'minun", "al mu'minun", "al-mu'minun"] },
  { nomor: 24, namaLatin: "An-Nur", jumlahAyat: 64, alias: ["nur", "an nur", "an-nur"] },
  { nomor: 25, namaLatin: "Al-Furqan", jumlahAyat: 77, alias: ["furqan", "al furqan", "al-furqan"] },
  { nomor: 26, namaLatin: "Asy-Syu'ara'", jumlahAyat: 227, alias: ["syuara", "asy syuara", "asy-syu'ara", "asy-syu'ara'"] },
  { nomor: 27, namaLatin: "An-Naml", jumlahAyat: 93, alias: ["naml", "an naml", "an-naml"] },
  { nomor: 28, namaLatin: "Al-Qasas", jumlahAyat: 88, alias: ["qasas", "al qasas", "al-qasas"] },
  { nomor: 29, namaLatin: "Al-'Ankabut", jumlahAyat: 69, alias: ["ankabut", "al ankabut", "al-'ankabut"] },
  { nomor: 30, namaLatin: "Ar-Rum", jumlahAyat: 60, alias: ["rum", "ar rum", "ar-rum"] },
  { nomor: 31, namaLatin: "Luqman", jumlahAyat: 34, alias: ["luqman", "lukman"] },
  { nomor: 32, namaLatin: "As-Sajdah", jumlahAyat: 30, alias: ["sajdah", "as sajdah", "as-sajdah"] },
  { nomor: 33, namaLatin: "Al-Ahzab", jumlahAyat: 73, alias: ["ahzab", "al ahzab", "al-ahzab"] },
  { nomor: 34, namaLatin: "Saba'", jumlahAyat: 54, alias: ["saba", "saba'"] },
  { nomor: 35, namaLatin: "Fatir", jumlahAyat: 45, alias: ["fatir"] },
  { nomor: 36, namaLatin: "Yasin", jumlahAyat: 83, alias: ["yasin", "yaasin", "yasiin"] },
  { nomor: 37, namaLatin: "As-Saffat", jumlahAyat: 182, alias: ["saffat", "as saffat", "as-saffat"] },
  { nomor: 38, namaLatin: "Sad", jumlahAyat: 88, alias: ["sad", "shaad"] },
  { nomor: 39, namaLatin: "Az-Zumar", jumlahAyat: 75, alias: ["zumar", "az zumar", "az-zumar"] },
  { nomor: 40, namaLatin: "Gafir", jumlahAyat: 85, alias: ["gafir", "ghafir", "al-mumin"] },
  { nomor: 41, namaLatin: "Fussilat", jumlahAyat: 54, alias: ["fussilat"] },
  { nomor: 42, namaLatin: "Asy-Syura", jumlahAyat: 53, alias: ["syura", "asy syura", "asy-syura"] },
  { nomor: 43, namaLatin: "Az-Zukhruf", jumlahAyat: 89, alias: ["zukhruf", "az zukhruf", "az-zukhruf"] },
  { nomor: 44, namaLatin: "Ad-Dukhan", jumlahAyat: 59, alias: ["dukhan", "ad dukhan", "ad-dukhan"] },
  { nomor: 45, namaLatin: "Al-Jasiyah", jumlahAyat: 37, alias: ["jasiyah", "al jasiyah", "al-jasiyah"] },
  { nomor: 46, namaLatin: "Al-Ahqaf", jumlahAyat: 35, alias: ["ahqaf", "al ahqaf", "al-ahqaf"] },
  { nomor: 47, namaLatin: "Muhammad", jumlahAyat: 38, alias: ["muhammad"] },
  { nomor: 48, namaLatin: "Al-Fath", jumlahAyat: 29, alias: ["fath", "al fath", "al-fath"] },
  { nomor: 49, namaLatin: "Al-Hujurat", jumlahAyat: 18, alias: ["hujurat", "al hujurat", "al-hujurat"] },
  { nomor: 50, namaLatin: "Qaf", jumlahAyat: 45, alias: ["qaf", "qaaf"] },
  { nomor: 51, namaLatin: "Az-Zariyat", jumlahAyat: 60, alias: ["zariyat", "az zariyat", "az-zariyat"] },
  { nomor: 52, namaLatin: "At-Tur", jumlahAyat: 49, alias: ["tur", "at tur", "at-tur"] },
  { nomor: 53, namaLatin: "An-Najm", jumlahAyat: 62, alias: ["najm", "an najm", "an-najm"] },
  { nomor: 54, namaLatin: "Al-Qamar", jumlahAyat: 55, alias: ["qamar", "al qamar", "al-qamar"] },
  { nomor: 55, namaLatin: "Ar-Rahman", jumlahAyat: 78, alias: ["rahman", "ar rahman", "ar-rahman"] },
  { nomor: 56, namaLatin: "Al-Waqi'ah", jumlahAyat: 96, alias: ["waqiah", "waqi'ah", "al waqiah", "al-waqiah", "al-waqi'ah"] },
  { nomor: 57, namaLatin: "Al-Hadid", jumlahAyat: 29, alias: ["hadid", "al hadid", "al-hadid"] },
  { nomor: 58, namaLatin: "Al-Mujadilah", jumlahAyat: 22, alias: ["mujadilah", "al mujadilah", "al-mujadilah"] },
  { nomor: 59, namaLatin: "Al-Hasyr", jumlahAyat: 24, alias: ["hasyr", "al hasyr", "al-hasyr"] },
  { nomor: 60, namaLatin: "Al-Mumtahanah", jumlahAyat: 13, alias: ["mumtahanah", "al mumtahanah", "al-mumtahanah"] },
  { nomor: 61, namaLatin: "As-Saff", jumlahAyat: 14, alias: ["saff", "as saff", "as-saff"] },
  { nomor: 62, namaLatin: "Al-Jumu'ah", jumlahAyat: 11, alias: ["jumuah", "jumat", "al jumu'ah", "al-jumuah"] },
  { nomor: 63, namaLatin: "Al-Munafiqun", jumlahAyat: 11, alias: ["munafiqun", "al munafiqun", "al-munafiqun"] },
  { nomor: 64, namaLatin: "At-Tagabun", jumlahAyat: 18, alias: ["tagabun", "at tagabun", "at-tagabun"] },
  { nomor: 65, namaLatin: "At-Talaq", jumlahAyat: 12, alias: ["talaq", "at talaq", "at-talaq"] },
  { nomor: 66, namaLatin: "At-Tahrim", jumlahAyat: 12, alias: ["tahrim", "at tahrim", "at-tahrim"] },
  { nomor: 67, namaLatin: "Al-Mulk", jumlahAyat: 30, alias: ["mulk", "al mulk", "al-mulk", "tabarak"] },
  { nomor: 68, namaLatin: "Al-Qalam", jumlahAyat: 52, alias: ["qalam", "al qalam", "al-qalam"] },
  { nomor: 69, namaLatin: "Al-Haqqah", jumlahAyat: 52, alias: ["haqqah", "al haqqah", "al-haqqah"] },
  { nomor: 70, namaLatin: "Al-Ma'arij", jumlahAyat: 44, alias: ["maarij", "al ma'arij", "al-maarij"] },
  { nomor: 71, namaLatin: "Nuh", jumlahAyat: 28, alias: ["nuh"] },
  { nomor: 72, namaLatin: "Al-Jinn", jumlahAyat: 28, alias: ["jin", "jinn", "al jin", "al-jinn"] },
  { nomor: 73, namaLatin: "Al-Muzzammil", jumlahAyat: 20, alias: ["muzzammil", "al muzzammil", "al-muzzammil"] },
  { nomor: 74, namaLatin: "Al-Muddassir", jumlahAyat: 56, alias: ["muddassir", "al muddassir", "al-muddassir"] },
  { nomor: 75, namaLatin: "Al-Qiyamah", jumlahAyat: 40, alias: ["qiyamah", "al qiyamah", "al-qiyamah"] },
  { nomor: 76, namaLatin: "Al-Insan", jumlahAyat: 31, alias: ["insan", "al insan", "al-insan", "dahr"] },
  { nomor: 77, namaLatin: "Al-Mursalat", jumlahAyat: 50, alias: ["mursalat", "al mursalat", "al-mursalat"] },
  { nomor: 78, namaLatin: "An-Naba'", jumlahAyat: 40, alias: ["naba", "an naba", "an-naba", "an-naba'"] },
  { nomor: 79, namaLatin: "An-Nazi'at", jumlahAyat: 46, alias: ["naziat", "an naziat", "an-nazi'at"] },
  { nomor: 80, namaLatin: "'Abasa", jumlahAyat: 42, alias: ["abasa", "'abasa"] },
  { nomor: 81, namaLatin: "At-Takwir", jumlahAyat: 29, alias: ["takwir", "at takwir", "at-takwir"] },
  { nomor: 82, namaLatin: "Al-Infitar", jumlahAyat: 19, alias: ["infitar", "al infitar", "al-infitar"] },
  { nomor: 83, namaLatin: "Al-Mutaffifin", jumlahAyat: 36, alias: ["mutaffifin", "al mutaffifin", "al-mutaffifin"] },
  { nomor: 84, namaLatin: "Al-Insyiqaq", jumlahAyat: 25, alias: ["insyiqaq", "al insyiqaq", "al-insyiqaq"] },
  { nomor: 85, namaLatin: "Al-Buruj", jumlahAyat: 22, alias: ["buruj", "al buruj", "al-buruj"] },
  { nomor: 86, namaLatin: "At-Tariq", jumlahAyat: 17, alias: ["tariq", "at tariq", "at-tariq"] },
  { nomor: 87, namaLatin: "Al-A'la", jumlahAyat: 19, alias: ["ala", "a'la", "al a'la", "al-a'la"] },
  { nomor: 88, namaLatin: "Al-Gasyiyah", jumlahAyat: 26, alias: ["gasyiyah", "al gasyiyah", "al-gasyiyah"] },
  { nomor: 89, namaLatin: "Al-Fajr", jumlahAyat: 30, alias: ["fajr", "al fajr", "al-fajr"] },
  { nomor: 90, namaLatin: "Al-Balad", jumlahAyat: 20, alias: ["balad", "al balad", "al-balad"] },
  { nomor: 91, namaLatin: "Asy-Syams", jumlahAyat: 15, alias: ["syams", "asy syams", "asy-syams"] },
  { nomor: 92, namaLatin: "Al-Lail", jumlahAyat: 21, alias: ["lail", "al lail", "al-lail"] },
  { nomor: 93, namaLatin: "Ad-Duha", jumlahAyat: 11, alias: ["duha", "ad duha", "ad-duha"] },
  { nomor: 94, namaLatin: "Al-Insyirah", jumlahAyat: 8, alias: ["insyirah", "al insyirah", "al-insyirah", "alam nasyrah"] },
  { nomor: 95, namaLatin: "At-Tin", jumlahAyat: 8, alias: ["tin", "at tin", "at-tin"] },
  { nomor: 96, namaLatin: "Al-'Alaq", jumlahAyat: 19, alias: ["alaq", "al alaq", "al-'alaq", "iqra"] },
  { nomor: 97, namaLatin: "Al-Qadr", jumlahAyat: 5, alias: ["qadr", "al qadr", "al-qadr"] },
  { nomor: 98, namaLatin: "Al-Bayyinah", jumlahAyat: 8, alias: ["bayyinah", "al bayyinah", "al-bayyinah"] },
  { nomor: 99, namaLatin: "Az-Zalzalah", jumlahAyat: 8, alias: ["zalzalah", "az zalzalah", "az-zalzalah"] },
  { nomor: 100, namaLatin: "Al-'Adiyat", jumlahAyat: 11, alias: ["adiyat", "al adiyat", "al-'adiyat"] },
  { nomor: 101, namaLatin: "Al-Qari'ah", jumlahAyat: 11, alias: ["qariah", "al qariah", "al-qari'ah"] },
  { nomor: 102, namaLatin: "At-Takasur", jumlahAyat: 8, alias: ["takasur", "at takasur", "at-takasur"] },
  { nomor: 103, namaLatin: "Al-'Asr", jumlahAyat: 3, alias: ["asr", "al asr", "al-'asr"] },
  { nomor: 104, namaLatin: "Al-Humazah", jumlahAyat: 9, alias: ["humazah", "al humazah", "al-humazah"] },
  { nomor: 105, namaLatin: "Al-Fil", jumlahAyat: 5, alias: ["fil", "al fil", "al-fil"] },
  { nomor: 106, namaLatin: "Quraisy", jumlahAyat: 4, alias: ["quraisy"] },
  { nomor: 107, namaLatin: "Al-Ma'un", jumlahAyat: 7, alias: ["maun", "al maun", "al-ma'un"] },
  { nomor: 108, namaLatin: "Al-Kausar", jumlahAyat: 3, alias: ["kausar", "al kausar", "al-kausar"] },
  { nomor: 109, namaLatin: "Al-Kafirun", jumlahAyat: 6, alias: ["kafirun", "al kafirun", "al-kafirun"] },
  { nomor: 110, namaLatin: "An-Nasr", jumlahAyat: 3, alias: ["nasr", "an nasr", "an-nasr"] },
  { nomor: 111, namaLatin: "Al-Lahab", jumlahAyat: 5, alias: ["lahab", "al lahab", "al-lahab"] },
  { nomor: 112, namaLatin: "Al-Ikhlas", jumlahAyat: 4, alias: ["ikhlas", "al ikhlas", "al-ikhlas"] },
  { nomor: 113, namaLatin: "Al-Falaq", jumlahAyat: 5, alias: ["falaq", "al falaq", "al-falaq"] },
  { nomor: 114, namaLatin: "An-Nas", jumlahAyat: 6, alias: ["nas", "an nas", "an-nas"] },
];

// Kamus Tematik Cerdas Terkurasi (Populer & Cepat 0ms)
export const THEMATIC_TOPICS = [
  {
    id: "100-dinar",
    title: "Ayat 1000 Dinar (Rezeki Tak Terduga)",
    suratNomor: 65,
    suratNamaLatin: "At-Talaq",
    nomorAyat: 3,
    ayatRange: "Ayat 2 - 3",
    description: "Ayat pembuka pintu rezeki yang tak terduga bagi orang yang senantiasa bertakwa dan bertawakal kepada Allah.",
    keywords: ["100 dinar", "seratus dinar", "1000 dinar", "seribu dinar", "ayat 100 dinar", "ayat 1000 dinar", "talaq 3", "talaq 2", "rezeki tak terduga"],
  },
  {
    id: "hutang-piutang",
    title: "Ayat Hutang Piutang (Muamalah)",
    suratNomor: 2,
    suratNamaLatin: "Al-Baqarah",
    nomorAyat: 282,
    ayatRange: "Ayat 282",
    description: "Ayat terpanjang dalam Al-Qur'an yang memerintahkan pencatatan transaksi hutang piutang secara adil dan transparan.",
    keywords: ["hutang", "utang", "piutang", "pinjam", "pinjaman", "catat hutang", "muamalah", "transaksi", "baqarah 282"],
  },
  {
    id: "jodoh-pasangan",
    title: "Tanda Kebesaran: Pasangan Hidup Penuh Kasih",
    suratNomor: 30,
    suratNamaLatin: "Ar-Rum",
    nomorAyat: 21,
    ayatRange: "Ayat 21",
    description: "Penciptaan pasangan hidup agar jiwa merasa tenteram, serta menumbuhkan cinta dan kasih sayang (Mawaddah wa Rahmah).",
    keywords: ["jodoh", "pasangan", "nikah", "pernikahan", "suami", "istri", "cinta", "mawaddah", "sakinah", "rum 21"],
  },
  {
    id: "doa-keluarga-jodoh",
    title: "Doa Pasangan & Keturunan Penyejuk Hati",
    suratNomor: 25,
    suratNamaLatin: "Al-Furqan",
    nomorAyat: 74,
    ayatRange: "Ayat 74",
    description: "Doa memohon pasangan dan anak keturunan yang menjadi penyejuk pandangan mata (Qurrata A'yun) serta teladan orang bertakwa.",
    keywords: ["jodoh", "qurrata ayun", "keluarga", "anak", "keturunan", "doa jodoh", "pasangan penyejuk hati", "furqan 74"],
  },
  {
    id: "ayat-kursi",
    title: "Ayat Kursi (Keagungan Mutlak Allah)",
    suratNomor: 2,
    suratNamaLatin: "Al-Baqarah",
    nomorAyat: 255,
    ayatRange: "Ayat 255",
    description: "Ayat paling agung dalam Al-Qur'an tentang kemahakuasaan, penjagaan semesta, dan perlindungan ilahi.",
    keywords: ["ayat kursi", "kursi", "kursyi", "keagungan allah", "perlindungan", "baqarah 255"],
  },
  {
    id: "sabar-salat",
    title: "Pertolongan Melalui Sabar dan Salat",
    suratNomor: 2,
    suratNamaLatin: "Al-Baqarah",
    nomorAyat: 153,
    ayatRange: "Ayat 153",
    description: "Jadikanlah sabar dan salat sebagai penolong menghadapi badai kehidupan. Sesungguhnya Allah bersama orang-orang yang sabar.",
    keywords: ["sabar", "kesabaran", "salat", "shalat", "ujian", "cobaan", "baqarah 153"],
  },
  {
    id: "rezeki-kelapangan",
    title: "Kelapangan Rezeki & Nafkah Berkah",
    suratNomor: 34,
    suratNamaLatin: "Saba'",
    nomorAyat: 39,
    ayatRange: "Ayat 39",
    description: "Allah melapangkan dan membatasi rezeki menurut hikmah-Nya. Setiap apa yang diinfakkan pasti diganti dengan lebih baik.",
    keywords: ["rezeki", "nafkah", "sedekah", "berkah", "rezki", "kelapangan rezeki", "saba 39"],
  },
  {
    id: "orang-tua",
    title: "Berbakti kepada Ibu Bapak (Birrul Walidain)",
    suratNomor: 17,
    suratNamaLatin: "Al-Isra'",
    nomorAyat: 23,
    ayatRange: "Ayat 23 - 24",
    description: "Perintah memperlakukan kedua orang tua dengan penuh hormat, kasih sayang, dan mendoakan mereka di usia senja.",
    keywords: ["orang tua", "ibu", "bapak", "ayah", "birrul walidain", "berbakti", "isra 23"],
  },
  {
    id: "taubat-rahmat",
    title: "Jangan Putus Asa dari Rahmat Allah",
    suratNomor: 39,
    suratNamaLatin: "Az-Zumar",
    nomorAyat: 53,
    ayatRange: "Ayat 53",
    description: "Pintu taubat senantiasa terbuka lebar bagi setiap jiwa yang ingin kembali dan memohon ampunan Allah.",
    keywords: ["taubat", "tobat", "ampunan", "dosa", "putus asa", "rahmat", "istighfar", "zumar 53"],
  },
  {
    id: "ketenangan-hati",
    title: "Ketenangan Hati Melalui Zikir",
    suratNomor: 13,
    suratNamaLatin: "Ar-Ra'd",
    nomorAyat: 28,
    ayatRange: "Ayat 28",
    description: "Hanya dengan mengingat Allah hati yang cemas dan gelisah akan menemukan kedamaian sejati.",
    keywords: ["tenang", "ketenangan", "hati", "gelisah", "cemas", "overthinking", "zikir", "dzikir", "rad 28"],
  },
  {
    id: "kesulitan-kemudahan",
    title: "Bersama Kesulitan Selalu Ada Kemudahan",
    suratNomor: 94,
    suratNamaLatin: "Al-Insyirah",
    nomorAyat: 6,
    ayatRange: "Ayat 5 - 6",
    description: "Penegasan bahwa setiap kali kesulitan mendera, Allah telah menyiapkan jalan kemudahan di dalamnya.",
    keywords: ["kesulitan", "kemudahan", "lapang dada", "berat", "masalah", "insyirah 5", "insyirah 6"],
  },
  {
    id: "doa-nabi-yunus",
    title: "Doa Nabi Yunus (Pelepas Kesempitan Hidup)",
    suratNomor: 21,
    suratNamaLatin: "Al-Anbiya'",
    nomorAyat: 87,
    ayatRange: "Ayat 87",
    description: "La ilaha illa Anta Subhanaka inni kuntu minaz-zalimin. Doa pengakuan tauhid dan kelemahan diri yang melepaskan dari kesempitan.",
    keywords: ["yunus", "doa nabi yunus", "ikan paus", "kesempitan", "bencana", "anbiya 87"],
  },
  {
    id: "kesembuhan-syifa",
    title: "Doa & Penawar Kesembuhan (Asy-Syifa)",
    suratNomor: 26,
    suratNamaLatin: "Asy-Syu'ara'",
    nomorAyat: 80,
    ayatRange: "Ayat 80",
    description: "Dan apabila aku sakit, Dialah yang menyembuhkan aku. Sumber tawakal kesembuhan fisik dan jiwa.",
    keywords: ["sembuh", "sakit", "kesembuhan", "syifa", "obat", "penyakit", "syuara 80"],
  },
  {
    id: "ashabul-kahfi",
    title: "Doa Pemuda Kahfi Memohon Petunjuk & Rahmat",
    suratNomor: 18,
    suratNamaLatin: "Al-Kahf",
    nomorAyat: 10,
    ayatRange: "Ayat 10",
    description: "Rabbana atina mil ladunka rahmataw wa hayyi' lana min amrina rasyada. Memohon petunjuk keputusan dalam situasi sulit.",
    keywords: ["kahfi", "ashabul kahfi", "gua", "petunjuk", "rahmat", "kahf 10"],
  },
  {
    id: "riba-keuangan",
    title: "Larangan Riba & Kehalalan Perniagaan",
    suratNomor: 2,
    suratNamaLatin: "Al-Baqarah",
    nomorAyat: 275,
    ayatRange: "Ayat 275",
    description: "Allah menghalalkan jual beli dan mengharamkan riba. Fondasi keadilan dan keberkahan ekonomi umat.",
    keywords: ["riba", "bunga", "keuangan", "jual beli", "bisnis haram", "baqarah 275"],
  },
  {
    id: "syukur-nikmat",
    title: "Janji Tambahan Nikmat bagi yang Bersyukur",
    suratNomor: 14,
    suratNamaLatin: "Ibrahim",
    nomorAyat: 7,
    ayatRange: "Ayat 7",
    description: "Jika kamu bersyukur, niscaya Aku akan menambah nikmat kepadamu. Syukur adalah magnet keberlimpahan hidup.",
    keywords: ["syukur", "nikmat", "terima kasih", "kufur", "ibrahim 7"],
  },
  {
    id: "keadilan-hukum",
    title: "Menegakkan Keadilan Tanpa Pandang Bulu",
    suratNomor: 4,
    suratNamaLatin: "An-Nisa'",
    nomorAyat: 135,
    ayatRange: "Ayat 135",
    description: "Perintah menjadi penegak keadilan karena Allah, meskipun terhadap diri sendiri, ibu bapak, atau kaum kerabat.",
    keywords: ["keadilan", "adil", "hukum", "hakim", "saksi", "nisa 135"],
  },
];

/**
 * Normalisasi string pencarian (hilangkan tanda petik, strip, spasi ganda)
 */
export function normalizeQuery(str = "") {
  return str
    .toLowerCase()
    .replace(/['’`"-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parsing pola Surat dan Ayat, misal:
 * - "nisa 136"
 * - "an nisa:136"
 * - "4 136"
 * - "4:136"
 * - "al baqarah 255"
 * - "136" (jika currentSuratNomor diberikan)
 */
export function parseSuratAyatPattern(rawQuery, currentSurat = null) {
  const q = normalizeQuery(rawQuery);
  if (!q) return null;

  // Pola 1: Angka saja (misal "136" atau "ayat 136")
  const ayatOnlyMatch = q.match(/^(?:ayat\s+)?(\d+)$/i);
  if (ayatOnlyMatch) {
    const ayatNum = parseInt(ayatOnlyMatch[1], 10);
    if (currentSurat && ayatNum >= 1 && ayatNum <= currentSurat.jumlahAyat) {
      return {
        type: "current_ayat",
        suratNomor: currentSurat.nomor,
        suratNamaLatin: currentSurat.namaLatin,
        nomorAyat: ayatNum,
        label: `${currentSurat.namaLatin} : Ayat ${ayatNum}`,
        isCurrentSurat: true,
      };
    }
  }

  // Pola 2: Format nomor surat + nomor ayat (misal "4 136" atau "4:136")
  const numColonMatch = q.match(/^(\d{1,3})\s*[:\s]\s*(\d{1,3})$/);
  if (numColonMatch) {
    const sNum = parseInt(numColonMatch[1], 10);
    const aNum = parseInt(numColonMatch[2], 10);
    const surat = SURAT_META.find((s) => s.nomor === sNum);
    if (surat && aNum >= 1 && aNum <= surat.jumlahAyat) {
      return {
        type: "surat_ayat",
        suratNomor: surat.nomor,
        suratNamaLatin: surat.namaLatin,
        nomorAyat: aNum,
        label: `QS. ${surat.namaLatin} : Ayat ${aNum}`,
        isCurrentSurat: currentSurat?.nomor === surat.nomor,
      };
    }
  }

  // Pola 3: Nama surat + nomor ayat (misal "nisa 136", "an nisa 136", "baqarah 255", "ali imran 144")
  // Pisahkan token teks dan angka di ujung
  const nameAyatMatch = q.match(/^(.+?)\s*(?:[:\s]|ayat\s*)(\d{1,3})$/i);
  if (nameAyatMatch) {
    const surahPart = normalizeQuery(nameAyatMatch[1]);
    const aNum = parseInt(nameAyatMatch[2], 10);

    // Cari surat yang cocok
    const matchedSurat = SURAT_META.find((s) => {
      const latinNorm = normalizeQuery(s.namaLatin);
      if (latinNorm === surahPart || latinNorm.includes(surahPart)) return true;
      return s.alias.some((a) => normalizeQuery(a) === surahPart || surahPart.includes(normalizeQuery(a)));
    });

    if (matchedSurat && aNum >= 1 && aNum <= matchedSurat.jumlahAyat) {
      return {
        type: "surat_ayat",
        suratNomor: matchedSurat.nomor,
        suratNamaLatin: matchedSurat.namaLatin,
        nomorAyat: aNum,
        label: `QS. ${matchedSurat.namaLatin} : Ayat ${aNum}`,
        isCurrentSurat: currentSurat?.nomor === matchedSurat.nomor,
      };
    }
  }

  return null;
}

/**
 * Mencari kecocokan topik tematik dari kamus
 */
export function matchThematicTopics(rawQuery) {
  const q = normalizeQuery(rawQuery);
  if (!q || q.length < 2) return [];

  const results = [];
  for (const topic of THEMATIC_TOPICS) {
    const match = topic.keywords.some((kw) => {
      const normKw = normalizeQuery(kw);
      return q === normKw || q.includes(normKw) || normKw.includes(q);
    });
    if (match) {
      results.push({
        type: "thematic",
        id: topic.id,
        title: topic.title,
        suratNomor: topic.suratNomor,
        suratNamaLatin: topic.suratNamaLatin,
        nomorAyat: topic.nomorAyat,
        ayatRange: topic.ayatRange,
        description: topic.description,
      });
    }
  }
  return results;
}

/**
 * Mencari surat berdasarkan nama saja
 */
export function matchSuratOnly(rawQuery) {
  const q = normalizeQuery(rawQuery);
  if (!q) return [];

  return SURAT_META.filter((s) => {
    const latinNorm = normalizeQuery(s.namaLatin);
    if (latinNorm.includes(q) || s.nomor.toString() === q) return true;
    return s.alias.some((a) => normalizeQuery(a).includes(q));
  }).slice(0, 5);
}

/**
 * Smart Search Engine: Menggabungkan hasil Surat:Ayat, Tematik, dan Surat Saja
 */
export function executeLocalSmartSearch(rawQuery, currentSurat = null) {
  const trimmed = rawQuery ? rawQuery.trim() : "";
  if (!trimmed) {
    return { patternResult: null, thematicResults: [], surahResults: [] };
  }

  const patternResult = parseSuratAyatPattern(trimmed, currentSurat);
  const thematicResults = matchThematicTopics(trimmed);
  const surahResults = !patternResult && thematicResults.length === 0 ? matchSuratOnly(trimmed) : [];

  return {
    patternResult,
    thematicResults,
    surahResults,
  };
}
