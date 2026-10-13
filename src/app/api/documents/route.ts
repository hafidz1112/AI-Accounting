import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where = status ? { status } : {};
    const documents = await prisma.document.findMany({
      where,
      include: {
        items: true,
        journalEntry: {
          include: {
            items: {
              include: {
                account: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal memuat dokumen.", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, vendorName, invoiceNumber, invoiceDate, subtotal, taxAmount, totalAmount, suggestedAccountCode, suggestedAccountName } = body;

    if (!id) {
      return NextResponse.json({ error: "ID dokumen wajib disertakan." }, { status: 400 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        vendorName,
        invoiceNumber,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
        subtotal: subtotal !== undefined ? parseFloat(subtotal) : undefined,
        taxAmount: taxAmount !== undefined ? parseFloat(taxAmount) : undefined,
        totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : undefined,
        suggestedAccountCode,
        suggestedAccountName,
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal memperbarui dokumen.", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID dokumen wajib disertakan." }, { status: 400 });
    }

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Dokumen berhasil dihapus." });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal menghapus dokumen.", details: error.message },
      { status: 500 }
    );
  }
}
