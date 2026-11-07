'use client';

import * as React from 'react';

export interface UseHistoryTableModalCrudOptions<T> {
  items: T[];
  onChange?: (updated: T[]) => void;
  createDefaultItem?: (nextOrder: number) => T;
}

export function useHistoryTableModalCrud<T>({
  items,
  onChange,
  createDefaultItem
}: UseHistoryTableModalCrudOptions<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [draftItem, setDraftItem] = React.useState<T | null>(null);

  const openAdd = React.useCallback(() => {
    const nextOrder = items.length + 1;
    const initial = createDefaultItem ? createDefaultItem(nextOrder) : ({} as T);
    setDraftItem(initial);
    setEditingIndex(null);
    setIsOpen(true);
  }, [items.length, createDefaultItem]);

  const openEdit = React.useCallback(
    (index: number) => {
      if (items[index]) {
        setDraftItem({ ...items[index] });
        setEditingIndex(index);
        setIsOpen(true);
      }
    },
    [items]
  );

  const close = React.useCallback(() => {
    setIsOpen(false);
    setDraftItem(null);
    setEditingIndex(null);
  }, []);

  const save = React.useCallback(
    (savedItem: T) => {
      if (!onChange) return;
      if (editingIndex === null) {
        onChange([...items, savedItem]);
      } else {
        const next = [...items];
        next[editingIndex] = savedItem;
        onChange(next);
      }
      close();
    },
    [onChange, editingIndex, items, close]
  );

  const remove = React.useCallback(
    (index: number) => {
      if (!onChange) return;
      const next = items
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...(item as any), orderNumber: idx + 1 }));
      onChange(next);
    },
    [onChange, items]
  );

  return {
    isOpen,
    isEditing: editingIndex !== null,
    editingIndex,
    draftItem,
    setDraftItem,
    openAdd,
    openEdit,
    close,
    save,
    remove
  };
}
