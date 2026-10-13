"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Trash2,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function VerificationPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Editable form state for selected document
  const [formVendor, setFormVendor] = useState("");
  const [formInvoiceNo, setFormInvoiceNo] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formSubtotal, setFormSubtotal] = useState<number>(0);
  const [formTax, setFormTax] = useState<number>(0);
  const [formTotal, setFormTotal] = useState<number>(0);
  const [formExpenseCode, setFormExpenseCode] = useState("");
  const [formPaymentCode, setFormPaymentCode] = useState("1-1100");

  const loadData = async () => {
    setLoading(true);
    try {
      const [docRes, accRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/accounts"),
      ]);
      const docData = await docRes.json();
      const accData = await accRes.json();

      if (docData.success) {
        setDocuments(docData.data);
        if (docData.data.length > 0) {
          selectDocument(docData.data[0]);
        } else {
          setSelectedDoc(null);
        }
      }
      if (accData.success) {
        setAccounts(accData.data);
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

  const selectDocument = (doc: any) => {
    setSelectedDoc(doc);
    setFormVendor(doc.vendorName || "");
    setFormInvoiceNo(doc.invoiceNumber || "");
    setFormDate(doc.invoiceDate ? doc.invoiceDate.split("T")[0] : new Date().toISOString().split("T")[0]);
    setFormSubtotal(doc.subtotal || 0);
    setFormTax(doc.taxAmount || 0);
    setFormTotal(doc.totalAmount || 0);
    setFormExpenseCode(doc.suggestedAccountCode || "5-1100");
    setFormPaymentCode("1-1100");
    setFeedback(null);
  };

  const handlePostToLedger = async () => {
    if (!selectedDoc) return;
    setPosting(true);
    setFeedback(null);

    try {
      // 1. Simpan perubahan verifikasi jika ada
      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDoc.id,
          vendorName: formVendor,
          invoiceNumber: formInvoiceNo,
          invoiceDate: formDate,
          subtotal: formSubtotal,
          taxAmount: formTax,
          totalAmount: formTotal,
          suggestedAccountCode: formExpenseCode,
        }),
      });

      // 2. Eksekusi posting ke Buku Besar (Double-Entry)
      const postRes = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          paymentAccountCode: formPaymentCode,
        }),
      });

      const postData = await postRes.json();
      if (!postRes.ok) {
        throw new Error(postData.error || "Gagal memposting ke Buku Besar.");
      }

      setFeedback({
        type: "success",
        message: `Faktur berhasil diverifikasi dan diposting ke Buku Besar dengan nomor entri ${postData.data.entryNumber}!`,
      });

      // Reload data
      await loadData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (filter === "PENDING") return d.status === "PENDING";
    if (filter === "POSTED") return d.status === "POSTED";
    return true;
  });

  const isMathBalanced = Math.abs(formSubtotal + formTax - formTotal) < 1;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Human-in-the-Loop Quality Control</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Panel Verifikasi & Validasi Dokumen
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tinjau hasil ekstraksi AI dan pastikan kepatuhan prinsip Double-Entry sebelum difinalisasi ke Buku Besar.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/documents/new"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Unggah Faktur Baru</span>
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Layout: List on Left, Side-by-side Review on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Documents Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Antrean Faktur ({filteredDocs.length})
            </span>
            <div className="flex space-x-1 text-[11px]">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-2 py-1 rounded-lg font-medium transition ${
                  filter === "ALL" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-2 py-1 rounded-lg font-medium transition ${
                  filter === "PENDING" ? "bg-amber-600 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("POSTED")}
                className={`px-2 py-1 rounded-lg font-medium transition ${
                  filter === "POSTED" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Posted
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Memuat antrean...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada dokumen pada filter ini.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => selectDocument(doc)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {doc.vendorName}
                      </span>
                      {doc.status === "POSTED" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          POSTED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          PENDING
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span>{doc.invoiceNumber || "Tanpa No. Inv"}</span>
                      <span className="font-bold text-slate-800">
                        Rp {doc.totalAmount?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Side-by-Side Review & Verification (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedDoc ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 text-sm">
              Pilih dokumen faktur dari daftar di sebelah kiri untuk memulai peninjauan.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Document Overview & Action Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                      <span>Verifikasi Faktur: {formVendor}</span>
                      {selectedDoc.status === "POSTED" && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                          Sudah Masuk Buku Besar
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ID Dokumen: {selectedDoc.id}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedDoc.status !== "POSTED" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedDoc.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Split: Left Raw Text, Right Verification Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left: OCR Original Text */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dokumen Asli (Teks OCR)</span>
                    </label>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {selectedDoc.rawText || "Tidak ada teks mentah."}
                    </div>

                    {selectedDoc.suggestedReason && (
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                        <span className="font-bold flex items-center space-x-1 mb-1">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>Analisis AI:</span>
                        </span>
                        {selectedDoc.suggestedReason}
                      </div>
                    )}
                  </div>

                  {/* Right: Editable Verification Fields */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Data Tervalidasi</span>
                    </label>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">Nama Vendor / Supplier</span>
                        <input
                          type="text"
                          value={formVendor}
                          onChange={(e) => setFormVendor(e.target.value)}
                          disabled={selectedDoc.status === "POSTED"}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">Nomor Faktur / Invoice</span>
                          <input
                            type="text"
                            value={formInvoiceNo}
                            onChange={(e) => setFormInvoiceNo(e.target.value)}
                            disabled={selectedDoc.status === "POSTED"}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">Tanggal Transaksi</span>
                          <input
                            type="date"
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            disabled={selectedDoc.status === "POSTED"}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">Subtotal</span>
                          <input
                            type="number"
                            value={formSubtotal}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setFormSubtotal(val);
                              setFormTotal(val + formTax);
                            }}
                            disabled={selectedDoc.status === "POSTED"}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">PPN (Pajak)</span>
                          <input
                            type="number"
                            value={formTax}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setFormTax(val);
                              setFormTotal(formSubtotal + val);
                            }}
                            disabled={selectedDoc.status === "POSTED"}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">Total Akhir</span>
                          <input
                            type="number"
                            value={formTotal}
                            onChange={(e) => setFormTotal(parseFloat(e.target.value) || 0)}
                            disabled={selectedDoc.status === "POSTED"}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Math Consistency Status */}
                      <div className="text-[11px] flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span>Konsistensi Nilai:</span>
                        {isMathBalanced ? (
                          <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Presisi (Subtotal + PPN = Total)</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Selisih nominal terdeteksi</span>
                          </span>
                        )}
                      </div>

                      {/* COA Accounts Selection */}
                      <div className="pt-2 border-t border-slate-100 space-y-3">
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Akun Beban (Debit)
                          </span>
                          <select
                            value={formExpenseCode}
                            onChange={(e) => setFormExpenseCode(e.target.value)}
                            disabled={selectedDoc.status === "POSTED"}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            {accounts
                              .filter((a) => a.type === "EXPENSE")
                              .map((a) => (
                                <option key={a.id} value={a.code}>
                                  {a.code} - {a.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Akun Pembayaran (Kredit)
                          </span>
                          <select
                            value={formPaymentCode}
                            onChange={(e) => setFormPaymentCode(e.target.value)}
                            disabled={selectedDoc.status === "POSTED"}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="1-1100">1-1100 - Kas & Setara Kas (Dibayar Tunai / Transfer)</option>
                            <option value="2-1100">2-1100 - Utang Usaha (Pembelian Tempo / Kredit)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Double-Entry Balancing Preview */}
                <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Pratinjau Jurnal Double-Entry yang Akan Diposting</span>
                    <span className="text-emerald-400">ΣDebit = ΣKredit</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    {/* Debit row */}
                    <div className="flex items-center justify-between text-blue-300">
                      <span>[DEBIT] {formExpenseCode} Beban</span>
                      <span>Rp {formSubtotal.toLocaleString("id-ID")}</span>
                    </div>

                    {/* Tax debit if any */}
                    {formTax > 0 && (
                      <div className="flex items-center justify-between text-blue-300">
                        <span>[DEBIT] 1-1300 PPN Masukan</span>
                        <span>Rp {formTax.toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    {/* Credit row */}
                    <div className="flex items-center justify-between text-rose-300">
                      <span>[KREDIT] {formPaymentCode} {formPaymentCode === "1-1100" ? "Kas & Bank" : "Utang Usaha"}</span>
                      <span>Rp {formTotal.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                {/* Post Action Button */}
                {selectedDoc.status !== "POSTED" ? (
                  <button
                    type="button"
                    onClick={handlePostToLedger}
                    disabled={posting}
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {posting ? "Memproses Posting Jurnal..." : "Konfirmasi & Posting ke Buku Besar (General Ledger)"}
                    </span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Faktur ini telah berhasil diposting ke Buku Besar.</span>
                    </div>
                    <Link
                      href="/ledger"
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span>Lihat Buku Besar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
