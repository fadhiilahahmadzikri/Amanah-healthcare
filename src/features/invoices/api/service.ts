import { mockDb, type Order, type Product } from '@/constants/mock-db';
import { useInvoiceStore, type Invoice } from '../store/invoice-store';
import type { InvoiceDocumentData, InvoiceDocumentItem } from './types';

const SELLER = {
  name: 'Manage Stock Commerce',
  email: 'billing@manage-stock.local',
  phone: '+1 (555) 018-2040',
  company: 'Manage Stock Commerce',
  address: '100 Market Street, Suite 18, San Francisco, CA'
};

export async function getInvoiceDocumentById(id: string): Promise<InvoiceDocumentData | null> {
  const invoice = useInvoiceStore
    .getState()
    .invoices.find((item) => item.id === id || item.invoiceNumber === id);

  return invoice ? buildInvoiceDocumentData(invoice) : null;
}

export function buildInvoiceDocumentData(invoice: Invoice): InvoiceDocumentData {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issuedAt: invoice.issuedAt,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    seller: SELLER,
    customer: {
      name: invoice.customerName,
      email: invoice.customerEmail,
      company: invoice.company,
      address: invoice.address
    },
    items: invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.qty,
      unitPrice: item.unitPrice,
      total: item.total
    })),
    totals: {
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      shipping: 0,
      discount: 0,
      total: invoice.totalAmount
    },
    notes: invoice.notes,
    codes: createInvoiceCodes(invoice.invoiceNumber)
  };
}

export function generateInvoiceForOrder(order: Order): InvoiceDocumentData {
  const invoice = upsertInvoiceFromOrder(order);

  return buildInvoiceDocumentData(invoice);
}

export function upsertInvoiceFromOrder(order: Order): Invoice {
  const existingInvoice = useInvoiceStore
    .getState()
    .invoices.find((invoice) => invoice.id === createOrderInvoiceId(order.id));

  if (existingInvoice) {
    return existingInvoice;
  }

  const subtotal = order.items.reduce((total, item) => total + item.subtotal, 0);
  const tax = roundCurrency(subtotal * 0.08);
  const invoice: Invoice = {
    id: createOrderInvoiceId(order.id),
    invoiceNumber: order.orderNumber.replace('ORD-', 'INV-'),
    customerName: order.customerName,
    customerEmail:
      order.customerEmail ?? `${order.customerName.replace(/\s+/g, '.').toLowerCase()}@example.com`,
    customerAvatarUrl: order.customerAvatarUrl,
    company: 'Direct Customer',
    address: order.customerAddress ?? 'Address pending confirmation',
    status: order.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
    issuedAt: order.createdAt,
    dueDate: addDays(order.createdAt, 14),
    paidAt: order.paymentStatus === 'PAID' ? order.updatedAt : undefined,
    subtotal,
    tax,
    totalAmount: roundCurrency(subtotal + tax),
    notes: `Generated from ${order.orderNumber}`,
    items: buildItemsFromOrder(order, mockDb.products)
  };

  useInvoiceStore.getState().addInvoice(invoice);
  return invoice;
}

function buildItemsFromOrder(order: Order, products: Product[]): Invoice['items'] {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return order.items.map((item) => {
    const product = productMap.get(item.productId);

    return {
      id: item.id,
      description: product ? `${product.name} (${product.sku})` : item.productId,
      unitPrice: item.unitPrice,
      qty: item.quantity,
      total: item.subtotal
    };
  });
}

export function createInvoiceDocumentFromOrder(order: Order): InvoiceDocumentData {
  const productMap = new Map(mockDb.products.map((product) => [product.id, product]));
  const items: InvoiceDocumentItem[] = order.items.map((item) => {
    const product = productMap.get(item.productId);

    return {
      id: item.id,
      description: product?.name ?? item.productId,
      sku: product?.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.subtotal
    };
  });
  const subtotal = items.reduce((total, item) => total + item.total, 0);
  const tax = roundCurrency(subtotal * 0.08);
  const shipping = 8.45;
  const discount = subtotal > 300 ? -10 : 0;
  const invoiceNumber = order.orderNumber.replace('ORD-', 'INV-');

  return {
    id: createOrderInvoiceId(order.id),
    invoiceNumber,
    orderNumber: order.orderNumber,
    status: order.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
    issuedAt: order.createdAt,
    dueDate: addDays(order.createdAt, 14),
    paidAt: order.paymentStatus === 'PAID' ? order.updatedAt : undefined,
    seller: SELLER,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.customerAddress ?? 'Address pending confirmation'
    },
    items,
    totals: {
      subtotal,
      tax,
      shipping,
      discount,
      total: roundCurrency(subtotal + tax + shipping + discount)
    },
    notes: `Invoice generated from ${order.orderNumber}.`,
    codes: createInvoiceCodes(invoiceNumber)
  };
}

function createInvoiceCodes(invoiceNumber: string) {
  return {
    qrPayload: `manage-stock://invoice/${invoiceNumber}`,
    barcodeValue: invoiceNumber
  };
}

function createOrderInvoiceId(orderId: string) {
  return `inv-${orderId}`;
}

function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}
