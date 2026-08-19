import { mockDb, delay, StockMovement } from '@/constants/mock-db';
import { v4 as uuidv4 } from 'uuid';
import { GetStockFilters, StockOperationPayload } from './types';

export async function getStockProducts(filters?: GetStockFilters) {
  await delay(300);
  let products = [...mockDb.products];

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
    );
  }

  if (filters?.categoryId) {
    products = products.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters?.status) {
    if (filters.status === 'OUT_OF_STOCK') {
      products = products.filter((p) => p.currentStock <= 0);
    } else if (filters.status === 'LOW_STOCK') {
      products = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock);
    }
  }

  return products;
}

export async function addStockMovement(
  type: 'IN' | 'OUT' | 'ADJUSTMENT',
  payload: StockOperationPayload
) {
  await delay(500);

  const product = mockDb.products.find((p) => p.id === payload.productId);
  if (!product) throw new Error('Product not found');

  const previousStock = product.currentStock;
  let newStock = previousStock;

  if (type === 'IN') {
    newStock = previousStock + payload.quantity;
  } else if (type === 'OUT') {
    if (previousStock < payload.quantity) throw new Error('Insufficient stock');
    newStock = previousStock - payload.quantity;
  } else if (type === 'ADJUSTMENT') {
    newStock = payload.quantity;
  }

  product.currentStock = newStock;

  const diff = Math.abs(newStock - previousStock);

  const movement: StockMovement = {
    id: uuidv4(),
    productId: product.id,
    type,
    quantity: type === 'ADJUSTMENT' ? diff : payload.quantity,
    previousStock,
    newStock,
    notes: payload.notes,
    createdAt: new Date().toISOString(),
    createdBy: 'System'
  };

  mockDb.stockMovements.push(movement);

  return movement;
}

export async function processStockIn(payload: StockOperationPayload) {
  return addStockMovement('IN', payload);
}

export async function processStockOut(payload: StockOperationPayload) {
  return addStockMovement('OUT', payload);
}

export async function processStockAdjustment(payload: StockOperationPayload) {
  return addStockMovement('ADJUSTMENT', payload);
}
