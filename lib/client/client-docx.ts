import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { ClientPDFRenderer } from "./pdf-render";

export class ClientDocxGenerator {
  /**
   * Generates an editable Microsoft Word (.docx) document directly in-browser
   * by extracting structure, paragraphs, and text from the PDF pages.
   */
  public static async generateDocxFromPdf(
    pdfBuffer: ArrayBuffer,
    docTitle: string = "Converted Document"
  ): Promise<Blob> {
    const { pages } = await ClientPDFRenderer.extractTextFromPDF(pdfBuffer);

    const docChildren: Paragraph[] = [];

    // Add Document Title
    docChildren.push(
      new Paragraph({
        text: docTitle.replace(/\.[^/.]+$/, ""),
        heading: HeadingLevel.TITLE,
        spacing: { after: 240 },
      })
    );

    // Iterate through pages
    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const page = pages[pIdx];

      if (pIdx > 0) {
        // Page break between pages
        docChildren.push(
          new Paragraph({
            text: "",
            pageBreakBefore: true,
          })
        );
      }

      // Add page header marker
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Page ${page.pageNumber}`,
              size: 20,
              color: "888888",
              italics: true,
            }),
          ],
          spacing: { after: 120 },
        })
      );

      // Split page text by line breaks
      const lines = page.text.split("\n").filter((l) => l.trim().length > 0);

      for (const line of lines) {
        const trimmed = line.trim();

        // Detect potential headings (short lines in uppercase or ending in colon)
        if (
          trimmed.length < 50 &&
          (trimmed === trimmed.toUpperCase() || trimmed.endsWith(":"))
        ) {
          docChildren.push(
            new Paragraph({
              text: trimmed,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            })
          );
        } else {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmed,
                  size: 24, // 12pt
                }),
              ],
              spacing: { after: 140, line: 276 },
            })
          );
        }
      }
    }

    const doc = new Document({
      creator: "Everything File (Client-Side)",
      title: docTitle,
      description: "Converted safely in browser with Everything File",
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
  }
}
