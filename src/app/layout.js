import "./globals.css";

export const metadata = {
  title: "Qur'an App - Read, Listen, Memorize, Reflect",
  description: "Aplikasi Al-Qur'an digital modern, minimalis, dan ramah pengguna dengan 4 pilar utama: Read, Listen, Memorize, dan Reflect.",
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
        {children}
      </body>
    </html>
  );
}
