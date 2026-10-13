export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SuggestedAccount {
  account_code: string | null;
  account_name: string | null;
  reason: string;
}

export interface ExtractionResult {
  invoice_number: string | null;
  invoice_date: string | null;
  vendor_name: string;
  line_items: LineItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  suggested_account: SuggestedAccount;
}

export const COA_DIRECTORY: Record<string, { name: string; keywords: string[] }> = {
  "5-1200": {
    name: "Biaya Langganan Software / Infrastruktur IT",
    keywords: [
      "aws", "amazon web services", "google cloud", "gcp", "azure", "digitalocean",
      "github", "gitlab", "vercel", "heroku", "cloudflare", "openai", "chatgpt",
      "anthropic", "slack", "zoom", "notion", "figma", "canva", "adobe", "jetbrains",
      "microsoft 365", "google workspace", "domain", "hosting", "vps", "server",
      "software", "subscription", "api", "saas", "licence", "lisensi"
    ],
  },
  "5-1300": {
    name: "Biaya Sewa Kantor",
    keywords: [
      "sewa kantor", "coworking", "wework", "kolega", "gedung", "ruko", "office rent",
      "sewa gedung", "deposit sewa", "service charge kantor", "iuran gedung"
    ],
  },
  "5-1400": {
    name: "Biaya Transportasi & Perjalanan",
    keywords: [
      "grab", "gojek", "goride", "gocar", "maxim", "bluebird", "taxi", "taksi",
      "tiket", "flight", "garuda", "lion", "citilink", "kai", "kereta", "whoosh",
      "bensin", "pertamina", "shell", "spbu", "parkir", "tol", "etoll", "hotel",
      "akomodasi", "travel", "perjalanan dinas"
    ],
  },
  "5-1500": {
    name: "Biaya Konsumsi / Makan & Minum",
    keywords: [
      "kopi", "coffee", "starbucks", "kopi kenangan", "fore", "janji jiwa",
      "restoran", "restaurant", "cafe", "kafe", "makan", "minum", "lunch", "dinner",
      "warung", "catering", "katering", "snack", "gofood", "grabfood", "shopeefood",
      "mcdonalds", "kfc", "hokben", "bakmi", "padang", "konsumsi", "jamuan"
    ],
  },
  "5-1100": {
    name: "Biaya Operasional / Umum",
    keywords: [
      "pln", "listrik", "pdam", "air", "indihome", "biznet", "myrepublic", "firstmedia",
      "atk", "kertas", "alat tulis", "tinta printer", "fotokopi", "materai",
      "kebersihan", "cleaning", "security", "keamanan", "operasional", "logistik", "jne", "j&t", "sicepat"
    ],
  },
  "4-1100": {
    name: "Pendapatan Penjualan",
    keywords: ["penjualan", "sales", "jasa konsultasi", "invoice penjualan", "pelanggan", "customer"]
  },
  "1-1100": {
    name: "Kas & Setara Kas",
    keywords: ["setor tunai", "transfer masuk", "kas", "petty cash"]
  },
  "2-1100": {
    name: "Utang Usaha",
    keywords: ["tagihan tempo", "termin", "utang supplier", "tempo 30 hari"]
  }
};

/**
 * Heuristic fallback classifier & parser
 */
export function classifyAccountByContext(text: string, vendor: string): SuggestedAccount {
  const combined = `${vendor} ${text}`.toLowerCase();

  for (const [code, info] of Object.entries(COA_DIRECTORY)) {
    for (const kw of info.keywords) {
      if (combined.includes(kw)) {
        return {
          account_code: code,
          account_name: info.name,
          reason: `Terdeteksi kata kunci '${kw}' yang sesuai dengan akun ${info.name} (${code}).`,
        };
      }
    }
  }

  // Default fallback to Biaya Operasional / Umum
  return {
    account_code: "5-1100",
    account_name: "Biaya Operasional / Umum",
    reason: "Dikategorikan ke Biaya Operasional Umum karena tidak terdeteksi kategori khusus.",
  };
}

/**
 * Ekstraktor data OCR berbasis Heuristik Cerdas
 */
export function extractHeuristic(rawText: string): ExtractionResult {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let vendorName = "";
  let invoiceNumber: string | null = null;
  let invoiceDate: string | null = null;
  const lineItems: LineItem[] = [];
  let subtotal = 0;
  let taxAmount = 0;
  let totalAmount = 0;

  // 1. Ekstraksi Vendor Name (biasanya baris pertama atau kedua)
  if (lines.length > 0) {
    const candidateVendor = lines[0].replace(/^[\W_]+/, "");
    vendorName = candidateVendor.length > 50 ? candidateVendor.substring(0, 50) : candidateVendor;
  }

  // 2. Ekstraksi Nomor Invoice
  const invRegex = /(?:invoice(?:\s*number|\s*no)?|inv(?:\s*no)?|no(?:\.|\s*faktur|\s*struk|\s*kuitansi)?|bill\s*no)[\s#:.-]*([A-Z0-9\-\/]+)/i;
  for (const line of lines) {
    const match = line.match(invRegex);
    if (match && match[1] && match[1].toLowerCase() !== "number" && match[1].length >= 3) {
      invoiceNumber = match[1].trim();
      break;
    }
  }

  // 3. Ekstraksi Tanggal Transaksi
  const dateRegexStandard = /\b(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})\b/;
  const dateRegexIndo = /\b(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})\b/;
  const dateRegexWords = /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|Mei|May|Jun|Jul|Agu|Aug|Sep|Okt|Oct|Nov|Des|Dec)[a-z]*\s+(\d{4})\b/i;

  const monthMap: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", mei: "05", may: "05",
    jun: "06", jul: "07", agu: "08", aug: "08", sep: "09", okt: "10", oct: "10",
    nov: "11", des: "12", dec: "12"
  };

  for (const line of lines) {
    let match = line.match(dateRegexStandard);
    if (match) {
      const year = match[1];
      const month = match[2].padStart(2, "0");
      const day = match[3].padStart(2, "0");
      invoiceDate = `${year}-${month}-${day}`;
      break;
    }

    match = line.match(dateRegexIndo);
    if (match) {
      const day = match[1].padStart(2, "0");
      const month = match[2].padStart(2, "0");
      const year = match[3];
      invoiceDate = `${year}-${month}-${day}`;
      break;
    }

    match = line.match(dateRegexWords);
    if (match) {
      const day = match[1].padStart(2, "0");
      const mStr = match[2].toLowerCase().substring(0, 3);
      const month = monthMap[mStr] || "01";
      const year = match[3];
      invoiceDate = `${year}-${month}-${day}`;
      break;
    }
  }

  // Fallback date jika tidak ada
  if (!invoiceDate) {
    const today = new Date();
    invoiceDate = today.toISOString().split("T")[0];
  }

  // Helper untuk membersihkan angka desimal / ribuan Indonesia vs Internasional
  function parseAmount(valStr: string): number {
    let clean = valStr.replace(/[^\d.,]/g, "").trim();
    if (!clean) return 0;
    
    // Format Indo: 150.000,00 atau 150.000
    if (clean.includes(".") && clean.includes(",")) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else if (clean.includes(".") && !clean.includes(",")) {
      // Cek apakah titik pemisah ribuan (misal: 150.000)
      const parts = clean.split(".");
      if (parts.length > 1 && parts[parts.length - 1].length === 3) {
        clean = parts.join("");
      }
    } else if (clean.includes(",") && !clean.includes(".")) {
      const parts = clean.split(",");
      if (parts.length > 1 && parts[parts.length - 1].length === 3) {
        clean = parts.join("");
      } else {
        clean = clean.replace(",", ".");
      }
    }
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }

  // 4. Deteksi Total, Subtotal, Pajak/PPN
  for (const line of lines) {
    const lower = line.toLowerCase();
    
    if (lower.includes("total") && !lower.includes("sub") && !lower.includes("item")) {
      const match = line.match(/(?:rp\.?|idr)?\s*([\d.,]+)\s*$/i);
      if (match) {
        const amt = parseAmount(match[1]);
        if (amt > 0) totalAmount = amt;
      }
    } else if (lower.includes("subtotal") || lower.includes("sub total") || lower.includes("jumlah")) {
      const match = line.match(/(?:rp\.?|idr)?\s*([\d.,]+)\s*$/i);
      if (match) {
        const amt = parseAmount(match[1]);
        if (amt > 0) subtotal = amt;
      }
    } else if (lower.includes("ppn") || lower.includes("pajak") || lower.includes("tax") || lower.includes("vat")) {
      const match = line.match(/(?:rp\.?|idr)?\s*([\d.,]+)\s*$/i);
      if (match) {
        const amt = parseAmount(match[1]);
        if (amt > 0) taxAmount = amt;
      }
    }
  }

  // 5. Ekstraksi Baris Item (Line Items)
  for (const line of lines) {
    // Pola umum item: "Deskripsi 1x 150000" atau "Item name ... 50.000"
    const itemPattern = /^([a-zA-Z0-9\s\-_.,()]+?)\s+(?:(\d+)\s*[xX*]\s*)?(?:rp\.?|idr)?\s*([\d.,]+)$/i;
    const match = line.match(itemPattern);
    if (match) {
      const desc = match[1].trim();
      const lowerDesc = desc.toLowerCase();
      // Lewati keyword ringkasan
      if (
        lowerDesc.includes("total") ||
        lowerDesc.includes("subtotal") ||
        lowerDesc.includes("ppn") ||
        lowerDesc.includes("pajak") ||
        lowerDesc.includes("kembalian") ||
        lowerDesc.includes("tunai") ||
        lowerDesc.includes("cash")
      ) {
        continue;
      }

      const qty = match[2] ? parseFloat(match[2]) : 1;
      const price = parseAmount(match[3]);
      if (price > 0 && desc.length > 2) {
        lineItems.push({
          description: desc,
          quantity: qty,
          unit_price: qty > 0 ? Math.round((price / qty) * 100) / 100 : price,
          total_price: price,
        });
      }
    }
  }

  // Jika tidak terdeteksi baris item spesifik, buat item default dari total
  if (lineItems.length === 0 && totalAmount > 0) {
    lineItems.push({
      description: `Pembelian dari ${vendorName || "Vendor"}`,
      quantity: 1,
      unit_price: subtotal > 0 ? subtotal : totalAmount - taxAmount,
      total_price: subtotal > 0 ? subtotal : totalAmount - taxAmount,
    });
  }

  // Rekalkulasi matematis jika subtotal / total_amount belum terisi
  if (subtotal === 0 && lineItems.length > 0) {
    subtotal = lineItems.reduce((acc, it) => acc + it.total_price, 0);
  }

  if (totalAmount === 0) {
    totalAmount = subtotal + taxAmount;
  } else if (subtotal === 0) {
    subtotal = totalAmount - taxAmount;
  }

  // 6. Analisis Kontekstual COA
  const itemDescriptions = lineItems.map((i) => i.description).join(" ");
  const suggestedAccount = classifyAccountByContext(
    `${rawText} ${itemDescriptions}`,
    vendorName
  );

  return {
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    vendor_name: vendorName || "Vendor Tidak Diketahui",
    line_items: lineItems,
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(taxAmount * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
    suggested_account: suggestedAccount,
  };
}

/**
 * Ekstraktor Utama: Menggunakan LLM jika API Key tersedia, atau Heuristic Matcher berpresisi tinggi
 */
export async function extractDocumentData(rawText: string): Promise<ExtractionResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const prompt = `Anda adalah AI Accounting & Data Extraction Engine yang sangat akurat dan teliti, khusus bertugas memproses dokumen keuangan (seperti faktur, struk, kuitansi, atau nota pembelian) untuk sistem pembukuan otomatis berbasis double-entry.

Tugas Utama:
1. Ekstraksi data mentah dari teks OCR dokumen keuangan ke dalam format JSON terstruktur.
2. Melakukan analisis kontekstual untuk memilih akun debit/beban yang paling tepat berdasarkan Chart of Accounts (COA) perusahaan yang diberikan.
3. Memastikan tidak ada kesalahan nominal angka (harus presisi).

Daftar Chart of Accounts (COA) Perusahaan:
- 1-1100: Kas & Setara Kas (Aset)
- 1-1200: Piutang Usaha (Aset)
- 2-1100: Utang Usaha (Kewajiban)
- 4-1100: Pendapatan Penjualan (Pendapatan)
- 5-1100: Biaya Operasional / Umum (Beban)
- 5-1200: Biaya Langganan Software / Infrastruktur IT (Beban)
- 5-1300: Biaya Sewa Kantor (Beban)
- 5-1400: Biaya Transportasi & Perjalanan (Beban)
- 5-1500: Biaya Konsumsi / Makan & Minum (Beban)

Aturan Ekstraksi & Validasi:
- Tanggal harus berformat standar YYYY-MM-DD.
- Jika ada PPN (Pajak Pertambahan Nilai), pisahkan nilainya ke field tax_amount, dan pastikan total_amount adalah jumlah akhir yang harus dibayar.
- Pilih account_code yang paling relevan dari daftar COA di atas berdasarkan deskripsi item atau nama vendor.
- Jika ada informasi yang tidak ditemukan pada dokumen, isi dengan null atau string kosong "".

Format Output (WAJIB berformat JSON murni tanpa teks pengantar di luar blok JSON):
{
  "invoice_number": "string atau null",
  "invoice_date": "YYYY-MM-DD",
  "vendor_name": "string",
  "line_items": [
    {
      "description": "string",
      "quantity": number,
      "unit_price": number,
      "total_price": number
    }
  ],
  "subtotal": number,
  "tax_amount": number,
  "total_amount": number,
  "suggested_account": {
    "account_code": "string (contoh: 5-1200)",
    "account_name": "string (contoh: Biaya Langganan Software / Infrastruktur IT)",
    "reason": "Penjelasan singkat mengapa akun ini dipilih"
  }
}

Teks Dokumen OCR:
"""
${rawText}
"""`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText.trim());
          return parsed as ExtractionResult;
        }
      }
    } catch (err) {
      console.warn("AI API extraction failed, falling back to heuristic engine:", err);
    }
  }

  // Gunakan Heuristic Engine berpresisi tinggi jika tanpa API Key atau offline
  return extractHeuristic(rawText);
}
