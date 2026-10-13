"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileScan,
  CheckSquare,
  BookOpen,
  PieChart,
  ListTree,
  Sparkles,
  HelpCircle,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    description: "Ringkasan Finansial",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    href: "/documents/new",
    label: "Upload & OCR AI",
    description: "Ekstraksi Faktur Cerdas",
    icon: FileScan,
    badge: "AI",
  },
  {
    href: "/documents",
    label: "Verifikasi Faktur",
    description: "Review & Human-in-the-Loop",
    icon: CheckSquare,
    badge: null,
  },
  {
    href: "/reports",
    label: "Laporan Keuangan",
    description: "Laba Rugi & Neraca",
    icon: PieChart,
    badge: null,
  },
  {
    href: "/ledger",
    label: "Buku Besar & Jurnal",
    description: "Jurnal Double-Entry",
    icon: BookOpen,
    badge: null,
  },
  {
    href: "/accounts",
    label: "Chart of Accounts",
    description: "Bagan Akun (COA)",
    icon: ListTree,
    badge: null,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex flex-col items-center justify-between py-6 px-3 bg-[#367C69] text-white w-20 md:w-24 shrink-0 z-30 transition-all select-none">
      {/* Decorative subtle organic wave background overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <svg
          viewBox="0 0 100 800"
          className="w-full h-full text-white fill-current preserve-3d"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C30,120 70,200 40,360 C10,500 60,650 0,800 L0,0 Z" />
        </svg>
      </div>

      {/* Top Brand Spark Icon */}
      <div className="flex flex-col items-center mb-6 relative z-10">
        <Link
          href="/"
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-inner group"
          title="BukuAI - Double Entry Accounting"
        >
          <div className="relative">
            <Sparkles className="w-6 h-6 text-gold-300 transition-transform group-hover:rotate-12" />
          </div>
        </Link>
      </div>

      {/* Navigation Items (Icons with Active Squircle & Tooltips) */}
      <nav className="flex-1 flex flex-col items-center justify-center space-y-4 my-auto relative z-10 w-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <div key={item.href} className="relative group flex items-center justify-center">
              <Link
                href={item.href}
                className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#367C69] shadow-lg shadow-black/10 scale-105"
                    : "text-emerald-100/75 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.3]" : "stroke-[1.8]"}`} />

                {/* Badge Dot */}
                {item.badge && !isActive && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gold-400 ring-2 ring-[#367C69]" />
                )}
              </Link>

              {/* Hover Tooltip Card on the right */}
              <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white rounded-xl shadow-xl text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 z-50 border border-slate-800">
                <div className="font-semibold">{item.label}</div>
                <div className="text-[10px] text-emerald-300 font-normal">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center space-y-3 pt-4 border-t border-white/15 w-full relative z-10">
        <Link
          href="/reports"
          title="Bantuan Akuntansi"
          className="w-10 h-10 rounded-xl text-emerald-200/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>
        <Link
          href="/"
          title="Kembali ke Beranda"
          className="w-10 h-10 rounded-xl text-emerald-200/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
