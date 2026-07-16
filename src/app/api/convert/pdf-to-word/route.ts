import { NextRequest, NextResponse } from "next/server"
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx"

async function extractPdfTextServer(buffer: ArrayBuffer): Promise<string> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const pdf = await getDocument({ data: buffer.slice(0) }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const sorted = (content.items as any[])
      .filter((item) => item.str.trim())
      .sort((a, b) => {
        const aY = a.transform[5]
        const bY = b.transform[5]
        const aX = a.transform[4]
        const bX = b.transform[4]
        if (Math.abs(aY - bY) < 5) return aX - bX
        return bY - aY
      })
    pages.push(sorted.map((item) => item.str).join(" "))
  }
  return pages.join("\n\n")
}

function createDocx(title: string, fileName: string, pageCount: number, text: string) {
  const textParagraphs = text
    ? text.split("\n").filter(Boolean).map(
        (line) => new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: line, size: 22 })],
        })
      )
    : [new Paragraph({
        children: [new TextRun({ text: "(No text could be extracted)", italics: true, size: 22 })],
      })]

  const doc = new Document({
    title,
    description: `Converted from ${fileName}`,
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    sections: [{
      children: [
        new Paragraph({
          spacing: { after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: title, bold: true, size: 28, font: "Calibri" })],
        }),
        new Paragraph({
          spacing: { after: 300 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Source: ${fileName}  |  Pages: ${pageCount}`, size: 18, font: "Calibri", color: "666666" })],
        }),
        new Paragraph({ spacing: { before: 200, after: 400 }, children: [new TextRun({ text: "", size: 22 })] }),
        ...textParagraphs,
      ],
    }],
  })
  return Packer.toBuffer(doc)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const format = (formData.get("format") as string) || "docx"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const fileName = file.name
    const title = fileName.replace(/\.pdf$/i, "")
    const pageCount = 0

    let extractedText: string
    try {
      extractedText = await extractPdfTextServer(buffer)
    } catch {
      extractedText = "(Text extraction unavailable for this PDF)"
    }

    const docxBuffer = await createDocx(title, fileName, pageCount, extractedText)

    let blob: Blob
    let ext: string

    switch (format) {
      case "txt": {
        const content = `Converted from: ${fileName}\n\n${extractedText}`
        blob = new Blob([content], { type: "text/plain" })
        ext = "txt"
        break
      }
      case "rtf": {
        const escaped = (s: string) => s.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}").replace(/\n/g, "\\par\n")
        const content = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Calibri;}}\n\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440\n\\pard\\b\\fs28 ${escaped(title)}\\b0\\par\n\\pard\\fs18 Source: ${escaped(fileName)}\\par\n\\pard\\fs22 ${escaped(extractedText)}\\par\n}`
        blob = new Blob([content], { type: "application/rtf" })
        ext = "rtf"
        break
      }
      default: {
        const copy = new Uint8Array(docxBuffer.length)
        copy.set(docxBuffer)
        blob = new Blob([copy], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
        ext = "docx"
      }
    }

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": blob.type,
        "Content-Disposition": `attachment; filename="${fileName.replace(/\.pdf$/i, "")}_converted.${ext}"`,
        "Content-Length": blob.size.toString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Conversion failed" }, { status: 500 })
  }
}
