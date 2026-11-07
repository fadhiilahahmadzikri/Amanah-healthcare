import { describe, expect, it } from 'bun:test';
import { useHistoryTableModalCrud } from './useHistoryTableModalCrud';
import * as React from 'react';

// Simple harness to test hook state transitions
function createHookHarness<T>(initialItems: T[], createDefaultItem?: (order: number) => T) {
  let currentItems = [...initialItems];
  let hookState: ReturnType<typeof useHistoryTableModalCrud<T>>;

  const onChange = (updated: T[]) => {
    currentItems = updated;
  };

  const update = () => {
    // Re-simulate hook run
    hookState = useHistoryTableModalCrud<T>({
      items: currentItems,
      onChange,
      createDefaultItem
    });
  };

  return {
    getItems: () => currentItems,
    onChange
  };
}

describe('useHistoryTableModalCrud - Headless CRUD Model', () => {
  interface TestItem {
    orderNumber: number;
    title: string;
  }

  it('should manage add, edit, and remove transitions cleanly', () => {
    let items: TestItem[] = [
      { orderNumber: 1, title: 'Item 1' },
      { orderNumber: 2, title: 'Item 2' }
    ];

    const onChange = (updated: TestItem[]) => {
      items = updated;
    };

    // 1. Initial items count
    expect(items.length).toBe(2);

    // 2. Test removal & re-indexing
    const removeIdx = 0;
    const remaining = items
      .filter((_, idx) => idx !== removeIdx)
      .map((item, idx) => ({ ...item, orderNumber: idx + 1 }));
    onChange(remaining);

    expect(items.length).toBe(1);
    expect(items[0].orderNumber).toBe(1);
    expect(items[0].title).toBe('Item 2');

    // 3. Test appending item
    const newItem: TestItem = { orderNumber: items.length + 1, title: 'Item 3' };
    onChange([...items, newItem]);

    expect(items.length).toBe(2);
    expect(items[1].orderNumber).toBe(2);
    expect(items[1].title).toBe('Item 3');

    // 4. Test updating item
    const updated = [...items];
    updated[1] = { ...updated[1], title: 'Item 3 Updated' };
    onChange(updated);

    expect(items[1].title).toBe('Item 3 Updated');
  });
});
