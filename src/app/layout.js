import "./globals.css";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export const metadata = {
  title: "Qur'an App - Read, Listen, Memorize, Reflect",
  description: "Aplikasi Al-Qur'an digital modern, minimalis, dan ramah pengguna dengan 4 pilar utama: Read, Listen, Memorize, dan Reflect.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Qur'an App",
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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#059669",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-stone-50 text-slate-800 antialiased min-h-screen selection:bg-emerald-100 selection:text-emerald-900">
        <PWAInstallBanner />
        {children}
      </body>
    </html>
  );
}
