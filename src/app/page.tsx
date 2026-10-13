"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, docRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/documents"),
        ]);
        const repJson = await repRes.json();
        const docJson = await docRes.json();

        if (repJson.success) setData(repJson);
        if (docJson.success) setRecentDocs(docJson.data.slice(0, 5));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const summary = data?.summary || {
    cashBalance: 0,
    totalRevenue: 0,
    totalExpense: 0,
    netIncome: 0,
    pendingDocsCount: 0,
    totalJournalCount: 0,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-7 rounded-2xl shadow-xl shadow-blue-900/10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-blue-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Accounting Engine Aktif</span>
          </div>
          <h1 className="text-2xl font-bold">Dashboard Pembukuan Otomatis</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Sistem otomatisasi penangkapan dokumen faktur, ekstraksi OCR bertenaga AI, dan pencatatan buku besar berpasangan (*double-entry*).
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/documents/new"
            className="inline-flex items-center space-x-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl shadow-sm text-sm transition"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>+ Proses Faktur AI</span>
          </Link>
          <Link
            href="/documents"
            className="inline-flex items-center space-x-2 bg-blue-600/60 hover:bg-blue-600 border border-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition"
          >
            <span>Verifikasi Dokumen</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Saldo Kas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kas & Setara Kas
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {formatIDR(summary.cashBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Akun 1-1100 (Aset Lancar)</p>
          </div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Beban / Biaya
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {formatIDR(summary.totalExpense)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Total beban operasional</p>
          </div>
        </div>

        {/* Card 3: Laba Bersih */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Laba / (Rugi) Bersih
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div
              className={`text-2xl font-bold ${
                summary.netIncome >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatIDR(summary.netIncome)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Pendapatan - Beban</p>
          </div>
        </div>

        {/* Card 4: Menunggu Verifikasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Perlu Verifikasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary.pendingDocsCount}
            </span>
            <span className="text-xs text-amber-600 font-medium">dokumen faktur</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Human-in-the-loop review</p>
        </div>
      </div>

      {/* Middle Section: Quick Flow & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Documents Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Dokumen Faktur Terkini</h2>
              <p className="text-xs text-slate-500">Daftar transaksi faktur/struk hasil ekstraksi OCR</p>
            </div>
            <Link
              href="/documents"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Memuat dokumen...</div>
          ) : recentDocs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600">Belum ada dokumen yang diproses</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Unggah faktur pembelian atau masukkan teks nota belanja untuk menguji ekstraksi otomatis AI.
              </p>
              <Link
                href="/documents/new"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                <span>Coba Ekstraksi AI Sekarang</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3">Vendor / Supplier</th>
                    <th className="pb-3">No. Faktur</th>
                    <th className="pb-3">Total Nominal</th>
                    <th className="pb-3">Rekomendasi Akun COA</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 font-medium text-slate-900">{doc.vendorName}</td>
                      <td className="py-3 text-slate-500 font-mono">
                        {doc.invoiceNumber || "-"}
                      </td>
                      <td className="py-3 font-semibold text-slate-900">
                        {formatIDR(doc.totalAmount)}
                      </td>
                      <td className="py-3 text-slate-600">
                        <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 mr-1.5">
                          {doc.suggestedAccountCode}
                        </span>
                        <span className="truncate max-w-[140px] inline-block align-bottom">
                          {doc.suggestedAccountName}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {doc.status === "POSTED" ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terposting</span>
                          </span>
                        ) : (
                          <Link
                            href={`/documents`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Verifikasi</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Architecture Workflow */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Alur Sistem Double-Entry</h2>
            <p className="text-xs text-slate-500">Cara kerja otomatisasi akuntansi</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Smart OCR & AI Extraction</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Ekstraksi nomor faktur, vendor, tanggal, item rincian, dan PPN ke format JSON terstruktur.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Contextual COA Matching</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menentukan kode akun beban secara otomatis (misal: Cloud Server → 5-1200, Transport → 5-1400).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Human-in-the-Loop Verification</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Akuntan meninjau dan mengonfirmasi akurasi data sebelum pencatatan permanen.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">General Ledger & Double-Entry</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Posting otomatis: Debit Beban + Debit PPN = Kredit Kas/Utang. Selalu seimbang!
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/ledger"
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buka Buku Besar ({summary.totalJournalCount} Jurnal)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
