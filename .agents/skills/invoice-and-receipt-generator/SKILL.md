---
name: invoice-and-receipt-generator
description: Generate professional PDF invoices and print POS-style receipts (struk kasir) or shipping labels (resi) to ESC/POS thermal printers in a Next.js/React/Node.js project, complete with embedded QR codes and barcodes. Use this skill whenever the user wants to build, automate, debug, or pick a library for invoice generation, nota/struk kasir, cetak resi pengiriman, point-of-sale receipt printing, or printing QR codes/barcodes to a thermal printer — even if they just ask "library apa yang bagus untuk generate invoice" or "cara print struk ke printer thermal" without naming a specific package. Also use this when the user is debugging an existing @react-pdf/renderer, node-thermal-printer, qrcode, or escpos integration.
---

# Invoice & Receipt Generator (Next.js / Node.js)

## Two different problems wearing the same name

"Invoice" and "struk/resi" sound like the same thing — a document with a total at the bottom — but they're solved with completely different tools, because they're rendered in completely different places:

- **Invoice** = a formal A4 document meant to be downloaded, emailed, or archived. It's rendered once into a PDF file. The browser or a server function does the rendering.
- **Struk (POS receipt) / Resi (shipping label)** = a strip of text sent straight to a physical thermal printer (58mm or 80mm roll paper) at a cash register or packing station. There's no PDF involved at all — the "document" is a stream of ESC/POS command bytes that the printer's firmware turns into dots on paper.

Mixing these up is the most common mistake: people try to render a PDF and "print" it to a thermal printer, or try to use `@react-pdf/renderer` for a receipt. It technically can work but fights the hardware (wrong width, no native QR/barcode support, slow). Pick the right tool for which physical output the user actually needs.

If it's not obvious from context which one the user needs, ask — a quick "ini buat invoice resmi yang di-download/email, atau struk yang langsung ngeprint di printer kasir?" saves a lot of wasted work.

## Path A — Invoice PDF

**Stack:** `@react-pdf/renderer` for the document, `qrcode` for QR codes, `bwip-js` for barcodes.

```bash
npm install @react-pdf/renderer qrcode bwip-js
npm install -D @types/qrcode   # kalau proyeknya TypeScript — bwip-js dan @react-pdf/renderer sudah menyertakan tipenya sendiri
```

**Why this combination** (tested and confirmed working together, June 2026):

- `@react-pdf/renderer` lets you describe the invoice as React components (`Document`, `Page`, `Text`, `View`, `Image`) instead of fighting raw PDF coordinates or an HTML-to-PDF headless browser. It supports React 16–19. Its `renderToBuffer()` function is what you call from a Next.js Route Handler or Server Action to get a `Buffer` you can stream straight back as the HTTP response.
- `qrcode` (the `qrcode` npm package, not `qrcode-npm` or `qrcode-js` — there are several abandoned packages with confusingly similar names) is the standard, actively maintained QR generator for Node. `QRCode.toDataURL()` gives you a base64 image string you can drop straight into a react-pdf `<Image>`.
- `bwip-js` generates the barcode (e.g. Code128 for the invoice number) as a PNG buffer server-side, which again becomes a data URI for `<Image>`. It supports 100+ symbologies if the user ever needs EAN, PDF417, or Data Matrix instead.
- Alternative worth knowing about: if the invoice design is complex (multi-column layouts, exact pixel control, existing HTML/CSS templates) `@react-pdf/renderer`'s constrained layout primitives become limiting. In that case, Puppeteer/Playwright rendering real HTML+CSS to PDF is the better choice — slower and heavier, but pixel-perfect. Don't reach for it by default; it needs a headless Chromium binary, which complicates serverless deployment.

**Known pitfall — read before debugging blind:** `@react-pdf/renderer` components (`PDFDownloadLink`, `PDFViewer`) only work in the browser, never during Next.js server rendering. If a component using them isn't wrapped in `"use client"` plus `next/dynamic` with `ssr: false`, the build will throw `PDFDownloadLink is a web specific API`. The template in `scripts/invoice-pdf/route.ts` avoids this entirely by rendering on the server (inside a Route Handler) and only sending the finished PDF bytes to the client — no client-side react-pdf needed unless the user specifically wants an in-browser preview/download button. In a monorepo, also watch for two copies of `react` being installed (one for the Next app, one for a shared package) — `@react-pdf/renderer` silently uses the wrong reconciler version if that happens; dedupe with the workspace's lockfile or pin `react`/`react-dom` at the root.

Two smaller TypeScript-only snags confirmed while testing this template: `renderToBuffer()`'s type signature only accepts `React.ReactElement<DocumentProps>`, so passing a custom wrapper component (like `InvoiceDocument`) needs a type cast even though it works fine at runtime — see the cast in `route.ts`. And a Node `Buffer` isn't directly accepted as a Web `Response` body under `strict` mode when both DOM and Node types are loaded — wrap it as `new Uint8Array(buffer)`.

**Files to use as a starting point:**
- `scripts/invoice-pdf/InvoiceDocument.tsx` — the actual invoice layout as a react-pdf component (header, billing info, line-items table, totals, QR + barcode footer).
- `scripts/invoice-pdf/generate-codes.ts` — small helper that turns an invoice number/payment URL into the data URIs `InvoiceDocument` needs.
- `scripts/invoice-pdf/route.ts` — a Next.js App Router Route Handler (`app/api/invoice/[id]/route.ts`) that fetches invoice data, renders the PDF server-side, and returns it with the right headers so the browser either downloads it or opens it inline.

Adapt the data shape, currency formatting, and styling to match what the user already has — don't force their data into this exact schema. The structure (header → items → totals → codes) is the part worth keeping.

## Path B — Struk (POS receipt) & Resi (shipping label) on a thermal printer

**Stack:** `node-thermal-printer`.

```bash
npm install node-thermal-printer
```

**Why this one:** it's the most widely used Node library for ESC/POS thermal printers (Epson, Star, Tanca, Daruma, Brother), and — this is the key thing that makes it the right choice here — **it has QR codes and barcodes built in** (`printer.printQR()`, `printer.printBarcode()`). The printer itself renders them natively from ESC/POS commands; you do not need `qrcode` or `bwip-js` for this path at all. Reaching for those libraries here is a sign of carrying over Path A's mental model where it doesn't apply — it would mean generating a QR as an image and then printing the image, which is slower and looks worse than letting the printer draw it natively.

The lower-level alternative is `escpos`/`node-escpos`, which also has `.qrimage()` and `.barcode()` built in and gives more direct control over the byte stream (useful for serial/Bluetooth printers with quirky drivers), but `node-thermal-printer` covers the vast majority of real cash-register setups with a friendlier API and active maintenance — default to it unless the user already has an `escpos`-based codebase or a printer model `node-thermal-printer` doesn't recognize.

**Connecting to the actual printer** — the `interface` string changes by connection type, and getting this wrong is the most common "it doesn't print anything" bug:
- USB (most common for a single till): `interface: 'printer:AUTO'` or the OS device path, e.g. `/dev/usb/lp0` on Linux. On Linux this usually needs the user added to the `lp` group or a udev rule — if `execute()` hangs or throws a permissions error, that's almost always why.
- Network printer (common for kitchen/packing stations): `interface: 'tcp://<printer-ip>:9100'` — port 9100 is the standard raw-printing port on Epson/Star network printers.
- Serial: `interface: '/dev/ttyUSB0'` (Linux) or `COM3` (Windows).

**You can build and inspect the command buffer without a physical printer attached.** Every `printer.println()`, `printer.printQR()`, etc. call just appends to an internal buffer — nothing is actually sent until `printer.execute()` (or `printer.isPrinterConnected()` tries to reach it). Calling `printer.getBuffer()` returns the raw bytes, which is useful for writing tests or previewing output before a printer is on hand.

**Encoding:** receipts often have Rupiah symbols, accented names, or non-Latin characters. Set `characterSet` to match what the printer model actually supports (commonly `WPC1252` or `PC852_LATIN2` for Indonesian text; check the printer's manual) — wrong character set is the usual cause of receipts printing garbled symbols instead of letters.

**Files to use as a starting point:**
- `scripts/thermal-receipt/print-struk.ts` — POS receipt: store header, itemized list via `tableCustom`, total, QR code linking to a digital copy of the receipt, barcode of the transaction ID, paper cut.
- `scripts/thermal-receipt/print-resi.ts` — shipping label variant: courier name, sender/recipient blocks, AWB/tracking number as a Code128 barcode, QR code linking to live tracking, weight/cost line.

Both scripts are plain Node/TypeScript functions (not React) — call them from an API route, a server action, or a backend job queue whenever an order is paid or a shipment is created. They are not meant to run in the browser; thermal printers are reached from the server or a local print-agent process, not from client-side JS.

## Quick reference

| Need | Library | Output |
|---|---|---|
| Formal invoice document | `@react-pdf/renderer` | PDF buffer |
| QR code inside a PDF | `qrcode` | data URI / buffer |
| Barcode inside a PDF | `bwip-js` | data URI / buffer |
| Pixel-perfect HTML invoice design | Puppeteer/Playwright | PDF buffer (heavier) |
| POS receipt / resi on a real printer | `node-thermal-printer` | ESC/POS byte stream → printed paper |
| QR/barcode on that receipt | built into `node-thermal-printer` | — no extra library needed |

For the full research behind these picks (download counts, alternatives considered, why some popular-sounding packages were rejected), see `references/library-research.md`.
