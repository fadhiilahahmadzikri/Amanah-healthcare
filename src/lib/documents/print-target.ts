'use client';

export function printElementById(elementId: string, title = 'Document') {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Print target "${elementId}" was not found.`);
  }

  const printWindow = window.open('', '_blank', 'width=900,height=900');

  if (!printWindow) {
    throw new Error('Unable to open print window.');
  }

  const styles = Array.from(
    document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style')
  )
    .map((node) => node.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        ${styles}
        <style>
          html, body { min-height: 100%; background: white; }
          body { margin: 0; padding: 24px; color: #111827; }
          @page { margin: 12mm; }
          .print-target-root { width: 100%; }
        </style>
      </head>
      <body>
        <div class="print-target-root">${element.outerHTML}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
