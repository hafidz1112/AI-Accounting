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
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents/new", label: "Upload & OCR AI", icon: FileScan },
  { href: "/documents", label: "Verifikasi Faktur", icon: CheckSquare },
  { href: "/ledger", label: "Buku Besar & Jurnal", icon: BookOpen },
  { href: "/reports", label: "Laporan Keuangan", icon: PieChart },
  { href: "/accounts", label: "Chart of Accounts", icon: ListTree },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">AI Accounting</h1>
            <p className="text-xs text-slate-400">Double-Entry Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Engine Status Footer */}
      <div className="p-4 m-4 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs">
        <div className="flex items-center space-x-2 text-emerald-400 font-medium mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sistem Siap</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          AI Data Extraction & Validasi ΣDebit = ΣKredit aktif.
        </p>
      </div>
    </aside>
  );
}
