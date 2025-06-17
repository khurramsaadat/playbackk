import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";

const geistSans = localFont({
  src: '../../public/fonts/Geist-VariableFont_wght.ttf',
  variable: '--font-geist-sans',
});

const geistMono = localFont({
  src: '../../public/fonts/GeistMono-VariableFont_wght.ttf',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: "Playback & Learn",
  description: "A video learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
