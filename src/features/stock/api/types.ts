export type GetStockFilters = {
  search?: string;
  categoryId?: string;
  status?: 'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK';
};

export type StockOperationPayload = {
  productId: string;
  quantity: number;
  notes: string;
};
