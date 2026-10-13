const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_COA = [
  {
    code: "1-1100",
    name: "Kas & Setara Kas",
    type: "ASSET",
    normalBalance: "DEBIT",
    description: "Kas tunai, saldo rekening bank perusahaan, dan e-wallet operasional.",
  },
  {
    code: "1-1200",
    name: "Piutang Usaha",
    type: "ASSET",
    normalBalance: "DEBIT",
    description: "Tagihan kepada pelanggan atas penjualan barang atau jasa secara tempo.",
  },
  {
    code: "1-1300",
    name: "PPN Masukan",
    type: "ASSET",
    normalBalance: "DEBIT",
    description: "Pajak Pertambahan Nilai yang telah dibayar pada pembelian barang/jasa.",
  },
  {
    code: "2-1100",
    name: "Utang Usaha",
    type: "LIABILITY",
    normalBalance: "CREDIT",
    description: "Kewajiban pembayaran kepada vendor atau pemasok atas pembelian kredit.",
  },
  {
    code: "3-1100",
    name: "Modal Usaha",
    type: "EQUITY",
    normalBalance: "CREDIT",
    description: "Ekuitas awal pemilik dan laba ditahan.",
  },
  {
    code: "4-1100",
    name: "Pendapatan Penjualan",
    type: "REVENUE",
    normalBalance: "CREDIT",
    description: "Pendapatan dari penjualan produk atau jasa utama.",
  },
  {
    code: "5-1100",
    name: "Biaya Operasional / Umum",
    type: "EXPENSE",
    normalBalance: "DEBIT",
    description: "Biaya utilitas, ATK, pemeliharaan, dan biaya operasional sehari-hari.",
  },
  {
    code: "5-1200",
    name: "Biaya Langganan Software / Infrastruktur IT",
    type: "EXPENSE",
    normalBalance: "DEBIT",
    description: "Langganan cloud server (AWS/GCP/Vercel), domain, SaaS (Slack, Notion, Zoom, OpenAI).",
  },
  {
    code: "5-1300",
    name: "Biaya Sewa Kantor",
    type: "EXPENSE",
    normalBalance: "DEBIT",
    description: "Biaya sewa ruang kantor, coworking space, atau fasilitas kerja.",
  },
  {
    code: "5-1400",
    name: "Biaya Transportasi & Perjalanan",
    type: "EXPENSE",
    normalBalance: "DEBIT",
    description: "Tiket perjalanan dinas, bensin, Grab/Gojek operasional, dan parkir.",
  },
  {
    code: "5-1500",
    name: "Biaya Konsumsi / Makan & Minum",
    type: "EXPENSE",
    normalBalance: "DEBIT",
    description: "Snack kantor, makan siang meeting klien, jamuan, dan katering.",
  },
];

async function main() {
  console.log("Seeding default Chart of Accounts (COA)...");
  for (const account of DEFAULT_COA) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: {
        name: account.name,
        type: account.type,
        normalBalance: account.normalBalance,
        description: account.description,
      },
      create: account,
    });
  }
  console.log("Seeding selesai! Total akun:", DEFAULT_COA.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
