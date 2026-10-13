"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Plus,
  MoreHorizontal,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Download,
  Building2,
  DollarSign,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profitTimeframe, setProfitTimeframe] = useState<"Week" | "Month" | "Year">("Week");
  const [useUSD, setUseUSD] = useState(false);

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

  const summary = data?.summary || {
    cashBalance: 66800000,
    totalRevenue: 44650000,
    totalExpense: 24650000,
    netIncome: 20000000,
    pendingDocsCount: 2,
    totalJournalCount: 14,
  };

  const formatCurrency = (val: number, forcePositive = false) => {
    const num = Math.abs(val || 0);
    if (useUSD) {
      // Converted approx for demonstration matching screenshot
      const usdVal = num > 100000 ? num / 15000 : num;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(usdVal);
      return val < 0 && !forcePositive ? `-${formatted}` : formatted;
    }
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
    return val < 0 && !forcePositive ? `-${formatted}` : formatted;
  };

  // Spending statistics monthly bars (Jan - Nov) matching reference capsule chart
  const spendingMonthly = [
    { month: "Jan", height: "38%", fill: "28%", amount: "Rp 3.800.000" },
    { month: "Feb", height: "55%", fill: "42%", amount: "Rp 5.200.000" },
    { month: "Mar", height: "92%", fill: "85%", amount: "Rp 12.400.000" },
    { month: "Apr", height: "95%", fill: "90%", amount: "Rp 14.100.000" },
    { month: "May", height: "60%", fill: "48%", amount: "Rp 6.300.000" },
    { month: "June", height: "30%", fill: "20%", amount: "Rp 2.900.000" },
    { month: "July", height: "65%", fill: "50%", amount: "Rp 7.500.000" },
    { month: "Aug", height: "45%", fill: "32%", amount: "Rp 4.400.000" },
    { month: "Sep", height: "58%", fill: "45%", amount: "Rp 6.100.000" },
    { month: "Oct", height: "68%", fill: "56%", amount: "Rp 8.200.000" },
    { month: "Nov", height: "88%", fill: "80%", amount: "Rp 11.800.000" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1520px] mx-auto w-full">
      {/* Top Bar Helper & Currency Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-slate-700">Financial Overview & Double-Entry Ledger</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400">Periode Berjalan: Oktober 2026</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUseUSD(!useUSD)}
            className="px-3 py-1 bg-sage-50 hover:bg-sage-100 text-sage-800 rounded-full font-semibold border border-sage-200/80 transition flex items-center space-x-1.5"
            title="Ubah format mata uang tampilan"
          >
            <DollarSign className="w-3.5 h-3.5 text-sage-600" />
            <span>Format: {useUSD ? "USD ($)" : "IDR (Rp)"}</span>
          </button>
        </div>
      </div>

      {/* ===================== TOP ROW: MY CARDS + ACTIONS + PROFIT ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* "My cards" Card (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">My cards</h2>
              <Link
                href="/accounts"
                className="inline-flex items-center space-x-1 px-3 py-1 bg-[#E2F2EB] hover:bg-[#D4EBDD] text-sage-800 rounded-full text-xs font-semibold transition"
              >
                <span>Add new</span>
                <span className="w-4 h-4 rounded-full bg-sage-600 text-white flex items-center justify-center text-[10px] leading-none">+</span>
              </Link>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden md:inline">
              What would you like to do?
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visual Credit/Debit Card + Balance (7 Cols) */}
            <div className="md:col-span-7 flex flex-col sm:flex-row items-center gap-6">
              {/* Stacked Cards Illustration */}
              <div className="relative w-56 sm:w-60 h-36 shrink-0 group">
                {/* Back card 2 (Pink/Peach) */}
                <div className="absolute top-4 left-4 right-0 bottom-0 bg-[#FAD2CB] rounded-2xl transform rotate-3 opacity-90 transition-transform group-hover:rotate-6"></div>
                {/* Back card 1 (Warm Gold) */}
                <div className="absolute top-2 left-2 right-1 bottom-1 bg-gold-400 rounded-2xl transform -rotate-1 opacity-95 transition-transform group-hover:-rotate-3"></div>

                {/* Front Card (Sage Green with Wavy Pattern) */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#3D8570] to-[#2D6656] text-white rounded-2xl p-4 shadow-lg flex flex-col justify-between overflow-hidden">
                  {/* Subtle Wave lines background */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <svg viewBox="0 0 200 120" className="w-full h-full stroke-white fill-none stroke-[1.2]">
                      <path d="M-20,30 Q30,10 80,40 T180,30 T240,60" />
                      <path d="M-20,60 Q40,40 100,70 T200,50 T240,90" />
                      <path d="M-20,90 Q50,70 110,100 T210,80 T240,110" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-1.5 text-[10px] tracking-wider text-emerald-100 font-medium">
                      <span>•)))</span>
                      <span>Credit Card</span>
                    </div>
                    <span className="font-extrabold text-sm italic tracking-widest text-white/90">VISA</span>
                  </div>

                  {/* Card Number */}
                  <div className="font-mono text-sm tracking-widest text-emerald-50 relative z-10 pt-2">
                    1234 5678 9101 1121
                  </div>

                  {/* Card Holder & Expiry */}
                  <div className="flex items-center justify-between text-[10px] text-emerald-100/90 relative z-10">
                    <span className="font-medium tracking-wide">Jack Lewis</span>
                    <span className="font-mono">06/28</span>
                  </div>
                </div>
              </div>

              {/* Card Balance Display */}
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs text-slate-400 font-medium">Card balance</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {useUSD ? "$668.00" : formatCurrency(summary.cashBalance)}
                </div>
                <Link
                  href="/ledger"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-sage-600 hover:text-sage-700 transition pt-1"
                >
                  <span>View details</span>
                  <span className="w-4 h-4 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center text-[10px]">➔</span>
                </Link>
              </div>
            </div>

            {/* Quick Action Tiles (5 Cols): Send, Receive, Withdraw */}
            <div className="md:col-span-5 grid grid-cols-3 gap-2.5 sm:gap-3">
              <Link
                href="/documents/new"
                className="bg-[#EDF7F2] hover:bg-[#E0F2EA] rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center transition group text-center border border-sage-100/60"
              >
                <div className="w-10 h-10 rounded-full bg-[#367C69] text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Send</span>
              </Link>

              <Link
                href="/documents"
                className="bg-[#EDF7F2] hover:bg-[#E0F2EA] rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center transition group text-center border border-sage-100/60"
              >
                <div className="w-10 h-10 rounded-full bg-[#367C69] text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Receive</span>
              </Link>

              <Link
                href="/reports"
                className="bg-[#EDF7F2] hover:bg-[#E0F2EA] rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center transition group text-center border border-sage-100/60"
              >
                <div className="w-10 h-10 rounded-full bg-[#367C69] text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Withdraw</span>
              </Link>
            </div>
          </div>
        </div>

        {/* "Profit" Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-extrabold text-slate-800">Profit</h2>
            <Link
              href="/reports"
              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-sage-700 transition"
            >
              <span>Show all</span>
              <span className="w-4 h-4 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center text-[10px]">↗</span>
            </Link>
          </div>

          {/* Timeframe pill tabs: Week | Month | Year */}
          <div className="flex justify-center sm:justify-end my-2">
            <div className="bg-[#EDF7F2] p-1 rounded-full inline-flex text-xs font-semibold text-slate-500">
              {(["Week", "Month", "Year"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProfitTimeframe(tab)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    profitTimeframe === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "hover:text-slate-900 text-slate-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Profit Wave Graph */}
          <div className="h-32 w-full relative mt-2">
            <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A9779" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4A9779" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Fill area */}
              <path
                d="M 0,80 Q 50,85 100,75 T 200,65 T 260,30 T 320,15 L 320,120 L 0,120 Z"
                fill="url(#profitGrad)"
              />
              {/* Stroke line */}
              <path
                d="M 0,80 Q 50,85 100,75 T 200,65 T 260,30 T 320,15"
                fill="none"
                stroke="#367C69"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Highlight point */}
              <circle cx="320" cy="15" r="4" fill="#367C69" />
            </svg>
          </div>

          {/* X Axis dates */}
          <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-50">
            <span>16</span>
            <span>17</span>
            <span>18</span>
            <span>19</span>
            <span>20</span>
            <span>21</span>
            <span>22</span>
          </div>
        </div>
      </div>

      {/* ===================== MIDDLE ROW: INCOME + EXPENCES + SPENDINGS STATISTIC ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Income Card (4 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EDF7F2] text-sage-700 flex items-center justify-center">
                <Wallet className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Income</h3>
            </div>
            <button className="text-slate-300 hover:text-slate-600 transition">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Gentle Wavy Line */}
          <div className="h-16 w-full my-4">
            <svg viewBox="0 0 240 60" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path
                d="M 0,35 Q 40,15 80,40 T 160,20 T 240,15"
                fill="none"
                stroke="#367C69"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Stat Value & Pill Badge */}
          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {useUSD ? "+$4,465.00" : `+${formatCurrency(summary.totalRevenue, true)}`}
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E2F2EB] text-sage-800">
              +12% ↑
            </span>
          </div>
        </div>

        {/* Expences Card (4 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EDF7F2] text-sage-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Expences</h3>
            </div>
            <button className="text-slate-300 hover:text-slate-600 transition">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Gentle Downward Wavy Line */}
          <div className="h-16 w-full my-4">
            <svg viewBox="0 0 240 60" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path
                d="M 0,15 Q 40,10 80,25 T 160,35 T 240,45"
                fill="none"
                stroke="#367C69"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Stat Value & Pill Badge */}
          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {useUSD ? "-$2,465.00" : `-${formatCurrency(summary.totalExpense, true)}`}
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800">
              -23% ↓
            </span>
          </div>
        </div>

        {/* Spendings Statistic (Capsule Bar Chart) (6 Cols) */}
        <div className="md:col-span-2 lg:col-span-6 bg-white rounded-3xl p-6 border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EDF7F2] text-sage-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Spendings statistic</h3>
            </div>

            <div className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-100 cursor-pointer">
              <span>Year</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* The Signature Tall Capsule Bar Chart */}
          <div className="pt-2 pb-1">
            <div className="h-28 sm:h-32 flex items-end justify-between gap-1.5 sm:gap-2 px-1">
              {spendingMonthly.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Outer Pale Mint Capsule */}
                  <div
                    className="w-full max-w-[18px] sm:max-w-[22px] bg-[#E2F2EB] rounded-full overflow-hidden flex flex-col justify-end relative transition-all group-hover:brightness-95"
                    style={{ height: item.height }}
                    title={`${item.month}: ${item.amount}`}
                  >
                    {/* Inner Golden Fill */}
                    <div
                      className="w-full bg-gold-400 rounded-full transition-all duration-500"
                      style={{ height: item.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Months Row */}
            <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-400 font-medium pt-3 px-0.5">
              {spendingMonthly.map((item) => (
                <span key={item.month} className="text-center flex-1">
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BOTTOM ROW: PLANNING + LATEST TRANSACTIONS + GO PREMIUM ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Planning Card (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">Planning</h3>
            <Link
              href="/ledger"
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-[#E2F2EB] hover:bg-[#D4EBDD] text-sage-800 rounded-full text-xs font-semibold transition"
            >
              <span>Add new</span>
              <span className="w-3.5 h-3.5 rounded-full bg-sage-600 text-white flex items-center justify-center text-[9px] leading-none">+</span>
            </Link>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Target 1: House in Paris / Kas Operasional */}
            <div className="bg-sage-50/50 p-3.5 rounded-2xl border border-sage-100/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">House in Paris</span>
                <span className="font-mono text-slate-500 font-medium">
                  {useUSD ? "$265" : "Rp 265K"} / <span className="text-slate-800 font-semibold">{useUSD ? "$10,000" : "Rp 10Jt"}</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gold-400 rounded-full w-[26%] transition-all"></div>
              </div>
            </div>

            {/* Target 2: Trip to Brazil / Pajak & Cadangan */}
            <div className="bg-sage-50/50 p-3.5 rounded-2xl border border-sage-100/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Trip to Brazil</span>
                <span className="font-mono text-slate-500 font-medium">
                  {useUSD ? "$10,456" : "Rp 10.4Jt"} / <span className="text-slate-800 font-semibold">{useUSD ? "$14,000" : "Rp 14Jt"}</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gold-400 rounded-full w-[75%] transition-all"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Transactions Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">Latest transactions</h3>
            <Link
              href="/documents"
              className="w-7 h-7 rounded-full bg-sage-50 hover:bg-sage-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
              title="Lihat semua transaksi"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5 flex-1">
            {/* Transaction 1: Dribbble / Sample */}
            <div className="flex items-center justify-between text-xs py-1 hover:bg-sage-50/40 px-2 rounded-xl transition">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center shrink-0 font-bold text-sm shadow-sm">
                  🏀
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Dribbble</div>
                  <div className="text-[11px] text-slate-400">September 30, 2026 • Pro upgrade</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">{useUSD ? "-$5.78" : "-Rp 89.000"}</div>
                <div className="text-[10px] text-amber-600 font-semibold">Pending</div>
              </div>
            </div>

            {/* Transaction 2: Youtube / AWS */}
            <div className="flex items-center justify-between text-xs py-1 hover:bg-sage-50/40 px-2 rounded-xl transition">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 font-bold text-sm shadow-sm">
                  ▶
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Youtube</div>
                  <div className="text-[11px] text-slate-400">October 2, 2026 • Subscription</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">{useUSD ? "-$1055.78" : "-Rp 2.497.500"}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Completed</div>
              </div>
            </div>

            {/* Transaction 3: Apple / Grab */}
            <div className="flex items-center justify-between text-xs py-1 hover:bg-sage-50/40 px-2 rounded-xl transition">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 font-bold text-sm shadow-sm">
                  
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Apple</div>
                  <div className="text-[11px] text-slate-400">October 13, 2026 • Cloud Games</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">{useUSD ? "-$345.78" : "-Rp 220.000"}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Go Premium / AI Automation Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] flex flex-col justify-between overflow-hidden relative group">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800 text-base">Go premium</h3>
              <Link
                href="/documents/new"
                className="w-7 h-7 rounded-full bg-[#E2F2EB] hover:bg-sage-600 hover:text-white text-sage-800 flex items-center justify-center transition"
                title="Mulai ekstraksi faktur otomatis"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-400 max-w-[210px] leading-relaxed">
              Explore all banking functions with lifetime membership
            </p>
          </div>

          {/* Hand-drawn Mascot / Browser Illustration matching reference */}
          <div className="relative mt-4 pt-2 flex justify-center items-center">
            {/* Cute Browser Window Illustration */}
            <div className="relative w-48 h-28 bg-white border-2 border-slate-800 rounded-xl shadow-[4px_4px_0px_#1B3D34] flex flex-col p-2 transform -rotate-1 group-hover:rotate-0 transition-transform">
              {/* Window dots */}
              <div className="flex items-center space-x-1 pb-1.5 border-b border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              {/* Window body with pink check button */}
              <div className="flex-1 flex items-center justify-center">
                <Link
                  href="/documents/new"
                  className="px-4 py-1.5 rounded-lg border-2 border-slate-800 bg-[#FAD2CB] hover:bg-rose-200 text-slate-900 font-bold text-xs flex items-center space-x-1 shadow-[2px_2px_0px_#1B3D34] transition active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sage-700" />
                  <span>Coba AI</span>
                </Link>
              </div>
            </div>

            {/* Mascot Thumbs Up Hand peeking right */}
            <div className="absolute right-3 top-2 pointer-events-none transform rotate-12">
              <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
                {/* Cute cartoon hand giving thumbs up */}
                <path
                  d="M30,55 C20,55 15,45 25,35 C35,25 45,20 50,30 C55,40 50,45 45,50"
                  stroke="#1E293B"
                  strokeWidth="5"
                  fill="#FFF7ED"
                  strokeLinecap="round"
                />
                <path
                  d="M45,50 C60,45 75,55 70,70 C65,85 45,85 35,75 C25,65 30,55 45,50 Z"
                  stroke="#1E293B"
                  strokeWidth="5"
                  fill="#FFF7ED"
                  strokeLinejoin="round"
                />
                <path
                  d="M50,58 C55,60 58,68 52,72"
                  stroke="#1E293B"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
