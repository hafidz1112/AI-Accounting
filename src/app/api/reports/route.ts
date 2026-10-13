import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        journalItems: true,
      },
    });

    const pendingDocsCount = await prisma.document.count({
      where: { status: "PENDING" },
    });

    const totalJournalCount = await prisma.journalEntry.count();

    // Hitung saldo masing-masing akun
    const accountsWithBalance = accounts.map((acc) => {
      let balance = 0;
      for (const item of acc.journalItems) {
        if (acc.normalBalance === "DEBIT") {
          balance += item.debit - item.credit;
        } else {
          balance += item.credit - item.debit;
        }
      }
      return {
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        normalBalance: acc.normalBalance,
        balance,
      };
    });

    // 1. Laba Rugi (Income Statement)
    const revenues = accountsWithBalance.filter((a) => a.type === "REVENUE");
    const expenses = accountsWithBalance.filter((a) => a.type === "EXPENSE");

    const totalRevenue = revenues.reduce((sum, r) => sum + r.balance, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.balance, 0);
    const netIncome = totalRevenue - totalExpense;

    // 2. Neraca (Balance Sheet)
    const assets = accountsWithBalance.filter((a) => a.type === "ASSET");
    const liabilities = accountsWithBalance.filter((a) => a.type === "LIABILITY");
    const equities = accountsWithBalance.filter((a) => a.type === "EQUITY");

    const totalAsset = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiability = liabilities.reduce((sum, l) => sum + l.balance, 0);
    const totalEquity = equities.reduce((sum, eq) => sum + eq.balance, 0) + netIncome;

    // Kas & Setara Kas saldo
    const cashAccount = assets.find((a) => a.code === "1-1100");
    const cashBalance = cashAccount ? cashAccount.balance : 0;

    return NextResponse.json({
      success: true,
      summary: {
        cashBalance,
        totalRevenue,
        totalExpense,
        netIncome,
        pendingDocsCount,
        totalJournalCount,
      },
      incomeStatement: {
        revenues,
        totalRevenue,
        expenses,
        totalExpense,
        netIncome,
      },
      balanceSheet: {
        assets,
        totalAsset,
        liabilities,
        totalLiability,
        equities,
        totalEquity,
        isBalanced: Math.abs(totalAsset - (totalLiability + totalEquity)) < 0.01,
      },
    });
  } catch (error: any) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Gagal menghitung laporan keuangan.", details: error.message },
      { status: 500 }
    );
  }
}
