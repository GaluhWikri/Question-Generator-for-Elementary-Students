import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Soal.gw - AI Question Generator untuk SD",
  description: "Generator soal berkualitas tinggi untuk anak SD menggunakan teknologi AI canggih. Buat soal Matematika, Bahasa Indonesia, IPA, IPS, dan mata pelajaran lainnya dengan mudah.",
  keywords: ["soal SD", "generator soal", "AI", "pendidikan", "ujian", "matematika", "bahasa indonesia"],
  authors: [{ name: "Galuh Wikri Ramadhan" }],
  icons: {
    icon: '/icon/icon1.png',
    apple: '/icon/icon1.png',
  },
  openGraph: {
    title: "Soal.gw - AI Question Generator untuk SD",
    description: "Generator soal berkualitas tinggi untuk anak SD menggunakan teknologi AI canggih.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="antialiased font-inter">
        {children}
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
