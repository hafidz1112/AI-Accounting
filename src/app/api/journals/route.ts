import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const journals = await prisma.journalEntry.findMany({
      include: {
        document: true,
        items: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: journals });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal memuat jurnal umum.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, description, date, customItems, paymentAccountCode } = body;

    // Skenario A: Posting otomatis dari Dokumen Faktur/Struk
    if (documentId) {
      const doc = await prisma.document.findUnique({
        where: { id: documentId },
        include: { items: true },
      });

      if (!doc) {
        return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 });
      }

      if (doc.status === "POSTED") {
        return NextResponse.json({ error: "Dokumen ini sudah pernah diposting ke Buku Besar." }, { status: 400 });
      }

      // Cari akun beban (debit)
      const expenseAccountCode = doc.suggestedAccountCode || "5-1100";
      const expenseAccount = await prisma.account.findUnique({
        where: { code: expenseAccountCode },
      });

      if (!expenseAccount) {
        return NextResponse.json(
          { error: `Akun beban dengan kode ${expenseAccountCode} tidak ditemukan di COA.` },
          { status: 400 }
        );
      }

      // Cari akun kredit (Kas / Bank atau Utang)
      const payCode = paymentAccountCode || "1-1100"; // default Kas & Setara Kas
      const paymentAccount = await prisma.account.findUnique({
        where: { code: payCode },
      });

      if (!paymentAccount) {
        return NextResponse.json(
          { error: `Akun pembayaran ${payCode} tidak ditemukan di COA.` },
          { status: 400 }
        );
      }

      // Cari akun PPN Masukan jika ada pajak
      let ppnAccount = null;
      if (doc.taxAmount > 0) {
        ppnAccount = await prisma.account.findUnique({
          where: { code: "1-1300" },
        });
      }

      // Buat nomor entri jurnal unik
      const dateObj = doc.invoiceDate || new Date();
      const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, "");
      const countToday = await prisma.journalEntry.count();
      const entryNumber = `JRN-${dateStr}-${String(countToday + 1).padStart(4, "0")}`;

      const journalItemsData: any[] = [];

      // 1. Debit Akun Beban (sebesar subtotal atau total - tax)
      const expenseAmount = doc.subtotal > 0 ? doc.subtotal : doc.totalAmount - doc.taxAmount;
      journalItemsData.push({
        accountId: expenseAccount.id,
        debit: expenseAmount,
        credit: 0,
        memo: `Beban pembelian - ${doc.vendorName} (${doc.invoiceNumber || "Tanpa No Faktur"})`,
      });

      // 2. Debit Akun PPN Masukan jika ada
      if (doc.taxAmount > 0 && ppnAccount) {
        journalItemsData.push({
          accountId: ppnAccount.id,
          debit: doc.taxAmount,
          credit: 0,
          memo: `PPN Masukan faktur ${doc.vendorName}`,
        });
      }

      // 3. Kredit Akun Pembayaran (Kas/Bank atau Utang) sebesar totalAmount
      journalItemsData.push({
        accountId: paymentAccount.id,
        debit: 0,
        credit: doc.totalAmount,
        memo: `Pembayaran ke ${doc.vendorName}`,
      });

      // Validasi Double-Entry: Total Debit === Total Credit
      const totalDebit = journalItemsData.reduce((sum, item) => sum + item.debit, 0);
      const totalCredit = journalItemsData.reduce((sum, item) => sum + item.credit, 0);

      const diff = Math.abs(totalDebit - totalCredit);
      if (diff > 0.01) {
        return NextResponse.json(
          {
            error: `Prinsip Double-Entry dilanggar: Total Debit (Rp ${totalDebit.toLocaleString()}) tidak sama dengan Total Kredit (Rp ${totalCredit.toLocaleString()}).`,
          },
          { status: 400 }
        );
      }

      // Transaksi database: Simpan Jurnal dan Ubah Status Dokumen menjadi POSTED
      const newEntry = await prisma.$transaction(async (tx) => {
        const entry = await tx.journalEntry.create({
          data: {
            entryNumber,
            date: dateObj,
            description: description || `Pencatatan pengeluaran faktur ${doc.vendorName} (${doc.invoiceNumber || "-"})`,
            documentId: doc.id,
            status: "POSTED",
            items: {
              create: journalItemsData,
            },
          },
          include: {
            items: { include: { account: true } },
          },
        });

        await tx.document.update({
          where: { id: doc.id },
          data: { status: "POSTED" },
        });

        return entry;
      });

      return NextResponse.json({ success: true, data: newEntry });
    }

    // Skenario B: Manual Journal Entry
    if (customItems && Array.isArray(customItems) && customItems.length > 0) {
      let totalDebit = 0;
      let totalCredit = 0;

      for (const item of customItems) {
        totalDebit += item.debit || 0;
        totalCredit += item.credit || 0;
      }

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return NextResponse.json(
          {
            error: `Jurnal tidak seimbang! Total Debit (Rp ${totalDebit.toLocaleString()}) harus sama dengan Total Kredit (Rp ${totalCredit.toLocaleString()}).`,
          },
          { status: 400 }
        );
      }

      const dateObj = date ? new Date(date) : new Date();
      const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, "");
      const countToday = await prisma.journalEntry.count();
      const entryNumber = `JRN-${dateStr}-${String(countToday + 1).padStart(4, "0")}`;

      const newEntry = await prisma.journalEntry.create({
        data: {
          entryNumber,
          date: dateObj,
          description: description || "Jurnal Umum Manual",
          status: "POSTED",
          items: {
            create: customItems.map((item: any) => ({
              accountId: item.accountId,
              debit: item.debit || 0,
              credit: item.credit || 0,
              memo: item.memo || "",
            })),
          },
        },
        include: {
          items: { include: { account: true } },
        },
      });

      return NextResponse.json({ success: true, data: newEntry });
    }

    return NextResponse.json(
      { error: "Permintaan posting jurnal tidak valid (wajib menyertakan documentId atau customItems)." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in /api/journals:", error);
    return NextResponse.json(
      { error: "Gagal memposting jurnal ke Buku Besar.", details: error.message },
      { status: 500 }
    );
  }
}
