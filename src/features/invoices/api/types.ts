import type { Order } from '@/constants/mock-db';
import type { Invoice, InvoiceStatus } from '../store/invoice-store';

export type { Invoice, InvoiceStatus };

export type InvoiceParty = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address: string;
};

export type InvoiceDocumentItem = {
  id: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type InvoiceDocumentData = {
  id: string;
  invoiceNumber: string;
  orderNumber?: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  seller: InvoiceParty;
  customer: InvoiceParty;
  items: InvoiceDocumentItem[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  notes?: string;
  codes: {
    qrPayload: string;
    barcodeValue: string;
    qrCodeDataUrl?: string;
    barcodeDataUrl?: string;
  };
};

export type InvoiceGenerationSource = Invoice | Order;
