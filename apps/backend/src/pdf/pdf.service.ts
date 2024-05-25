import { Injectable } from '@nestjs/common'
import * as PDFDocument from 'pdfkit'
import * as streamBuffers from 'stream-buffers'
@Injectable()
export class PdfService {
  generatePdf(): typeof PDFDocument {
    const doc = new PDFDocument()

    // Write content to PDF
    doc.fontSize(20).text('Hello, World!', 100, 100)

    return doc
  }

  mergeImagesToPdf(images: { buffer: Buffer; name: string }[]) {
    const doc = new PDFDocument()
    images.map((image: { buffer: Buffer; name: string }) => {
      doc
        .addPage()
        .image(image.buffer, undefined, undefined, {
          align: 'center',
          valign: 'center',
        })
        .text(image.name, undefined, undefined, { align: 'center' })
    })
    return doc
  }

  async generatePdfBuffer(doc: typeof PDFDocument): Promise<Buffer | false> {
    // Create a buffer stream to capture PDF content
    const bufferStream = new streamBuffers.WritableStreamBuffer()

    // Pipe the PDF content into the buffer stream
    doc.pipe(bufferStream)
    doc.end()

    // Wait for the stream to finish writing and get the buffer content
    await new Promise<void>((resolve, reject) => {
      bufferStream.on('finish', () => {
        resolve()
      })
      bufferStream.on('error', (err) => {
        reject(err)
      })
    })

    // Return the PDF buffer
    return bufferStream.getContents()
  }
}
