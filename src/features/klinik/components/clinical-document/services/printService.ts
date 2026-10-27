import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export function printIsolatedElement(element: HTMLElement | null, title = 'Dokumen-Klinis'): void {
  if (!element) {
    if (typeof window !== 'undefined') window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.title = title;

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  const headElements = document.head.querySelectorAll('link[rel="stylesheet"], style');
  let headHtml = '';
  headElements.forEach((el) => {
    headHtml += el.outerHTML;
  });

  const printStyles = `
    <style>
      @page {
        size: A4 portrait;
        margin: 6mm 8mm;
      }
      *, *::before, *::after {
        box-sizing: border-box !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        width: 100% !important;
      }
      .no-print {
        display: none !important;
      }
      .document-page-wrapper {
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        display: block !important;
      }
      .document-a4-page {
        border: none !important;
        box-shadow: none !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 210mm !important;
        min-height: auto !important;
        padding: 0 !important;
      }
    </style>
  `;

  doc.open();
  doc.write(
    `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"/><title>${title}</title>${headHtml}${printStyles}</head><body>${element.outerHTML}</body></html>`
  );
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }
  }, 350);
}

export function printDocument(title = 'Dokumen-Klinis', element?: HTMLElement | null): void {
  const target =
    element ||
    (document
      .getElementById('isolated-clinical-printable')
      ?.querySelector('.document-a4-page') as HTMLElement) ||
    (document.querySelector('.document-a4-page') as HTMLElement);

  if (target) {
    printIsolatedElement(target, title);
  } else {
    const originalTitle = document.title;
    document.title = title;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }
}

/**
 * Direct file download for PDF (distinct from Print dialog).
 * Uses native browser SVG rasterization (html-to-image) to avoid
 * modern CSS color parser crashes (oklch, lab).
 */
export async function downloadPdfFromElement(
  element?: HTMLElement | null,
  filename = 'Dokumen-Klinis.pdf'
): Promise<void> {
  const target =
    element ||
    (document
      .getElementById('isolated-clinical-printable')
      ?.querySelector('.document-a4-page') as HTMLElement) ||
    (document.querySelector('.document-a4-page') as HTMLElement);

  if (!target) {
    throw new Error('Target A4 document element not found');
  }

  const dataUrl = await toPng(target, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
    style: {
      transform: 'none',
      margin: '0',
      boxShadow: 'none'
    }
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgProps = pdf.getImageProperties(dataUrl);
  const pdfWidth = 210;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, Math.min(297, pdfHeight));
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(cleanFilename);
}
