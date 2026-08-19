import { queryOptions } from '@tanstack/react-query';
import { getInvoiceDocumentById } from './service';

export const invoiceKeys = {
  all: ['invoices'] as const,
  document: (id: string) => [...invoiceKeys.all, 'document', id] as const
};

export const invoiceDocumentQueryOptions = (id: string) =>
  queryOptions({
    queryKey: invoiceKeys.document(id),
    queryFn: () => getInvoiceDocumentById(id)
  });
