"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  FileText,
  Upload,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Code2,
  Cpu,
} from "lucide-react";

const SAMPLE_INVOICES = [
  {
    title: "AWS Cloud Services (IT/Software)",
    text: `Amazon Web Services, Inc.
Invoice Number: INV-2026-98124
Invoice Date: 2026-10-01
Bill To: PT Solusi Cerdas Indonesia

Items:
Amazon EC2 Cloud Compute Instance 1x 1.250.000
Amazon RDS PostgreSQL Database Multi-AZ 1x 850.000
AWS S3 Standard Storage 500GB 1x 150.000

Subtotal: Rp 2.250.000
PPN 11%: Rp 247.500
Total Amount: Rp 2.497.500
Payment Method: Credit Card (Auto-Debit)`,
  },
  {
    title: "Grab for Business (Transportasi Dinas)",
    text: `Grab Holdings Inc. - E-Receipt
No. Transaksi: GRB-TRIP-772910
Tanggal: 12-10-2026
Penumpang: Ahmad Fauzi (Tim Engineering)

Rincian:
Perjalanan GrabCar Dinas Kantor - Bandara Soekarno Hatta: Rp 185.000
Biaya Parkir & Tol Bandara: Rp 35.000

Sub Total: Rp 220.000
Pajak: Rp 0
Total Pembayaran: Rp 220.000
Metode: GrabPay Corporate`,
  },
  {
    title: "Kopi Kenangan (Konsumsi / Jamuan Klien)",
    text: `KOPI KENANGAN - OUTLET MENARA MANDIRI
STRUK NO: KK-994182
TANGGAL: 13-10-2026 14:30 WIB
KASIR: Rina

1 Kopi Kenangan Mantan Large x Rp 24.000 = Rp 24.000
2 Toast Roti Daging Asap x Rp 32.000 = Rp 64.000
1 Teh Melati Selasih x Rp 18.000 = Rp 18.000

Subtotal: Rp 106.000
PB1 / Pajak Restoran 10%: Rp 10.600
TOTAL: Rp 116.600
TUNAI: Rp 120.000
KEMBALIAN: Rp 3.400`,
  },
  {
    title: "WeWork / Coworking (Sewa Kantor)",
    text: `PT Ruang Kolaborasi Kreatif (WeWork Indonesia)
INVOICE: INV/WEWORK/2026/10-088
Date: 2026-10-05

Deskripsi:
Sewa Dedicated Desk Ruang Kantor Bulan Oktober 2026: Rp 4.500.000
High Speed Internet & Meeting Room Credit: Rp 500.000

Subtotal: Rp 5.000.000
PPN (11%): Rp 550.000
Total Due: Rp 5.550.000`,
  },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!inputText.trim()) {
      setError("Silakan masukkan teks OCR atau pilih contoh faktur di atas.");
      return;
    }

    setLoading(true);
    setError(null);
    setExtractionResult(null);

    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, autoSave: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses ekstraksi.");
      }

      setExtractionResult(data.data);
      if (data.document?.id) {
        setSavedDocId(data.document.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    setError(null);
    setExtractionResult(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#E2F2EB] text-sage-800 rounded-full text-xs font-semibold mb-2">
          <Cpu className="w-3.5 h-3.5 text-sage-600" />
          <span>AI Data Extraction & Contextual COA Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Ekstraksi & Penangkapan Dokumen Faktur (OCR AI)
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Tempelkan teks OCR hasil pemindaian atau pilih contoh dokumen faktur di bawah untuk diekstrak menjadi JSON terstruktur dan dipetakan ke akun Chart of Accounts (COA).
        </p>
      </div>

      {/* Preset Samples */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Pilih Contoh Faktur Cepat untuk Pengujian:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_INVOICES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample.text)}
              className="text-left p-3.5 rounded-2xl border border-sage-100 bg-white hover:border-sage-500 hover:bg-[#F2F8F5] transition group shadow-sm"
            >
              <div className="flex items-center space-x-2 text-slate-700 group-hover:text-sage-800 font-semibold text-xs">
                <FileText className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                <span className="truncate">{sample.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {sample.text.substring(0, 70)}...
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form: Input Text & Live AI Extraction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Raw OCR Text Area */}
        <div className="bg-white p-6 rounded-3xl border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Teks Dokumen OCR Mentah</span>
            </span>
            <span className="text-xs text-slate-400">
              {inputText.length} karakter
            </span>
          </div>

          <textarea
            rows={14}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tempelkan hasil pembacaan teks OCR dari faktur, nota belanja, atau kuitansi di sini..."
            className="w-full p-4 rounded-2xl border border-sage-200/80 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent font-mono text-xs leading-relaxed text-slate-800 bg-[#F9FCFA]"
          />

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setInputText("")}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 px-3 py-2"
            >
              Kosongkan Teks
            </button>

            <button
              type="button"
              onClick={handleExtract}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#367C69] hover:bg-sage-700 text-white font-semibold text-xs shadow-md shadow-sage-900/10 disabled:opacity-50 transition"
            >
              <Sparkles className="w-4 h-4 text-gold-300" />
              <span>{loading ? "Memproses AI..." : "Ekstraksi dengan AI"}</span>
            </button>
          </div>
        </div>

        {/* Right: AI Structured JSON & Classification Preview */}
        <div className="bg-white p-6 rounded-3xl border border-sage-100 shadow-[0_4px_24px_rgba(27,61,52,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Code2 className="w-4 h-4 text-sage-600" />
              <span>Hasil JSON Terstruktur & Akun COA</span>
            </span>
            {extractionResult && (
              <span className="inline-flex items-center space-x-1 text-sage-700 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Format Tervalidasi</span>
              </span>
            )}
          </div>

          {!extractionResult ? (
            <div className="py-24 text-center space-y-2 border-2 border-dashed border-sage-100 rounded-2xl bg-sage-50/20">
              <Cpu className="w-8 h-8 text-sage-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Hasil ekstraksi JSON akan ditampilkan di sini
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Termasuk nomor invoice, rincian item belanja, pemisahan pajak PPN, dan klasifikasi akun COA otomatis.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Highlight Rekomendasi COA */}
              <div className="p-4 rounded-2xl bg-[#EAF5F0] border border-sage-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sage-900">
                    Akun Debit/Beban yang Direkomendasikan AI:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#367C69] text-white font-mono text-xs font-bold">
                    {extractionResult.suggested_account.account_code}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {extractionResult.suggested_account.account_name}
                </div>
                <p className="text-xs text-sage-800 leading-relaxed">
                  💡 {extractionResult.suggested_account.reason}
                </p>
              </div>

              {/* Summary Values */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-sage-50/60 rounded-xl border border-sage-100">
                  <div className="text-[11px] text-slate-400">Subtotal</div>
                  <div className="text-xs font-bold text-slate-900">
                    Rp {extractionResult.subtotal?.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="p-2.5 bg-sage-50/60 rounded-xl border border-sage-100">
                  <div className="text-[11px] text-slate-400">PPN / Pajak</div>
                  <div className="text-xs font-bold text-slate-900">
                    Rp {extractionResult.tax_amount?.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="p-2.5 bg-[#E2F2EB] rounded-xl border border-sage-200">
                  <div className="text-[11px] text-sage-700">Total Akhir</div>
                  <div className="text-xs font-bold text-sage-900">
                    Rp {extractionResult.total_amount?.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Raw JSON viewer */}
              <div className="relative">
                <pre className="p-4 rounded-2xl bg-[#1A3D34] text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-64 leading-tight">
                  {JSON.stringify(extractionResult, null, 2)}
                </pre>
              </div>

              {/* Action Button to Verification */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/documents")}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-full bg-[#367C69] hover:bg-sage-700 text-white font-semibold text-xs shadow-md shadow-sage-900/10 transition"
                >
                  <span>Buka Panel Verifikasi & Posting Jurnal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
