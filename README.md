# Sistem Otomatisasi Akuntansi dan Pembukuan Berbasis AI (AI-Powered Accounting & Double-Entry Bookkeeping)

Aplikasi web fullstack modern yang mengotomatisasi siklus akuntansi end-to-end: mulai dari ekstraksi dokumen (faktur, struk, kuitansi), kategorisasi akun otomatis berbasis *Chart of Accounts* (COA), kontrol kualitas *Human-in-the-Loop*, pembukuan berpasangan (*double-entry bookkeeping*), hingga laporan keuangan instan (Laba Rugi & Neraca).

Dibangun berdasarkan spesifikasi [Product Requirements Document (PRD)](./Berikut%20adalah%20draf%20Product%20Require.txt).

---

## 🚀 Fitur Utama

1. **AI Document Intake & OCR Parser (`/documents/new`)**
   - Menerima teks OCR mentah dari faktur, nota, atau kuitansi.
   - Mengekstrak data secara terstruktur ke dalam format JSON: nomor faktur, tanggal, nama vendor, rincian item belanja, subtotal, pajak PPN, dan total akhir.
   - Tersedia tombol cepat untuk menguji preset faktur realistis (AWS Cloud, Grab Dinas, Kopi Kenangan, WeWork Sewa Kantor).

2. **Contextual COA Engine & Categorization**
   - Menganalisis konteks vendor dan deskripsi item untuk menentukan akun debit/beban yang paling tepat:
     - `5-1100`: Biaya Operasional / Umum
     - `5-1200`: Biaya Langganan Software / Infrastruktur IT (AWS, GCP, SaaS)
     - `5-1300`: Biaya Sewa Kantor (Coworking, Gedung)
     - `5-1400`: Biaya Transportasi & Perjalanan (Grab, Tiket, Bensin)
     - `5-1500`: Biaya Konsumsi / Makan & Minum (Restoran, Jamuan Klien)
   - Mengembalikan penjelasan analitis (*reason*) mengapa akun tersebut dipilih.

3. **Human-in-the-Loop Verification (`/documents`)**
   - Tampilan berdampingan (*side-by-side*): teks asli OCR di sisi kiri dan formulir verifikasi interaktif di sisi kanan.
   - Akuntan dapat menyesuaikan nama vendor, tanggal, nominal, dan kode akun sebelum diposting.
   - Pengecekan konsistensi matematis ($\text{Subtotal} + \text{Pajak} = \text{Total}$).

4. **Buku Besar & Jurnal Berpasangan (`/ledger`)**
   - Menjalankan prinsip akuntansi berpasangan (*Double-Entry Bookkeeping*):
     $$\sum \text{Debit} = \sum \text{Credit}$$
   - Posting otomatis membagi jurnal:
     - **Debit:** Akun Beban Terkait
     - **Debit:** Akun PPN Masukan (`1-1300`) jika ada pajak
     - **Kredit:** Akun Kas & Bank (`1-1100`) atau Utang Usaha (`2-1100`)
   - Mendukung penambahan entri jurnal manual (misal: Setoran Modal Awal).

5. **Laporan Keuangan Instan (`/reports`)**
   - **Laporan Laba Rugi (Income Statement):** Pendapatan, rincian seluruh pos beban, dan Laba/Rugi Bersih secara real-time.
   - **Neraca (Balance Sheet):** Posisi Aset, Kewajiban, dan Ekuitas + Laba Berjalan, lengkap dengan verifikasi audit persamaan akuntansi ($\text{Aset} = \text{Kewajiban} + \text{Ekuitas}$).
   - Fitur Cetak / Ekspor PDF langsung dari browser.

6. **Manajemen Chart of Accounts (`/accounts`)**
   - Daftar seluruh bagan akun perusahaan (Aset, Kewajiban, Ekuitas, Pendapatan, Beban) dan fitur penambahan akun baru.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, React 18, TypeScript)
- **Styling:** Tailwind CSS & Lucide Icons
- **Database & ORM:** SQLite (pengembangan lokal tanpa konfigurasi tambahan) via Prisma ORM (siap switch ke PostgreSQL)
- **AI Processing:** Hybrid Engine — Cloud Gemini LLM API (jika API key diset) dengan Heuristic NLP Matcher berpresisi tinggi (bekerja 100% offline).

---

## 🏃 Cara Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi 18+ (disarankan Node 20 atau 24)
- npm versi 9+

### 2. Menjalankan Server Pengembangan
```bash
# Masuk ke direktori proyek
cd "Pembukuan otomatis"

# Jalankan server Next.js
npm run dev
```

Buka browser Anda di:
👉 **[http://localhost:3000](http://localhost:3000)**

### 3. Skrip Database (Opsional jika ingin reset data)
```bash
# Push skema database Prisma
npx prisma db push

# Jalankan seed data Chart of Accounts default
npm run db:seed
```

---

## 📂 Struktur Proyek

```
Pembukuan otomatis/
├── prisma/
│   ├── schema.prisma         # Skema database SQLite/PostgreSQL (Account, Document, Journal)
│   └── seed.js               # Script seeding 11 Chart of Accounts standar
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── accounts/     # CRUD Chart of Accounts
│   │   │   ├── ai/extract/   # Endpoint ekstraksi OCR & klasifikasi akun
│   │   │   ├── documents/    # Manajemen draft dokumen faktur
│   │   │   ├── journals/     # Posting jurnal double-entry (Debit == Kredit)
│   │   │   └── reports/      # Kalkulasi Laba Rugi & Neraca
│   │   ├── accounts/         # Halaman master data Chart of Accounts
│   │   ├── documents/        # Halaman panel verifikasi faktur (Human-in-the-Loop)
│   │   │   └── new/          # Halaman intake dokumen & ekstraksi AI
│   │   ├── ledger/           # Halaman Buku Besar (General Ledger)
│   │   ├── reports/          # Halaman Laporan Keuangan (Laba Rugi & Neraca)
│   │   ├── globals.css       # Tailwind stylesheet
│   │   ├── layout.tsx        # Shell layout utama dengan sidebar
│   │   └── page.tsx          # Dashboard metrik finansial
│   ├── components/
│   │   └── Sidebar.tsx       # Navigasi global
│   └── lib/
│       ├── ai-extractor.ts   # Core AI Extraction & Contextual COA Classifier
│       └── prisma.ts         # Prisma client singleton
├── package.json
└── README.md
```
