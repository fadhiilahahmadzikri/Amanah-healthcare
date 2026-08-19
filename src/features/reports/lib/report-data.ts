import type { Order, Product } from '@/constants/mock-db';
import type { Customer } from '@/features/customers/store/customer-store';
import type { Invoice } from '@/features/invoices/store/invoice-store';
import type { MetricChartPoint } from '@/components/charts/metric-chart-card';

export type ReportRecordKind = 'order' | 'invoice' | 'product' | 'customer';

export type ReportSources = {
  orders: Order[];
  products: Product[];
  invoices: Invoice[];
  customers: Customer[];
};

export type ReportRecord = {
  id: string;
  kind: ReportRecordKind;
  sourceId: string;
  title: string;
  subtitle: string;
  status: string;
  amount: number;
  date: string;
  details: Array<{ label: string; value: string }>;
  lineItems?: Array<{
    id: string;
    label: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
};

export type TopProductReport = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  revenue: number;
};

export type CategorySalesReport = {
  category: string;
  revenue: number;
  quantity: number;
};

export type ReportSummary = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  returnRate: number;
  lowStockCount: number;
  outstandingInvoiceAmount: number;
  activeCustomers: number;
  revenueSeries: MetricChartPoint[];
  orderSeries: MetricChartPoint[];
  averageOrderSeries: MetricChartPoint[];
  conversionSeries: MetricChartPoint[];
  returnSeries: MetricChartPoint[];
  orderStatus: Array<{ status: string; count: number; fill: string }>;
  topProducts: TopProductReport[];
  categorySales: CategorySalesReport[];
};

export const REPORT_TABLE_PAGE_SIZE = 10;
export const REPORT_TABLE_MAX_PAGES = 3;
export const REPORT_TABLE_RECORD_LIMIT = REPORT_TABLE_PAGE_SIZE * REPORT_TABLE_MAX_PAGES;

const curatedRecordTargets: Record<ReportRecordKind, number> = {
  order: 10,
  invoice: 8,
  product: 7,
  customer: 5
};

const categoryLabels: Record<string, string> = {
  'cat-1': 'Electronics',
  'cat-2': 'Groceries',
  'cat-3': 'Automotive',
  'cat-4': 'Templates'
};

export function buildReportSummary(sources: ReportSources): ReportSummary {
  const { orders, products, invoices, customers } = sources;
  const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const completedOrders = orders.filter((order) =>
    ['COMPLETED', 'DELIVERED', 'SHIPPED'].includes(order.status)
  ).length;
  const cancelledOrders = orders.filter((order) => order.status === 'CANCELLED').length;
  const outstandingInvoiceAmount = invoices
    .filter((invoice) => invoice.status === 'PENDING' || invoice.status === 'OVERDUE')
    .reduce((total, invoice) => total + invoice.totalAmount, 0);

  return {
    totalRevenue,
    totalOrders: orders.length,
    averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
    conversionRate: getRate(completedOrders, orders.length),
    returnRate: getRate(cancelledOrders, orders.length),
    lowStockCount: products.filter((product) => product.currentStock <= product.minStock).length,
    outstandingInvoiceAmount,
    activeCustomers: customers.filter((customer) => customer.status === 'Active').length,
    revenueSeries: buildOrderValueSeries(orders, 'totalAmount'),
    orderSeries: buildOrderCountSeries(orders),
    averageOrderSeries: buildAverageOrderSeries(orders),
    conversionSeries: buildStatusRateSeries(orders, ['COMPLETED', 'DELIVERED', 'SHIPPED']),
    returnSeries: buildStatusRateSeries(orders, ['CANCELLED']),
    orderStatus: buildOrderStatus(orders),
    topProducts: buildTopProducts(orders, products),
    categorySales: buildCategorySales(orders, products)
  };
}

export function buildReportRecords(sources: ReportSources): ReportRecord[] {
  return [
    ...buildOrderRecords(sources.orders),
    ...buildInvoiceRecords(sources.invoices),
    ...buildProductRecords(sources.products),
    ...buildCustomerRecords(sources.customers)
  ];
}

export function buildCuratedReportRecords(sources: ReportSources): ReportRecord[] {
  const records = buildReportRecords(sources);
  const selectedRecords = [
    ...takeRecordsByKind(records, 'order', curatedRecordTargets.order),
    ...takeRecordsByKind(records, 'invoice', curatedRecordTargets.invoice),
    ...takeRecordsByKind(records, 'product', curatedRecordTargets.product),
    ...takeRecordsByKind(records, 'customer', curatedRecordTargets.customer)
  ];
  const selectedIds = new Set(selectedRecords.map((record) => record.id));
  const remainingRecords = records
    .filter((record) => !selectedIds.has(record.id))
    .sort(compareReportRecordPriority);

  return [...selectedRecords, ...remainingRecords]
    .slice(0, REPORT_TABLE_RECORD_LIMIT)
    .sort(compareReportRecordPriority);
}

export function getReportRecordById(sources: ReportSources, reportId: string) {
  return buildReportRecords(sources).find((record) => record.id === reportId);
}

export function buildOrderRecords(orders: Order[]): ReportRecord[] {
  return orders.map((order) => ({
    id: `order-${order.id}`,
    kind: 'order',
    sourceId: order.id,
    title: order.orderNumber,
    subtitle: order.customerName,
    status: formatStatus(order.status),
    amount: order.totalAmount,
    date: order.createdAt,
    details: [
      { label: 'Customer', value: order.customerName },
      { label: 'Payment Method', value: formatStatus(order.paymentMethod) },
      { label: 'Payment Status', value: formatStatus(order.paymentStatus) },
      { label: 'Tracking Number', value: order.trackingNumber ?? '-' },
      { label: 'Items', value: String(order.items.length) }
    ],
    lineItems: order.items.map((item) => ({
      id: item.id,
      label: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.subtotal
    }))
  }));
}

export function buildInvoiceRecords(invoices: Invoice[]): ReportRecord[] {
  return invoices.map((invoice) => ({
    id: `invoice-${invoice.id}`,
    kind: 'invoice',
    sourceId: invoice.id,
    title: invoice.invoiceNumber,
    subtitle: invoice.customerName,
    status: formatStatus(invoice.status),
    amount: invoice.totalAmount,
    date: invoice.issuedAt,
    details: [
      { label: 'Customer', value: invoice.customerName },
      { label: 'Company', value: invoice.company },
      { label: 'Due Date', value: formatDate(invoice.dueDate) },
      { label: 'Subtotal', value: formatCurrency(invoice.subtotal) },
      { label: 'Tax', value: formatCurrency(invoice.tax) }
    ],
    lineItems: invoice.items.map((item) => ({
      id: item.id,
      label: item.description,
      quantity: item.qty,
      unitPrice: item.unitPrice,
      total: item.total
    }))
  }));
}

export function buildProductRecords(products: Product[]): ReportRecord[] {
  return products.map((product) => ({
    id: `product-${product.id}`,
    kind: 'product',
    sourceId: product.id,
    title: product.name,
    subtitle: product.sku,
    status: product.currentStock <= product.minStock ? 'Low Stock' : product.status,
    amount: product.price,
    date: product.updatedAt ?? product.createdAt,
    details: [
      { label: 'SKU', value: product.sku },
      { label: 'Category', value: getCategoryLabel(product.categoryId) },
      { label: 'Current Stock', value: `${product.currentStock} units` },
      { label: 'Minimum Stock', value: `${product.minStock} units` },
      { label: 'Cost', value: formatCurrency(product.cost) }
    ]
  }));
}

export function buildCustomerRecords(customers: Customer[]): ReportRecord[] {
  return customers.map((customer) => ({
    id: `customer-${customer.id}`,
    kind: 'customer',
    sourceId: customer.id,
    title: customer.name,
    subtitle: customer.company,
    status: customer.status,
    amount: customer.totalSpent,
    date: customer.joinedAt,
    details: [
      { label: 'Email', value: customer.email },
      { label: 'Phone', value: customer.phone },
      { label: 'Orders', value: String(customer.orders) },
      {
        label: 'Average Order Value',
        value: formatCurrency(getAverage(customer.totalSpent, customer.orders))
      },
      { label: 'Member Since', value: formatDate(customer.joinedAt) }
    ]
  }));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(value));
}

export function formatStatus(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function buildOrderValueSeries(orders: Order[], key: 'totalAmount') {
  return getRecentOrders(orders).map((order) => ({
    label: order.orderNumber,
    value: round(order[key])
  }));
}

function buildOrderCountSeries(orders: Order[]) {
  return chunkOrders(orders).map((bucket, index) => ({
    label: `B${index + 1}`,
    value: bucket.length
  }));
}

function buildAverageOrderSeries(orders: Order[]) {
  return chunkOrders(orders).map((bucket, index) => ({
    label: `B${index + 1}`,
    value: bucket.length
      ? round(bucket.reduce((total, order) => total + order.totalAmount, 0) / bucket.length)
      : 0
  }));
}

function buildStatusRateSeries(orders: Order[], statuses: string[]) {
  return chunkOrders(orders).map((bucket, index) => ({
    label: `B${index + 1}`,
    value: getRate(bucket.filter((order) => statuses.includes(order.status)).length, bucket.length)
  }));
}

function buildOrderStatus(orders: Order[]) {
  const statusColors = {
    Completed: 'var(--chart-1)',
    Delivered: 'var(--chart-2)',
    Shipped: 'var(--chart-3)',
    Processing: 'var(--chart-4)',
    Pending: 'var(--chart-5)',
    'Ready To Ship': 'var(--chart-3)',
    Cancelled: 'var(--destructive)'
  };

  return Object.entries(
    orders.reduce<Record<string, number>>((totals, order) => {
      const status = formatStatus(order.status);
      totals[status] = (totals[status] ?? 0) + 1;
      return totals;
    }, {})
  ).map(([status, count]) => ({
    status,
    count,
    fill: statusColors[status as keyof typeof statusColors] ?? 'var(--muted-foreground)'
  }));
}

function buildTopProducts(orders: Order[], products: Product[]) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const totals = new Map<string, TopProductReport>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const product = productMap.get(item.productId);
      const current = totals.get(item.productId) ?? {
        productId: item.productId,
        productName: product?.name ?? item.productId,
        sku: product?.sku ?? item.productId,
        quantity: 0,
        revenue: 0
      };

      current.quantity += item.quantity;
      current.revenue += item.subtotal;
      totals.set(item.productId, current);
    });
  });

  return Array.from(totals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
}

function buildCategorySales(orders: Order[], products: Product[]) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const totals = new Map<string, CategorySalesReport>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const product = productMap.get(item.productId);
      const category = getCategoryLabel(product?.categoryId ?? 'unknown');
      const current = totals.get(category) ?? {
        category,
        revenue: 0,
        quantity: 0
      };

      current.revenue += item.subtotal;
      current.quantity += item.quantity;
      totals.set(category, current);
    });
  });

  return Array.from(totals.values()).sort((a, b) => b.revenue - a.revenue);
}

function getRecentOrders(orders: Order[]) {
  return [...orders]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-12);
}

function chunkOrders(orders: Order[]) {
  const recentOrders = getRecentOrders(orders);
  const bucketSize = Math.max(1, Math.ceil(recentOrders.length / 6));
  const buckets: Order[][] = [];

  for (let index = 0; index < recentOrders.length; index += bucketSize) {
    buckets.push(recentOrders.slice(index, index + bucketSize));
  }

  return buckets;
}

function getRate(value: number, total: number) {
  return total ? round((value / total) * 100) : 0;
}

function getAverage(value: number, total: number) {
  return total ? value / total : 0;
}

function getCategoryLabel(categoryId: string) {
  return categoryLabels[categoryId] ?? categoryId;
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function takeRecordsByKind(records: ReportRecord[], kind: ReportRecordKind, limit: number) {
  return records
    .filter((record) => record.kind === kind)
    .sort(compareReportRecordPriority)
    .slice(0, limit);
}

function compareReportRecordPriority(a: ReportRecord, b: ReportRecord) {
  const dateDifference = new Date(b.date).getTime() - new Date(a.date).getTime();

  if (dateDifference !== 0) return dateDifference;

  return b.amount - a.amount;
}
