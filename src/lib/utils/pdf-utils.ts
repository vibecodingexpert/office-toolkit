import { PDFDocument, PDFPage, rgb, StandardFonts, degrees, RotationTypes } from "pdf-lib"

export async function mergePDFs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create()
  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => mergedPdf.addPage(page))
  }
  const pdfBytes = await mergedPdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function splitPDF(file: File, ranges: { start: number; end: number }[]): Promise<Blob[]> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const totalPages = pdf.getPageCount()
  const results: Blob[] = []
  for (const range of ranges) {
    const newPdf = await PDFDocument.create()
    const start = Math.max(0, range.start - 1)
    const end = Math.min(totalPages, range.end)
    const indices = Array.from({ length: end - start }, (_, i) => start + i)
    const pages = await newPdf.copyPages(pdf, indices)
    pages.forEach((page) => newPdf.addPage(page))
    const pdfBytes = await newPdf.save()
    results.push(new Blob([pdfBytes as BlobPart], { type: "application/pdf" }))
  }
  return results
}

export async function extractPages(file: File, pageIndices: number[]): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const newPdf = await PDFDocument.create()
  const pages = await newPdf.copyPages(pdf, pageIndices.map((i) => i - 1))
  pages.forEach((page) => newPdf.addPage(page))
  const pdfBytes = await newPdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function deletePagesFromPDF(file: File, pagesToDelete: number[]): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const totalPages = pdf.getPageCount()
  const keepIndices = Array.from({ length: totalPages }, (_, i) => i).filter(
    (i) => !pagesToDelete.includes(i + 1)
  )
  const newPdf = await PDFDocument.create()
  const pages = await newPdf.copyPages(pdf, keepIndices)
  pages.forEach((page) => newPdf.addPage(page))
  const pdfBytes = await newPdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function reorderPagesInPDF(file: File, newOrder: number[]): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const totalPages = pdf.getPageCount()
  const validOrder = newOrder.filter((i) => i >= 1 && i <= totalPages)
  const newPdf = await PDFDocument.create()
  const pages = await newPdf.copyPages(pdf, validOrder.map((i) => i - 1))
  pages.forEach((page) => newPdf.addPage(page))
  const pdfBytes = await newPdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function rotatePDFPages(file: File, rotation: 0 | 90 | 180 | 270): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  pdf.getPages().forEach((page) => {
    page.setRotation(degrees(rotation))
  })
  const pdfBytes = await pdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function cropPDFPages(
  file: File,
  cropBox: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize()
    page.setCropBox(
      cropBox.x,
      height - cropBox.y - cropBox.height,
      cropBox.width,
      cropBox.height
    )
  })
  const pdfBytes = await pdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function addWatermarkToPDF(
  file: File,
  text: string,
  opacity: number = 0.3,
  rotation: number = -45
): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const pages = pdf.getPages()
  for (const page of pages) {
    const { width, height } = page.getSize()
    const fontSize = Math.min(width, height) / 6
    page.drawText(text, {
      x: width / 2 - (text.length * fontSize * 0.3) / 2,
      y: height / 2 - fontSize / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(rotation),
    })
  }
  const pdfBytes = await pdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function encryptPDF(file: File, password: string): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  ;(pdf as any).encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    },
  })
  const pdfBytes = await pdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function decryptPDF(file: File, password: string): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { password } as any)
  const pdfBytes = await pdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function imagesToPDF(files: File[]): Promise<Blob> {
  const pdf = await PDFDocument.create()
  for (const file of files) {
    const imageBytes = await file.arrayBuffer()
    const mimeType = file.type
    let image
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      image = await pdf.embedJpg(imageBytes)
    } else {
      image = await pdf.embedPng(imageBytes)
    }
    const page = pdf.addPage([image.width, image.height])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })
  }
  const pdfBytes = await pdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function compressPDF(file: File): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const pdfBytes = await pdf.save({ useObjectStreams: true, addDefaultPage: false })
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}

export async function addPageNumbersToPDF(
  file: File,
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center" = "bottom-center"
): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const pages = pdf.getPages()
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const { width, height } = page.getSize()
    const text = `${i + 1} / ${pages.length}`
    const fontSize = 10
    const margin = 40
    let x = 0
    let y = 0
    switch (position) {
      case "top-left":
        x = margin
        y = height - margin
        break
      case "top-right":
        x = width - margin - text.length * 6
        y = height - margin
        break
      case "bottom-left":
        x = margin
        y = margin
        break
      case "bottom-right":
        x = width - margin - text.length * 6
        y = margin
        break
      case "bottom-center":
        x = width / 2 - (text.length * 6) / 2
        y = margin
        break
    }
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })
  }
  const pdfBytes = await pdf.save()
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
}
