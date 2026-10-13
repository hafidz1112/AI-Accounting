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
    <html lang="id">
      <body className="min-h-screen bg-[#D8EFE4] text-slate-900 antialiased p-2 sm:p-4 md:p-6 lg:p-7 flex flex-col justify-center items-center">
        {/* Main Floating Rounded Application Frame */}
        <div className="w-full max-w-[1600px] min-h-[92vh] bg-white rounded-[26px] md:rounded-[34px] shadow-2xl shadow-sage-950/10 flex overflow-hidden border border-sage-200/80 relative">
          {/* Deep Sage Curved Dock Navigation */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
