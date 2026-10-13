"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Printer,
  TrendingUp,
  TrendingDown,
  Scale,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"INCOME" | "BALANCE">("INCOME");

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const isBalanced = data?.balanceSheet?.isBalanced;

  return (
    <div className="p-6 lg:p-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#E2F2EB] text-sage-800 rounded-full text-xs font-semibold mb-2">
            <PieChart className="w-3.5 h-3.5 text-sage-600" />
            <span>Financial Reporting Module</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Laporan Keuangan Otomatis
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Laporan laba rugi dan posisi neraca yang dihitung langsung dari jurnal buku besar terverifikasi.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadReports}
            className="p-2.5 rounded-full border border-sage-200 bg-white hover:bg-sage-50 text-slate-600 transition"
            title="Refresh Laporan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-full text-xs shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-sage-50/70 p-1.5 rounded-full inline-flex border border-sage-100">
        <button
          onClick={() => setActiveTab("INCOME")}
          className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "INCOME"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-sage-600" />
          <span>Laporan Laba Rugi (Income Statement)</span>
        </button>

        <button
          onClick={() => setActiveTab("BALANCE")}
          className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "BALANCE"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Scale className="w-4 h-4 text-sage-600" />
          <span>Neraca Keuangan (Balance Sheet)</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 text-sm bg-white rounded-3xl border border-sage-100">
          Menghitung laporan keuangan...
        </div>
      ) : activeTab === "INCOME" ? (
        /* TAB 1: INCOME STATEMENT */
        <div className="bg-white rounded-3xl border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] p-8 space-y-8">
          <div className="text-center pb-6 border-b border-sage-100">
            <h2 className="text-xl font-bold text-slate-900">LAPORAN LABA RUGI</h2>
            <p className="text-xs text-slate-400 mt-1">
              Untuk Periode Berjalan (Berdasarkan Buku Besar Aktual)
            </p>
          </div>

          {/* Section: Pendapatan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-sage-100 pb-2">
              <span>PENDAPATAN USAHA</span>
              <span>NOMINAL (RP)</span>
            </div>
            {data?.incomeStatement?.revenues.length === 0 ? (
              <div className="text-xs text-slate-400 py-2 italic">Belum ada pendapatan tercatat.</div>
            ) : (
              data?.incomeStatement?.revenues.map((rev: any) => (
                <div key={rev.id} className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-slate-700">
                    <span className="font-mono text-slate-400 mr-2">{rev.code}</span>
                    {rev.name}
                  </span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatIDR(rev.balance)}
                  </span>
                </div>
              ))
            )}
            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-sage-200 text-slate-900">
              <span>TOTAL PENDAPATAN</span>
              <span className="font-mono text-sage-700">
                {formatIDR(data?.incomeStatement?.totalRevenue)}
              </span>
            </div>
          </div>

          {/* Section: Beban Operasional */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-sage-100 pb-2">
              <span>BEBAN OPERASIONAL & BIAYA</span>
              <span>NOMINAL (RP)</span>
            </div>
            {data?.incomeStatement?.expenses.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between text-xs py-1.5">
                <span className="text-slate-700">
                  <span className="font-mono text-slate-400 mr-2">{exp.code}</span>
                  {exp.name}
                </span>
                <span className="font-mono font-medium text-slate-900">
                  {formatIDR(exp.balance)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-sage-200 text-slate-900">
              <span>TOTAL BEBAN OPERASIONAL</span>
              <span className="font-mono text-rose-600">
                {formatIDR(data?.incomeStatement?.totalExpense)}
              </span>
            </div>
          </div>

          {/* Net Income Summary */}
          <div className="p-6 rounded-3xl bg-[#1A3D34] text-white flex items-center justify-between shadow-lg shadow-sage-950/5">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold block">
                LABA / (RUGI) BERSIH
              </span>
              <p className="text-xs text-emerald-100/70 mt-0.5">Pendapatan dikurangi total beban</p>
            </div>
            <div className="text-2xl font-bold font-mono text-gold-300">
              {formatIDR(data?.incomeStatement?.netIncome)}
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: BALANCE SHEET */
        <div className="bg-white rounded-3xl border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] p-8 space-y-8">
          <div className="text-center pb-6 border-b border-sage-100">
            <h2 className="text-xl font-bold text-slate-900">NERACA KEUANGAN (BALANCE SHEET)</h2>
            <p className="text-xs text-slate-400 mt-1">
              Posisi Keuangan (Aset = Kewajiban + Ekuitas)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Assets */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-sage-100 pb-2">
                <span>ASET (AKTIVA)</span>
                <span>NOMINAL (RP)</span>
              </div>

              <div className="space-y-2">
                {data?.balanceSheet?.assets.map((ast: any) => (
                  <div key={ast.id} className="flex items-center justify-between text-xs py-1.5">
                    <span className="text-slate-700">
                      <span className="font-mono text-slate-400 mr-2">{ast.code}</span>
                      {ast.name}
                    </span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatIDR(ast.balance)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-bold pt-3 border-t-2 border-sage-200 text-slate-900">
                <span>TOTAL ASET</span>
                <span className="font-mono text-sage-700 text-sm">
                  {formatIDR(data?.balanceSheet?.totalAsset)}
                </span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="space-y-6">
              {/* Liabilities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-sage-100 pb-2">
                  <span>KEWAJIBAN (UTANG)</span>
                  <span>NOMINAL (RP)</span>
                </div>
                {data?.balanceSheet?.liabilities.map((liab: any) => (
                  <div key={liab.id} className="flex items-center justify-between text-xs py-1.5">
                    <span className="text-slate-700">
                      <span className="font-mono text-slate-400 mr-2">{liab.code}</span>
                      {liab.name}
                    </span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatIDR(liab.balance)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-sage-100 text-slate-900">
                  <span>TOTAL KEWAJIBAN</span>
                  <span className="font-mono text-slate-900">
                    {formatIDR(data?.balanceSheet?.totalLiability)}
                  </span>
                </div>
              </div>

              {/* Equities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-sage-100 pb-2">
                  <span>EKUITAS (MODAL)</span>
                  <span>NOMINAL (RP)</span>
                </div>
                {data?.balanceSheet?.equities.map((eq: any) => (
                  <div key={eq.id} className="flex items-center justify-between text-xs py-1.5">
                    <span className="text-slate-700">
                      <span className="font-mono text-slate-400 mr-2">{eq.code}</span>
                      {eq.name}
                    </span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatIDR(eq.balance)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-slate-700 italic">
                    Laba / (Rugi) Periode Berjalan
                  </span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatIDR(data?.incomeStatement?.netIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-sage-100 text-slate-900">
                  <span>TOTAL EKUITAS</span>
                  <span className="font-mono text-slate-900">
                    {formatIDR(data?.balanceSheet?.totalEquity)}
                  </span>
                </div>
              </div>

              {/* Total Liabilities + Equity */}
              <div className="flex items-center justify-between text-xs font-bold pt-3 border-t-2 border-sage-200 text-slate-900">
                <span>TOTAL KEWAJIBAN + EKUITAS</span>
                <span className="font-mono text-sage-700 text-sm">
                  {formatIDR(data?.balanceSheet?.totalLiability + data?.balanceSheet?.totalEquity)}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Verification */}
          <div className="p-4 rounded-2xl bg-sage-50/70 border border-sage-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-sage-600" />
              <span className="font-semibold text-slate-700">
                Verifikasi Persamaan Akuntansi (Aset = Kewajiban + Ekuitas):
              </span>
            </div>
            {isBalanced ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E2F2EB] text-sage-800">
                <CheckCircle2 className="w-4 h-4 text-sage-600" />
                <span>NERACA SEIMBANG (BALANCED)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                <AlertCircle className="w-4 h-4" />
                <span>TERDAPAT SELISIH</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
