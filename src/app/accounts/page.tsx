"use client";

import { useEffect, useState } from "react";
import {
  ListTree,
  Plus,
  RefreshCw,
  FolderTree,
} from "lucide-react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [normalBalance, setNormalBalance] = useState("DEBIT");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const json = await res.json();
      if (json.success) setAccounts(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    setSaving(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, type, normalBalance, description }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah akun.");

      setShowAddModal(false);
      setCode("");
      setName("");
      setDescription("");
      await loadAccounts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getTypeBadge = (typeStr: string) => {
    switch (typeStr) {
      case "ASSET":
        return "bg-[#E2F2EB] text-sage-800";
      case "LIABILITY":
        return "bg-gold-100 text-gold-700";
      case "EQUITY":
        return "bg-purple-100 text-purple-800";
      case "REVENUE":
        return "bg-emerald-100 text-emerald-800";
      case "EXPENSE":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="p-6 lg:p-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#E2F2EB] text-sage-800 rounded-full text-xs font-semibold mb-2">
            <ListTree className="w-3.5 h-3.5 text-sage-600" />
            <span>Master Data Keuangan</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Chart of Accounts (COA)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Daftar bagan akun standar perusahaan yang digunakan AI untuk mengklasifikasikan beban dan transaksi.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAccounts}
            className="p-2.5 rounded-full border border-sage-200 bg-white hover:bg-sage-50 text-slate-600 transition"
            title="Refresh Akun"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-[#367C69] hover:bg-sage-700 text-white font-semibold px-4 py-2.5 rounded-full text-xs shadow-md shadow-sage-900/10 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Akun Baru</span>
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-3xl border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] overflow-hidden">
        <div className="p-5 border-b border-sage-100 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-700">
            Daftar Akun ({accounts.length} Akun Terdaftar)
          </span>
          <span className="text-sage-600 font-medium bg-[#E2F2EB] px-2.5 py-0.5 rounded-full">
            Standar Standby Double-Entry
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Memuat Chart of Accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-sage-100 text-slate-400 font-semibold bg-sage-50/40">
                  <th className="py-3 px-5">Kode Akun</th>
                  <th className="py-3 px-5">Nama Akun</th>
                  <th className="py-3 px-5">Kategori / Tipe</th>
                  <th className="py-3 px-5">Saldo Normal</th>
                  <th className="py-3 px-5">Deskripsi / Peruntukan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100/60">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-sage-50/40 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {acc.code}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-900">
                      {acc.name}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getTypeBadge(
                          acc.type
                        )}`}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] font-semibold text-slate-600">
                      {acc.normalBalance}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-[11px] max-w-sm">
                      {acc.description || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-sage-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sage-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <FolderTree className="w-4 h-4 text-sage-600" />
                <span>Tambah Akun COA Baru</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-sage-50 hover:bg-sage-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Kode Akun (Contoh: 5-1600)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="5-1600"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200/80 bg-white font-mono focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Akun
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Biaya Pemasaran & Iklan"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200/80 bg-white focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tipe Akun
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const val = e.target.value;
                      setType(val);
                      if (val === "ASSET" || val === "EXPENSE") setNormalBalance("DEBIT");
                      else setNormalBalance("CREDIT");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200/80 bg-white focus:ring-2 focus:ring-sage-500 focus:outline-none"
                  >
                    <option value="EXPENSE">EXPENSE (Beban)</option>
                    <option value="ASSET">ASSET (Aset/Harta)</option>
                    <option value="LIABILITY">LIABILITY (Kewajiban)</option>
                    <option value="EQUITY">EQUITY (Ekuitas/Modal)</option>
                    <option value="REVENUE">REVENUE (Pendapatan)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Saldo Normal
                  </label>
                  <select
                    value={normalBalance}
                    onChange={(e) => setNormalBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200/80 bg-white focus:ring-2 focus:ring-sage-500 focus:outline-none"
                  >
                    <option value="DEBIT">DEBIT</option>
                    <option value="CREDIT">CREDIT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Deskripsi / Kata Kunci untuk AI
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Biaya iklan Meta Ads, Google Ads, promosi influencer."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200/80 bg-white focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-full text-slate-500 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full bg-[#367C69] hover:bg-sage-700 text-white font-bold shadow-md shadow-sage-900/10 disabled:opacity-50 transition"
                >
                  {saving ? "Menyimpan..." : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
