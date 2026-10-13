import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "buku.ai - Pembukuan Otomatis AI & Double-Entry",
  description: "Sistem Pembukuan Otomatis Berbasis AI & Double-Entry Bookkeeping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full w-full">
      <body className="h-full w-full flex bg-[#F6FAF8] text-slate-900 antialiased overflow-hidden">
        {/* Sidebar nempel persis di sisi kiri layar & tidak ikut ter-scroll */}
        <Sidebar />

        {/* Area Utama: Header di atas (fixed) & Konten scrollable independen */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#F6FAF8]">
          <Header />
          <main className="flex-1 overflow-y-auto min-w-0 bg-[#F6FAF8]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
