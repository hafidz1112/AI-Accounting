"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Filter,
  RefreshCw,
  Plus,
  Scale,
  Calendar,
  FileText,
} from "lucide-react";

export default function LedgerPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState("ALL");
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual entry modal state
  const [manualDesc, setManualDesc] = useState("Setoran Modal Awal Pemilik ke Kas");
  const [debitAccountId, setDebitAccountId] = useState("");
  const [creditAccountId, setCreditAccountId] = useState("");
  const [manualAmount, setManualAmount] = useState<number>(10000000);
  const [submittingManual, setSubmittingManual] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jRes, aRes] = await Promise.all([
        fetch("/api/journals"),
        fetch("/api/accounts"),
      ]);
      const jData = await jRes.json();
      const aData = await aRes.json();

      if (jData.success) setJournals(jData.data);
      if (aData.success) {
        setAccounts(aData.data);
        if (aData.data.length >= 2) {
          const cash = aData.data.find((a: any) => a.code === "1-1100");
          const equity = aData.data.find((a: any) => a.code === "3-1100");
          if (cash) setDebitAccountId(cash.id);
          if (equity) setCreditAccountId(equity.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateManualJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debitAccountId || !creditAccountId || manualAmount <= 0) {
      alert("Harap lengkapi akun debit, kredit, dan nominal!");
      return;
    }

    setSubmittingManual(true);
    try {
      const payload = {
        description: manualDesc,
        customItems: [
          { accountId: debitAccountId, debit: manualAmount, credit: 0, memo: manualDesc },
          { accountId: creditAccountId, debit: 0, credit: manualAmount, memo: manualDesc },
        ],
      };

      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Gagal membuat jurnal.");

      setShowManualModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingManual(false);
    }
  };

  // Filter journals if account filter is active
  const filteredJournals = journals.filter((j) => {
    if (selectedAccountFilter === "ALL") return true;
    return j.items.some((item: any) => item.account?.code === selectedAccountFilter);
  });

  const totalAllDebit = journals.reduce((acc, j) => {
    return acc + j.items.reduce((sum: number, it: any) => sum + (it.debit || 0), 0);
  }, 0);

  const totalAllCredit = journals.reduce((acc, j) => {
    return acc + j.items.reduce((sum: number, it: any) => sum + (it.credit || 0), 0);
  }, 0);

  const isBalanced = Math.abs(totalAllDebit - totalAllCredit) < 0.01;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Double-Entry Bookkeeping Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Buku Besar & Jurnal Umum (General Ledger)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Catatan kronologis seluruh transaksi keuangan berpasangan dengan verifikasi keseimbangan Debit dan Kredit.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Entri Jurnal Manual</span>
          </button>
        </div>
      </div>

      {/* Global Balance Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Debit Seluruh Jurnal
            </span>
            <div className="text-xl font-bold text-blue-600 mt-1">
              Rp {totalAllDebit.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Kredit Seluruh Jurnal
            </span>
            <div className="text-xl font-bold text-rose-600 mt-1">
              Rp {totalAllCredit.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Keseimbangan (Audit)
            </span>
            <div className="mt-1">
              {isBalanced ? (
                <span className="inline-flex items-center space-x-1.5 text-sm font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SEIMBANG (ΣD = ΣK)</span>
                </span>
              ) : (
                <span className="text-sm font-bold text-rose-600">
                  SELISIH TERDETEKSI
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Account */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-700">Filter berdasarkan Akun:</span>
        <select
          value={selectedAccountFilter}
          onChange={(e) => setSelectedAccountFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="ALL">Semua Akun ({journals.length} entri)</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.code}>
              {acc.code} - {acc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-200">
            Memuat buku besar...
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada transaksi di Buku Besar</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Verifikasi faktur di menu Verifikasi Faktur atau buat entri jurnal manual untuk mencatat transaksi pertama.
            </p>
          </div>
        ) : (
          filteredJournals.map((entry) => {
            const entryDebit = entry.items.reduce((s: number, i: any) => s + (i.debit || 0), 0);
            const entryCredit = entry.items.reduce((s: number, i: any) => s + (i.credit || 0), 0);

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Entry Header */}
                <div className="bg-slate-50/70 p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                      {entry.entryNumber}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{entry.date ? new Date(entry.date).toLocaleDateString("id-ID") : "-"}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {entry.description}
                    </span>
                  </div>

                  {entry.document && (
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dari Faktur: {entry.document.vendorName}</span>
                    </div>
                  )}
                </div>

                {/* Entry Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-white">
                        <th className="py-2.5 px-4">Kode Akun</th>
                        <th className="py-2.5 px-4">Nama Akun</th>
                        <th className="py-2.5 px-4">Keterangan / Memo</th>
                        <th className="py-2.5 px-4 text-right">Debit (Rp)</th>
                        <th className="py-2.5 px-4 text-right">Kredit (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entry.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                            {item.account?.code}
                          </td>
                          <td className="py-2.5 px-4 text-slate-900 font-medium">
                            {item.account?.name}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                            {item.memo || "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-700">
                            {item.debit > 0 ? item.debit.toLocaleString("id-ID") : "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-rose-700">
                            {item.credit > 0 ? item.credit.toLocaleString("id-ID") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200 bg-slate-50/50 font-bold text-slate-900 text-xs">
                        <td colSpan={3} className="py-2.5 px-4 text-right">
                          Total Baris Jurnal:
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-blue-700">
                          Rp {entryDebit.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-rose-700">
                          Rp {entryCredit.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Manual Journal Entry */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Tambah Entri Jurnal Manual (Double-Entry)
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualJournal} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Deskripsi Transaksi
                </label>
                <input
                  type="text"
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Akun Debit (Bertambah/Beban/Aset)
                </label>
                <select
                  value={debitAccountId}
                  onChange={(e) => setDebitAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Akun Kredit (Berkurang/Ekuitas/Kewajiban/Pendapatan)
                </label>
                <select
                  value={creditAccountId}
                  onChange={(e) => setCreditAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nominal Transaksi (Rp)
                </label>
                <input
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)}
                  required
                  min={1}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                💡 Sistem akan membuat 2 baris jurnal otomatis yang seimbang: Debit Rp {manualAmount.toLocaleString("id-ID")} dan Kredit Rp {manualAmount.toLocaleString("id-ID")}.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 transition"
                >
                  {submittingManual ? "Menyimpan..." : "Posting Jurnal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
