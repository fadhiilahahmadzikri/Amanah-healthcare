'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

type RecordIdentifier = string | number;

type NavigableRecord = {
  id: RecordIdentifier;
};

export function useRecordNavigation(basePath: string) {
  const router = useRouter();
  const normalizedBasePath = basePath.replace(/\/$/, '');

  return useCallback(
    (record: NavigableRecord | RecordIdentifier) => {
      const id = typeof record === 'object' ? record.id : record;
      router.push(`${normalizedBasePath}/${encodeURIComponent(String(id))}`);
    },
    [normalizedBasePath, router]
  );
}
