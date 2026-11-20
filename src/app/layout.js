import "./globals.css";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export const metadata = {
  title: "Al-Qur'an Al-Karim — Tilawah, Tafsir & Muraja'ah",
  description:
    "Ruang baca Al-Qur'an digital yang tenang dan nyaman dengan teks Arab standar Kemenag RI, terjemahan, murattal 5 qari, mode mushaf fokus, hafalan muraja'ah, dan catatan tadabbur pribadi.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Al-Qur'an",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B4332",
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('quran_reading_theme');
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (saved === 'dark' || saved === 'light' || saved === 'mushaf') {
      document.documentElement.dataset.theme = saved;
      if (meta) meta.setAttribute('content', saved === 'dark' ? 'dark' : 'light');
    } else if (meta) {
      meta.setAttribute('content', 'light dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased min-h-screen selection:bg-emerald-800/15 selection:text-emerald-950">
        <PWAInstallBanner />
        {children}
      </body>
    </html>
  );
}
