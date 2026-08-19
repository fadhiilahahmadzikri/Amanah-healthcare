/**
 * print-resi.ts
 *
 * Cetak label resi pengiriman (sender/recipient + nomor AWB + tracking)
 * ke printer thermal. Sama seperti print-struk.ts, ini ESC/POS langsung
 * ke printer — bukan PDF. QR dan barcode digambar native oleh printer
 * lewat printer.printQR() / printer.printBarcode(), bukan lewat
 * `qrcode`/`bwip-js` (itu hanya relevan untuk jalur PDF di ../invoice-pdf/).
 *
 * Banyak printer thermal di gudang/packing station tersambung lewat
 * jaringan (tcp://ip:9100) karena satu printer dipakai bergantian oleh
 * beberapa komputer kasir/admin — lihat PrinterConnectionConfig di
 * print-struk.ts untuk opsi koneksi USB/Network/Serial.
 */

import { printer as ThermalPrinter } from 'node-thermal-printer';
import type { PrinterConnectionConfig } from './print-struk';

export type PartyInfo = {
  name: string;
  address: string;
  phone?: string;
};

export type ShipmentData = {
  courierName: string; // "JNE", "SiCepat", "J&T", dll.
  serviceType: string; // "REG", "Express", "Cargo", dll.
  awbNumber: string; // nomor resi/tracking dari kurir
  orderId?: string; // nomor order internal toko, kalau ada
  sender: PartyInfo;
  recipient: PartyInfo;
  weightKg: number;
  shippingCost?: number;
  codAmount?: number; // isi kalau ini paket COD, kosongkan kalau bukan
  trackingUrl?: string; // dicetak sebagai QR kalau ada
};

function formatRupiah(value: number): string {
  return 'Rp ' + value.toLocaleString('id-ID');
}

/**
 * Susun isi label resi. Dipisah dari eksekusi cetak supaya bisa dites
 * lewat getBuffer()/getText() tanpa printer fisik tersambung — sama
 * seperti pola di print-struk.ts.
 */
export function buildResiPrinter(data: ShipmentData, connection: PrinterConnectionConfig) {
  const printer = new ThermalPrinter({
    type: connection.type,
    interface: connection.interface,
    characterSet: connection.characterSet as any,
    width: 48
  });

  printer.alignCenter();
  printer.bold(true);
  printer.setTextSize(1, 1);
  printer.println(`${data.courierName} - ${data.serviceType}`);
  printer.bold(false);
  if (data.codAmount) {
    printer.println(`COD: ${formatRupiah(data.codAmount)}`);
  }
  printer.drawLine();

  printer.alignLeft();
  printer.bold(true);
  printer.println('PENERIMA:');
  printer.bold(false);
  printer.println(data.recipient.name);
  printer.println(data.recipient.address);
  if (data.recipient.phone) printer.println(`Telp: ${data.recipient.phone}`);
  printer.drawLine();

  printer.bold(true);
  printer.println('PENGIRIM:');
  printer.bold(false);
  printer.println(data.sender.name);
  printer.println(data.sender.address);
  if (data.sender.phone) printer.println(`Telp: ${data.sender.phone}`);
  printer.drawLine();

  printer.tableCustom([
    { text: `Berat: ${data.weightKg} kg`, align: 'LEFT', width: 0.5 },
    {
      text: data.shippingCost ? formatRupiah(data.shippingCost) : '',
      align: 'RIGHT',
      width: 0.5
    }
  ]);
  if (data.orderId) {
    printer.println(`Order: ${data.orderId}`);
  }
  printer.drawLine();

  // Nomor AWB digambar dua kali secara sengaja: sebagai barcode supaya
  // bisa di-scan gudang/kurir, dan sebagai teks biasa untuk dibaca manual
  // kalau scanner tidak ada di tangan.
  printer.alignCenter();
  printer.printBarcode(data.awbNumber, 73, {
    // 73 = CODE128
    width: 2,
    height: 70,
    hriPos: 2
  });

  if (data.trackingUrl) {
    printer.newLine();
    printer.println('Scan untuk lacak kiriman');
    printer.printQR(data.trackingUrl, { cellSize: 6, correction: 'M' });
  }

  printer.newLine();
  printer.cut();

  return printer;
}

/**
 * Cetak label resi ke printer fisik.
 */
export async function printResi(
  data: ShipmentData,
  connection: PrinterConnectionConfig
): Promise<void> {
  const printer = buildResiPrinter(data, connection);

  const isConnected = await printer.isPrinterConnected();
  if (!isConnected) {
    throw new Error(`Printer tidak terjangkau di "${connection.interface}". Cek koneksi/IP/kabel.`);
  }

  await printer.execute();
}
