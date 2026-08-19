/**
 * print-struk.ts
 *
 * Cetak struk kasir ke printer thermal (58mm/80mm) lewat ESC/POS.
 * Tidak ada PDF maupun HTML di sini — ini langsung berupa stream
 * command yang dipahami printer thermal. Panggil printStruk() dari
 * API route / server action setelah transaksi disimpan, bukan dari
 * kode yang jalan di browser.
 *
 * QR code dan barcode digambar NATIVE oleh printer-nya sendiri lewat
 * printer.printQR() / printer.printBarcode() — sengaja tidak memakai
 * library `qrcode`/`bwip-js` di sini (itu untuk PDF, lihat
 * ../invoice-pdf/). Printer thermal sudah punya raster generator-nya
 * sendiri di firmware, jadi lebih cepat & lebih tajam hasilnya
 * dibanding ngeprint gambar QR yang di-generate terpisah.
 */

import { printer as ThermalPrinter, types as PrinterTypes } from 'node-thermal-printer';

export type ReceiptItem = {
  name: string;
  qty: number;
  price: number; // harga satuan, dalam Rupiah
};

export type ReceiptData = {
  storeName: string;
  storeAddress: string;
  cashierName: string;
  transactionId: string;
  timestamp: string; // sudah diformat, mis. "20/06/2026 14:32"
  items: ReceiptItem[];
  paymentMethod: string; // "Tunai", "QRIS", "Debit", dll.
  receiptUrl?: string; // link salinan digital struk, dicetak sebagai QR kalau ada
};

/**
 * Konfigurasi koneksi printer. Pilih salah satu sesuai printer yang
 * dipakai — ini bagian yang paling sering bikin "tidak ngeprint apa-apa"
 * kalau salah:
 *
 *   USB     : { type: PrinterTypes.EPSON, interface: "printer:AUTO" }
 *             (Linux: kalau gagal, cek device ada di /dev/usb/lp0 dan
 *             user sudah masuk grup `lp`, atau pasang udev rule)
 *   Network : { type: PrinterTypes.EPSON, interface: "tcp://192.168.1.50:9100" }
 *             (port 9100 = port raw-print standar di printer Epson/Star)
 *   Serial  : { type: PrinterTypes.EPSON, interface: "/dev/ttyUSB0" }
 *             (Windows: "COM3" dst.)
 */
export type PrinterConnectionConfig = {
  type: (typeof PrinterTypes)[keyof typeof PrinterTypes];
  interface: string;
  characterSet?: string; // mis. "WPC1252" — sesuaikan dgn manual printer kalau simbol Rupiah/aksen tercetak berantakan
};

function formatRupiah(value: number): string {
  return value.toLocaleString('id-ID');
}

/**
 * Susun seluruh isi struk dan kembalikan instance printer yang sudah
 * "diisi" buffernya. Dipisah dari proses eksekusi/cetak supaya bisa
 * dites (lewat getBuffer()) tanpa printer fisik tersambung.
 */
export function buildStrukPrinter(data: ReceiptData, connection: PrinterConnectionConfig) {
  const printer = new ThermalPrinter({
    type: connection.type,
    interface: connection.interface,
    characterSet: connection.characterSet as any,
    width: 48 // ~48 karakter untuk printer 80mm, pakai 32 untuk 58mm
  });

  printer.alignCenter();
  printer.bold(true);
  printer.setTextSize(1, 1);
  printer.println(data.storeName);
  printer.bold(false);
  printer.println(data.storeAddress);
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Kasir : ${data.cashierName}`);
  printer.println(`Waktu : ${data.timestamp}`);
  printer.println(`No.   : ${data.transactionId}`);
  printer.drawLine();

  let total = 0;
  for (const item of data.items) {
    const lineTotal = item.qty * item.price;
    total += lineTotal;
    printer.println(item.name);
    printer.tableCustom([
      { text: `${item.qty} x ${formatRupiah(item.price)}`, align: 'LEFT', width: 0.6 },
      { text: formatRupiah(lineTotal), align: 'RIGHT', width: 0.4 }
    ]);
  }
  printer.drawLine();

  printer.alignRight();
  printer.bold(true);
  printer.println(`TOTAL  Rp ${formatRupiah(total)}`);
  printer.bold(false);
  printer.println(`Bayar  ${data.paymentMethod}`);

  if (data.receiptUrl) {
    printer.newLine();
    printer.alignCenter();
    printer.println('Scan untuk salinan struk digital');
    printer.printQR(data.receiptUrl, { cellSize: 6, correction: 'M' });
  }

  printer.newLine();
  printer.alignCenter();
  printer.printBarcode(data.transactionId, 73, {
    // 73 = CODE128 di tabel symbology node-thermal-printer
    width: 2,
    height: 60,
    hriPos: 2 // 0 = sembunyikan teks, 1 = di atas barcode, 2 = di bawah (umum dipakai di struk)
  });

  printer.newLine();
  printer.println('Terima kasih!');
  printer.cut();

  return printer;
}

/**
 * Cetak struk ke printer fisik. Lempar error kalau printer tidak
 * terjangkau (mati, salah alamat IP/port, kabel USB lepas, dll) —
 * tangkap di pemanggil untuk ditunjukkan ke kasir/operator.
 */
export async function printStruk(
  data: ReceiptData,
  connection: PrinterConnectionConfig
): Promise<void> {
  const printer = buildStrukPrinter(data, connection);

  const isConnected = await printer.isPrinterConnected();
  if (!isConnected) {
    throw new Error(`Printer tidak terjangkau di "${connection.interface}". Cek koneksi/IP/kabel.`);
  }

  await printer.execute();
}
