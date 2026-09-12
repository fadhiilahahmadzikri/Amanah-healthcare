'use client';

import type { ColumnFiltersState, FilterFn, SortingState } from '@tanstack/react-table';
import type { HealthcareReview } from '../types';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

export type RatingSortOption = 'default' | 'rating-asc' | 'rating-desc';
export type ResponseFilterOption = 'all' | 'responded' | 'unresponded';
export type PhotosFilterOption = 'all' | 'with-photos' | 'without-photos';

export function matchGlobalQuery(review: HealthcareReview, filterValue: string): boolean {
  if (!filterValue) {
    return true;
  }
  const query = filterValue.toLowerCase().trim();
  const name = (review.author?.name ?? '').toLowerCase();
  const text = (review.text ?? '').toLowerCase();
  const badge = (review.author?.badge ?? '').toLowerCase();

  return name.includes(query) || text.includes(query) || badge.includes(query);
}

export function matchResponseFilter(
  review: HealthcareReview,
  filterValue: ResponseFilterOption
): boolean {
  if (filterValue === 'all') {
    return true;
  }
  const hasResponse = Boolean(review.ownerResponse);
  return filterValue === 'responded' ? hasResponse : !hasResponse;
}

export function matchPhotosFilter(
  review: HealthcareReview,
  filterValue: PhotosFilterOption
): boolean {
  if (filterValue === 'all') {
    return true;
  }
  const hasPhotos = (review.photosCount ?? 0) > 0;
  return filterValue === 'with-photos' ? hasPhotos : !hasPhotos;
}

const columnHelper = createColumnHelper<HealthcareReview>();

const globalFilterFn: FilterFn<HealthcareReview> = (row, _columnId, filterValue: string) => {
  return matchGlobalQuery(row.original, filterValue);
};

const DEFAULT_PAGE_SIZE = 12;

export function useReviewsTable(
  reviews: HealthcareReview[],
  initialPageSize: number = DEFAULT_PAGE_SIZE
) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [visibleLimit, setVisibleLimit] = useState(initialPageSize);

  // State abstractions for clean UI consumption
  const [ratingSort, setRatingSortState] = useState<RatingSortOption>('default');
  const [responseFilter, setResponseFilterState] = useState<ResponseFilterOption>('all');
  const [photosFilter, setPhotosFilterState] = useState<PhotosFilterOption>('all');

  const columns = useMemo(
    () => [
      columnHelper.accessor('rating', {
        id: 'rating',
        header: 'Rating'
      }),
      columnHelper.accessor((row) => Boolean(row.ownerResponse), {
        id: 'ownerResponse',
        header: 'Tanggapan',
        filterFn: (row, _id, filterValue: ResponseFilterOption) => {
          return matchResponseFilter(row.original, filterValue);
        }
      }),
      columnHelper.accessor((row) => (row.photosCount ?? 0) > 0, {
        id: 'photos',
        header: 'Foto',
        filterFn: (row, _id, filterValue: PhotosFilterOption) => {
          return matchPhotosFilter(row.original, filterValue);
        }
      }),
      columnHelper.accessor((row) => row.author.name, {
        id: 'author',
        header: 'Penulis'
      }),
      columnHelper.accessor((row) => row.text ?? '', {
        id: 'text',
        header: 'Ulasan'
      })
    ],
    []
  );

  const table = useReactTable({
    data: reviews,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const handleGlobalFilterChange = (val: string) => {
    setGlobalFilter(val);
    setVisibleLimit(initialPageSize);
  };

  const setRatingSort = (option: RatingSortOption) => {
    setRatingSortState(option);
    setVisibleLimit(initialPageSize);
    if (option === 'rating-desc') {
      setSorting([{ id: 'rating', desc: true }]);
    } else if (option === 'rating-asc') {
      setSorting([{ id: 'rating', desc: false }]);
    } else {
      setSorting([]);
    }
  };

  const setResponseFilter = (option: ResponseFilterOption) => {
    setResponseFilterState(option);
    setVisibleLimit(initialPageSize);
    setColumnFilters((prev) => {
      const remaining = prev.filter((f) => f.id !== 'ownerResponse');
      if (option === 'all') {
        return remaining;
      }
      return [...remaining, { id: 'ownerResponse', value: option }];
    });
  };

  const setPhotosFilter = (option: PhotosFilterOption) => {
    setPhotosFilterState(option);
    setVisibleLimit(initialPageSize);
    setColumnFilters((prev) => {
      const remaining = prev.filter((f) => f.id !== 'photos');
      if (option === 'all') {
        return remaining;
      }
      return [...remaining, { id: 'photos', value: option }];
    });
  };

  const resetFilters = () => {
    setGlobalFilter('');
    setRatingSortState('default');
    setResponseFilterState('all');
    setPhotosFilterState('all');
    setSorting([]);
    setColumnFilters([]);
    setVisibleLimit(initialPageSize);
  };

  const loadMore = (step: number = initialPageSize) => {
    setVisibleLimit((prev) => prev + step);
  };

  const isFiltered = Boolean(
    globalFilter.trim() ||
    ratingSort !== 'default' ||
    responseFilter !== 'all' ||
    photosFilter !== 'all'
  );

  const rows = table.getRowModel().rows;
  const filteredReviews = useMemo(() => rows.map((r) => r.original), [rows]);
  const visibleReviews = useMemo(
    () => filteredReviews.slice(0, visibleLimit),
    [filteredReviews, visibleLimit]
  );
  const hasMore = visibleReviews.length < filteredReviews.length;

  return {
    table,
    reviews: visibleReviews,
    allFilteredReviews: filteredReviews,
    totalCount: reviews.length,
    filteredCount: rows.length,
    visibleCount: visibleReviews.length,
    hasMore,
    loadMore,
    isFiltered,
    searchQuery: globalFilter,
    setSearchQuery: handleGlobalFilterChange,
    ratingSort,
    setRatingSort,
    responseFilter,
    setResponseFilter,
    photosFilter,
    setPhotosFilter,
    resetFilters
  };
}
