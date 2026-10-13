import { NextRequest, NextResponse } from "next/server";
import { extractDocumentData } from "@/lib/ai-extractor";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, autoSave } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Teks dokumen OCR wajib disertakan." },
        { status: 400 }
      );
    }

    const extraction = await extractDocumentData(text);

    let savedDocument = null;
    if (autoSave !== false) {
      // Simpan dokumen draft ke database
      savedDocument = await prisma.document.create({
        data: {
          invoiceNumber: extraction.invoice_number,
          invoiceDate: extraction.invoice_date ? new Date(extraction.invoice_date) : null,
          vendorName: extraction.vendor_name,
          rawText: text,
          subtotal: extraction.subtotal,
          taxAmount: extraction.tax_amount,
          totalAmount: extraction.total_amount,
          status: "PENDING",
          suggestedAccountCode: extraction.suggested_account.account_code,
          suggestedAccountName: extraction.suggested_account.account_name,
          suggestedReason: extraction.suggested_account.reason,
          items: {
            create: extraction.line_items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              totalPrice: item.total_price,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: extraction,
      document: savedDocument,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/extract:", error);
    return NextResponse.json(
      { error: "Gagal memproses dokumen.", details: error.message },
      { status: 500 }
    );
  }
}
