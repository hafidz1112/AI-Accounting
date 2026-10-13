import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal memuat Chart of Accounts.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, type, normalBalance, description } = body;

    if (!code || !name || !type || !normalBalance) {
      return NextResponse.json(
        { error: "Kode, nama, tipe, dan saldo normal akun wajib diisi." },
        { status: 400 }
      );
    }

    const account = await prisma.account.upsert({
      where: { code },
      update: { name, type, normalBalance, description },
      create: { code, name, type, normalBalance, description },
    });

    return NextResponse.json({ success: true, data: account });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal menyimpan akun.", details: error.message },
      { status: 500 }
    );
  }
}
