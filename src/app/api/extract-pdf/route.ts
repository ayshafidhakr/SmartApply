import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        const text = pdfData.Pages.map((page: any) =>
          page.Texts.map((t: any) =>
            t.R.map((r: any) => {
              try {
                return decodeURIComponent(r.T);
              } catch {
                return r.T;
              }
            }).join("")
          ).join(" ")
        ).join("\n");
        resolve(text);
      });

      pdfParser.on("pdfParser_dataError", (err: any) => {
        reject(err);
      });

      pdfParser.parseBuffer(buffer);
    });

    return NextResponse.json({ text });

  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json({ error: "Failed to extract PDF text" }, { status: 500 });
  }
}