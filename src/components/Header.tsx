"use client";

import { useState } from "react";
import {
  Search,
  Settings,
  Clock,
  Bell,
  Sparkles,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="px-6 md:px-8 py-4 border-b border-sage-100/80 flex items-center justify-between gap-4 bg-white sticky top-0 z-20 shrink-0">
      {/* Left: Brand Mark & Search Bar */}
      <div className="flex items-center space-x-6 flex-1 max-w-xl">
        {/* Golden Diamond Logo Mark (Inspired by reference) */}
        <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Dual overlapping rotated squares / golden emblem */}
            <div className="w-5 h-5 rounded-[5px] bg-gold-400 rotate-45 transform transition-transform group-hover:scale-105 shadow-sm"></div>
            <div className="w-4 h-4 rounded-[4px] border-2 border-white bg-gold-500 rotate-12 absolute shadow-sm"></div>
          </div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight hidden sm:inline">
            buku<span className="text-sage-600 font-semibold">.ai</span>
          </span>
        </Link>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or type command"
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-sage-50/60 hover:bg-sage-50 focus:bg-white text-slate-800 placeholder-slate-400 rounded-full border border-sage-200/70 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Settings, Time/Log, Bell, Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
        <Link
          href="/accounts"
          title="Pengaturan COA & Sistem"
          className="w-9 h-9 rounded-full bg-sage-50 hover:bg-sage-100 text-slate-600 hover:text-sage-800 flex items-center justify-center transition border border-sage-100"
        >
          <Settings className="w-4 h-4" />
        </Link>

        <Link
          href="/ledger"
          title="Riwayat Jurnal"
          className="w-9 h-9 rounded-full bg-sage-50 hover:bg-sage-100 text-slate-600 hover:text-sage-800 flex items-center justify-center transition border border-sage-100"
        >
          <Clock className="w-4 h-4" />
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifikasi Faktur & Review"
            className="w-9 h-9 rounded-full bg-sage-50 hover:bg-sage-100 text-slate-600 hover:text-sage-800 flex items-center justify-center transition border border-sage-100 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-gold-500 ring-2 ring-white absolute top-1.5 right-1.5"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-sage-100 p-4 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-sage-100">
                <span className="font-bold text-slate-800">Notifikasi</span>
                <span className="text-[10px] text-sage-600 font-semibold bg-sage-50 px-2 py-0.5 rounded-full">
                  AI Verifikasi Aktif
                </span>
              </div>
              <div className="space-y-2 text-slate-600">
                <p className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-sage-600 shrink-0 mt-0.5" />
                  <span>Sistem double-entry siap memproses dokumen faktur.</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-sage-200/80">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800 leading-tight">Michael Smith</div>
            <div className="text-[10px] text-sage-600 font-medium">Head of Finance</div>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sage-600 to-sage-400 p-[2px] shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-sage-700 uppercase overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Michael Smith"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image doesn't load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="absolute">MS</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
