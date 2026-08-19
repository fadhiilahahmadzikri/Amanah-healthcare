'use client';

import { create } from 'zustand';

import type { CatalogCartItem, CatalogProduct } from '../api/types';

type CatalogCartStore = {
  items: CatalogCartItem[];
  addProduct: (product: CatalogProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
};

export const useCatalogCartStore = create<CatalogCartStore>((set) => ({
  items: [],
  addProduct: (product, quantity = 1) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.productId === product.id);

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
              : item
          )
        };
      }

      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity
          }
        ]
      };
    }),
  setQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(quantity, 0), 99) }
            : item
        )
        .filter((item) => item.quantity > 0)
    })),
  removeProduct: (productId) =>
    set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
  clearCart: () => set({ items: [] })
}));
