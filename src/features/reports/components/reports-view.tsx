'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  useQueryStates
} from 'nuqs';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from 'recharts';

import { MetricChartCard } from '@/components/charts/metric-chart-card';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DefaultBulkActions } from '@/components/ui/table/default-bulk-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { cn } from '@/lib/utils';
import { mockDb } from '@/constants/mock-db';
import { useCustomerStore } from '@/features/customers/store/customer-store';
import { useInvoiceStore } from '@/features/invoices/store/invoice-store';
import { useOrderStore } from '@/features/orders/store/order-store';
import { CalendarDateRangePicker } from './date-range-picker';
import { ReportPDF } from './report-pdf';
import {
  REPORT_TABLE_MAX_PAGES,
  REPORT_TABLE_PAGE_SIZE,
  buildCuratedReportRecords,
  buildReportSummary,
  formatCurrency,
  formatDate,
  type CategorySalesReport,
  type ReportRecord,
  type ReportSources,
  type TopProductReport
} from '../lib/report-data';

const PDFDownloadButton = dynamic(() => import('@/components/pdf/pdf-download-button'), {
  ssr: false
});

const revenueChartConfig = {
  value: {
    label: 'Revenue',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

const categoryChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

const statusChartConfig = {
  count: {
    label: 'Orders'
  }
} satisfies ChartConfig;

function NoDataPlaceholder() {
  return (
    <div className='flex h-full min-h-[200px] w-full items-center justify-center rounded-md border border-dashed border-muted p-8'>
      <div className='flex flex-col items-center justify-center text-muted-foreground'>
        <Icons.info className='mb-2 h-8 w-8 opacity-50' />
        <p className='text-sm font-medium'>No data for selected period</p>
        <p className='text-xs opacity-70'>Try adjusting the date range.</p>
      </div>
    </div>
  );
}

export default function ReportsView() {
  const router = useRouter();
  const { orders } = useOrderStore();
  const { invoices } = useInvoiceStore();
  const { customers } = useCustomerStore();
  const products = mockDb.products;

  const [dateParams] = useQueryStates({
    from: parseAsIsoDateTime,
    to: parseAsIsoDateTime
  });

  const sources = useMemo<ReportSources>(() => {
    let filteredOrders = orders;
    let filteredInvoices = invoices;
    let filteredCustomers = customers;

    if (dateParams.from && dateParams.to) {
      const fromTime = dateParams.from.getTime();
      const toDate = new Date(dateParams.to);
      toDate.setHours(23, 59, 59, 999);
      const toTime = toDate.getTime();

      filteredOrders = orders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= fromTime && t <= toTime;
      });
      filteredInvoices = invoices.filter((i) => {
        const t = new Date(i.issuedAt).getTime();
        return t >= fromTime && t <= toTime;
      });
      filteredCustomers = customers.filter((c) => {
        const t = new Date(c.joinedAt || Date.now()).getTime();
        return t >= fromTime && t <= toTime;
      });
    }

    return {
      orders: filteredOrders,
      products,
      invoices: filteredInvoices,
      customers: filteredCustomers
    };
  }, [orders, products, invoices, customers, dateParams.from, dateParams.to]);
  const summary = useMemo(() => buildReportSummary(sources), [sources]);
  const reportRecords = useMemo(() => buildCuratedReportRecords(sources), [sources]);

  const openReport = (record: ReportRecord) => {
    router.push(`/dashboard/reports/${record.id}`);
  };

  return (
    <PageContainer
      scrollable
      pageTitle='Reports'
      pageDescription='Business performance, sales health, and operational recaps.'
      pageHeaderAction={
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <CalendarDateRangePicker />
          <PDFDownloadButton
            document={
              <ReportPDF
                sources={sources}
                appendixRecords={reportRecords}
                dateParams={dateParams}
              />
            }
            fileName={`Report_${Date.now()}.pdf`}
            buttonText='Download PDF'
          />
        </div>
      }
    >
      <Tabs defaultValue='analysis' className='flex flex-col gap-4'>
        <TabsList>
          <TabsTrigger value='analysis'>
            <Icons.barChart className='mr-1 h-4 w-4' /> Analysis
          </TabsTrigger>
          <TabsTrigger value='tables'>
            <Icons.page className='mr-1 h-4 w-4' /> Tables
          </TabsTrigger>
        </TabsList>

        <TabsContent value='analysis' className='flex flex-col gap-4'>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <MetricChartCard
              title='Total Revenue'
              value={formatCurrency(summary.totalRevenue)}
              description={`${summary.totalOrders} orders captured`}
              data={summary.revenueSeries}
              icon={<Icons.billing className='h-5 w-5' />}
              trendLabel={getTrendLabel(summary.revenueSeries)}
              trendDirection={getTrendDirection(summary.revenueSeries)}
              tone='success'
            />
            <MetricChartCard
              title='Avg. Order Value'
              value={formatCurrency(summary.averageOrderValue)}
              description='Revenue efficiency per order'
              data={summary.averageOrderSeries}
              icon={<Icons.receipt className='h-5 w-5' />}
              trendLabel={getTrendLabel(summary.averageOrderSeries)}
              trendDirection={getTrendDirection(summary.averageOrderSeries)}
              tone='info'
            />
            <MetricChartCard
              title='Conversion Rate'
              value={`${summary.conversionRate.toFixed(1)}%`}
              description='Completed, delivered, or shipped'
              data={summary.conversionSeries}
              icon={<Icons.trendingUp className='h-5 w-5' />}
              trendLabel={getTrendLabel(summary.conversionSeries, '%')}
              trendDirection={getTrendDirection(summary.conversionSeries)}
              tone='primary'
            />
            <MetricChartCard
              title='Return Rate'
              value={`${summary.returnRate.toFixed(1)}%`}
              description={`${summary.lowStockCount} products need restock`}
              data={summary.returnSeries}
              icon={<Icons.warning className='h-5 w-5' />}
              trendLabel={getTrendLabel(summary.returnSeries, '%')}
              trendDirection={getTrendDirection(summary.returnSeries, true)}
              tone='warning'
            />
          </div>

          <div className='grid gap-4 xl:grid-cols-[2fr_1fr]'>
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Recent revenue movement from completed order activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary.revenueSeries.length > 0 ? (
                  <ChartContainer config={revenueChartConfig} className='h-80 w-full aspect-auto'>
                    <AreaChart
                      accessibilityLayer
                      data={summary.revenueSeries}
                      margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray='3 3' />
                      <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator='line' />}
                      />
                      <defs>
                        <linearGradient id='reports-revenue-fill' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='var(--color-value)' stopOpacity={0.42} />
                          <stop offset='95%' stopColor='var(--color-value)' stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey='value'
                        type='monotone'
                        stroke='var(--color-value)'
                        fill='url(#reports-revenue-fill)'
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className='h-80 w-full'>
                    <NoDataPlaceholder />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Distribution of current order states.</CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col gap-4'>
                {summary.orderStatus.length > 0 ? (
                  <>
                    <ChartContainer
                      config={statusChartConfig}
                      className='mx-auto h-56 w-full aspect-auto'
                    >
                      <PieChart accessibilityLayer>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel nameKey='status' />}
                        />
                        <Pie
                          data={summary.orderStatus}
                          dataKey='count'
                          nameKey='status'
                          innerRadius={54}
                          outerRadius={78}
                          strokeWidth={2}
                        >
                          {summary.orderStatus.map((entry) => (
                            <Cell key={entry.status} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className='flex flex-col gap-2'>
                      {summary.orderStatus.map((entry) => (
                        <div
                          key={entry.status}
                          className='flex items-center justify-between gap-3 text-sm'
                        >
                          <div className='flex items-center gap-2'>
                            <span
                              className='size-2 rounded-full'
                              style={{ backgroundColor: entry.fill }}
                            />
                            <span className='text-muted-foreground'>{entry.status}</span>
                          </div>
                          <span className='font-medium'>{entry.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className='flex h-56 w-full items-center justify-center'>
                    <NoDataPlaceholder />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 xl:grid-cols-[1.3fr_1fr]'>
            <TopProductsCard products={summary.topProducts} />
            <CategorySalesCard categories={summary.categorySales} />
          </div>
        </TabsContent>

        <TabsContent value='tables'>
          <ReportRecordsDataTable records={reportRecords} onRowClick={openReport} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function TopProductsCard({ products }: { products: TopProductReport[] }) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between gap-3'>
        <div>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performers from order line items.</CardDescription>
        </div>
        <Badge variant='outline'>Top {products.length}</Badge>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className='text-right'>Sold</TableHead>
                <TableHead className='text-right'>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{product.productName}</span>
                      <span className='text-xs text-muted-foreground'>{product.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-right font-medium'>{product.quantity}</TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCurrency(product.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <NoDataPlaceholder />
        )}
      </CardContent>
    </Card>
  );
}

function CategorySalesCard({ categories }: { categories: CategorySalesReport[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription>Revenue contribution across product groups.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={categoryChartConfig} className='h-72 w-full aspect-auto'>
          <BarChart
            accessibilityLayer
            data={categories}
            layout='vertical'
            margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray='3 3' />
            <XAxis
              type='number'
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <YAxis
              dataKey='category'
              type='category'
              tickLine={false}
              axisLine={false}
              width={86}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
            <Bar dataKey='revenue' fill='var(--color-revenue)' radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ReportRecordsDataTable({
  records,
  onRowClick
}: {
  records: ReportRecord[];
  onRowClick: (record: ReportRecord) => void;
}) {
  const columns = useMemo<ColumnDef<ReportRecord>[]>(
    () => [
      {
        id: 'title',
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Record' />,
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <span className='font-medium'>{row.original.title}</span>
            <span className='text-xs text-muted-foreground'>{row.original.subtitle}</span>
          </div>
        ),
        enableColumnFilter: true,
        meta: {
          label: 'Record',
          placeholder: 'Search report records...',
          variant: 'text'
        }
      },
      {
        id: 'kind',
        accessorKey: 'kind',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
        cell: ({ row }) => <Badge variant='secondary'>{formatKind(row.original.kind)}</Badge>,
        enableColumnFilter: true,
        meta: {
          label: 'Type',
          variant: 'multiSelect',
          options: [
            { value: 'order', label: 'Orders' },
            { value: 'invoice', label: 'Invoices' },
            { value: 'product', label: 'Products' },
            { value: 'customer', label: 'Customers' }
          ]
        }
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => (
          <Badge
            variant='outline'
            className={cn('border', getStatusClassName(row.original.status))}
          >
            {row.original.status}
          </Badge>
        )
      },
      {
        id: 'date',
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => (
          <span className='whitespace-nowrap text-muted-foreground'>
            {formatDate(row.original.date)}
          </span>
        )
      },
      {
        id: 'amount',
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => (
          <span className='font-medium'>{formatCurrency(row.original.amount)}</span>
        )
      }
    ],
    []
  );
  const columnIds = useMemo(() => ['title', 'kind', 'status', 'date', 'amount'], []);
  const [params, setTableParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser(columnIds).withDefault([]),
    title: parseAsString,
    kind: parseAsArrayOf(parseAsString, ',')
  });
  const searchValue = params.title?.trim() ?? '';
  const selectedKinds = useMemo(() => getValidReportKinds(params.kind), [params.kind]);
  const hasBlankTitleFilter = Boolean(params.title && searchValue.length === 0);
  const hasInvalidKindFilter = hasInvalidReportKinds(params.kind);
  const filteredRecords = useMemo(() => {
    return getFilteredReportRecords(records, {
      search: searchValue,
      kinds: selectedKinds,
      sort: params.sort
    });
  }, [records, searchValue, selectedKinds, params.sort]);
  const sortedRecords = useMemo(() => {
    return getFilteredReportRecords(records, {
      search: '',
      kinds: [],
      sort: params.sort
    });
  }, [records, params.sort]);
  const hasActiveFilter =
    searchValue.length > 0 ||
    selectedKinds.length > 0 ||
    hasBlankTitleFilter ||
    hasInvalidKindFilter;
  const shouldResetFilters = hasActiveFilter && filteredRecords.length === 0 && records.length > 0;
  const visibleRecords = shouldResetFilters ? sortedRecords : filteredRecords;
  const pageCount = getReportPageCount(visibleRecords.length);
  const currentPage = clampPage(params.page, pageCount);
  useEffect(() => {
    const nextParams: {
      page?: number | null;
      perPage?: number | null;
      title?: string | null;
      kind?: string[] | null;
    } = {};

    if (params.page !== currentPage || shouldResetFilters) {
      nextParams.page = shouldResetFilters ? 1 : currentPage;
    }

    if (params.perPage !== REPORT_TABLE_PAGE_SIZE) {
      nextParams.perPage = REPORT_TABLE_PAGE_SIZE;
    }

    if (shouldResetFilters || hasBlankTitleFilter) {
      nextParams.title = null;
    }

    if (shouldResetFilters || hasInvalidKindFilter) {
      nextParams.kind = null;
    }

    if (Object.keys(nextParams).length > 0) {
      void setTableParams(nextParams);
    }
  }, [
    currentPage,
    hasBlankTitleFilter,
    hasInvalidKindFilter,
    params.page,
    params.perPage,
    setTableParams,
    shouldResetFilters
  ]);

  const { table } = useDataTable({
    data: visibleRecords,
    columns,
    pageCount,
    manualPagination: false,
    initialState: {
      sorting: params.sort,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: REPORT_TABLE_PAGE_SIZE
      }
    }
  });

  return (
    <Card className='min-h-[620px]'>
      <CardHeader>
        <CardTitle>Report Records</CardTitle>
        <CardDescription>
          Read-only operational recap across orders, invoices, products, and customers.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex h-[520px] min-h-0 flex-col'>
        <DataTable
          table={table}
          onRowClick={onRowClick}
          entityName='report'
          bulkActions={<DefaultBulkActions />}
        >
          <DataTableToolbar table={table} />
        </DataTable>
      </CardContent>
    </Card>
  );
}

function getTrendLabel(data: Array<{ value: number }>, suffix = '') {
  const delta = getSeriesDelta(data);
  const sign = delta > 0 ? '+' : '';

  return `${sign}${delta.toFixed(1)}${suffix}`;
}

type SortValue = string | number;

function compareSortValues(a: SortValue, b: SortValue, desc: boolean) {
  const result =
    typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));

  return desc ? -result : result;
}

function getReportSortValue(record: ReportRecord, columnId: string): SortValue {
  switch (columnId) {
    case 'title':
      return record.title;
    case 'kind':
      return record.kind;
    case 'status':
      return record.status;
    case 'date':
      return new Date(record.date).getTime();
    case 'amount':
      return record.amount;
    default:
      return '';
  }
}

function getTrendDirection(data: Array<{ value: number }>, inverse = false) {
  const delta = getSeriesDelta(data);

  if (delta === 0) return 'neutral';

  const isPositive = inverse ? delta < 0 : delta > 0;
  return isPositive ? 'up' : 'down';
}

function getSeriesDelta(data: Array<{ value: number }>) {
  if (data.length < 2) return 0;

  return data[data.length - 1].value - data[0].value;
}

function getStatusClassName(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes('paid') ||
    normalizedStatus.includes('active') ||
    normalizedStatus.includes('completed') ||
    normalizedStatus.includes('delivered') ||
    normalizedStatus.includes('shipped')
  ) {
    return 'bg-green-500/10 text-green-500 border-green-500/20';
  }

  if (
    normalizedStatus.includes('pending') ||
    normalizedStatus.includes('processing') ||
    normalizedStatus.includes('ready') ||
    normalizedStatus.includes('low stock')
  ) {
    return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  }

  if (
    normalizedStatus.includes('cancelled') ||
    normalizedStatus.includes('overdue') ||
    normalizedStatus.includes('inactive')
  ) {
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  }

  return 'bg-muted text-muted-foreground';
}

function formatKind(kind: ReportRecord['kind']) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

const REPORT_KINDS: ReportRecord['kind'][] = ['order', 'invoice', 'product', 'customer'];

function getValidReportKinds(kinds: string[] | null): ReportRecord['kind'][] {
  if (!kinds) {
    return [];
  }

  return kinds.filter((kind): kind is ReportRecord['kind'] =>
    REPORT_KINDS.includes(kind as ReportRecord['kind'])
  );
}

function hasInvalidReportKinds(kinds: string[] | null): boolean {
  if (!kinds) {
    return false;
  }

  return kinds.some((kind) => !REPORT_KINDS.includes(kind as ReportRecord['kind']));
}

function getFilteredReportRecords(
  records: ReportRecord[],
  {
    search,
    kinds,
    sort
  }: {
    search: string;
    kinds: ReportRecord['kind'][];
    sort: Array<{ id: string; desc: boolean }>;
  }
) {
  let result = records.slice(0, REPORT_TABLE_PAGE_SIZE * REPORT_TABLE_MAX_PAGES);
  const normalizedSearch = search.toLowerCase();

  if (normalizedSearch) {
    result = result.filter((record) =>
      [record.title, record.subtitle, record.status, record.kind].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      )
    );
  }

  if (kinds.length > 0) {
    result = result.filter((record) => kinds.includes(record.kind));
  }

  if (sort.length > 0) {
    const { id, desc } = sort[0];
    result.sort((first, second) =>
      compareSortValues(getReportSortValue(first, id), getReportSortValue(second, id), desc)
    );
  }

  return result;
}

function getReportPageCount(recordCount: number) {
  return Math.max(
    1,
    Math.min(REPORT_TABLE_MAX_PAGES, Math.ceil(recordCount / REPORT_TABLE_PAGE_SIZE))
  );
}

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(page, 1), pageCount);
}
