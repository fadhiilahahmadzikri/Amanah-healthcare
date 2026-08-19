# Library research notes (June 2026)

Background research behind the choices in SKILL.md. Read this when the user pushes back on a library choice, asks "why not X", or when picking among close alternatives for their specific constraints.

## PDF generation for invoices

| Library | Weekly downloads (approx, npm trends) | Model | Notes |
|---|---|---|---|
| `jsPDF` | ~2,000,000 | Imperative API + HTML-to-PDF via html2canvas | Oldest, framework-agnostic, huge plugin ecosystem (`jspdf-autotable` for tables). Best when the project isn't React-based, or already has an HTML template to snapshot. Image-based HTML capture means text isn't selectable/searchable in the output PDF unless built with the imperative drawing API instead. |
| `@react-pdf/renderer` | ~500,000, climbing | React component tree → native PDF primitives | Best fit when the team already thinks in React components and wants the invoice's typography/colors to reuse the app's design tokens. Output is real vector text (selectable, small file size). Layout engine (Yoga) is flexbox-like but not full CSS — complex print layouts (exact multi-column grids, footnotes) can feel constrained. |
| `react-pdf` (different package — a *viewer*, not a generator) | ~1,000,000 | Renders existing PDFs in the browser via PDF.js | Easy to confuse by name with `@react-pdf/renderer`. Used for *displaying* PDFs (e-signature flows, document review), not generating them. Not relevant to invoice generation. |
| Puppeteer / Playwright (HTML→PDF) | n/a (browser automation, not PDF-specific) | Headless Chromium renders real HTML+CSS, exports to PDF | Pixel-perfect because it's the actual browser rendering engine. The production-grade choice when design fidelity matters more than bundle size. Downsides: needs a Chromium binary (large, awkward on some serverless platforms), slower per-document (hundreds of ms to seconds), and effectively requires either self-hosting the browser or paying for a PDF-rendering API service. Several hosted "HTML to PDF API" products exist specifically to take this binary-management problem off a team's plate for production Next.js apps. |

Decision rule used in SKILL.md: default to `@react-pdf/renderer` for React-native projects with moderate layout complexity; suggest Puppeteer/Playwright (or a hosted PDF API) only when the user already has a polished HTML/CSS invoice template they don't want to rebuild as components, or needs exact print-CSS features (`@page`, running headers/footers across many pages) that the React-component model doesn't express well.

## QR codes

`qrcode` (published as `qrcode` on npm, sometimes called node-qrcode) is the standard choice: actively maintained, supports `toCanvas`/`toDataURL`/`toBuffer`/`toString` (SVG) outputs, and has a CLI. For a React component wrapper (rendering a QR directly in a web page rather than inside a generated PDF), `qrcode.react` is the common pick.

Avoid: `qrcode-npm`, `qrcode-js`, `qrcodejs` — same-sounding names, all effectively unmaintained (last published years ago, tiny download counts). They show up in search results and tutorials from years back but aren't what current production code uses.

## Barcodes

| Library | Weekly downloads (approx) | Strength |
|---|---|---|
| `jsbarcode` | ~900,000 | Lightweight, Canvas/SVG, great for client-side rendering of common 1D formats (Code128, EAN). Simplest API if that's all you need. |
| `bwip-js` | ~365,000 | 100+ symbologies including 2D formats (PDF417, Data Matrix) and QR. Designed to run server-side (Node) as well as in the browser, which matters when generating a barcode image to embed in a server-rendered PDF. |

Decision rule: `bwip-js` for the invoice-PDF path because it runs cleanly on the server inside the same process that's building the PDF, and because it covers more formats if the user's invoice numbering ever needs something beyond Code128. `jsbarcode` is the better pick for a barcode rendered directly into a web page's DOM (client-side), since it's lighter and simpler for that narrower job.

## Thermal printer / ESC-POS (struk, resi)

| Library | Notes |
|---|---|
| `node-thermal-printer` | Most widely used for this; supports Epson, Star, Tanca, Daruma, Brother and generic "custom" definitions. Friendly async API (`println`, `bold`, `tableCustom`, `printQR`, `printBarcode`, `cut`, `execute`). Actively maintained. |
| `escpos` / `node-escpos` | Lower-level, also has built-in QR (`.qrimage()`) and barcode (`.barcode()`) methods. More manual device-adapter setup (separate `escpos-usb`, `escpos-network`, `escpos-serialport` packages depending on connection). Worth reaching for when a printer model isn't well supported by `node-thermal-printer`, or the project needs tighter control over raw byte sequences (e.g. unusual cash-drawer kick codes). |

Both libraries render QR/barcodes using the printer's own ESC/POS raster commands rather than rasterizing an image library's output and printing it as a bitmap — this is faster and produces a crisper code on receipt paper than the PDF-style "generate an image, then print the image" approach. This is why `qrcode`/`bwip-js` aren't part of the thermal-printer stack at all, unlike the invoice path.

## Confirmed working together (tested June 2026)

To make sure the recommendations above aren't just popularity rankings, the following was actually run end-to-end in a sandbox:
- `@react-pdf/renderer` + `qrcode` + `bwip-js`: generated a one-page A4 PDF with an embedded QR (payment link) and a Code128 barcode (invoice number), verified as a valid PDF 1.3 document.
- `node-thermal-printer`: built a full receipt command sequence (store header, table of items, total, `printQR`, `printBarcode`, paper cut) and confirmed the ESC/POS byte buffer is produced correctly via `getBuffer()` — without needing a physical printer attached, since printing only happens on `execute()`.

## Known compatibility issue worth flagging proactively

`@react-pdf/renderer` added React 19 support in v4.1.0, and works with Next.js regardless of version *if* the project is on Next.js ≥14.1.1 — versions before that have an App Router bug that crashes the server when `@react-pdf/renderer` is imported into a server component. If a user reports a server crash that mentions `@react-pdf/renderer` or Yoga, checking their Next.js version is the fastest diagnostic step.
