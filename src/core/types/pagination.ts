export interface Page<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface Cursor<T> {
  readonly items: readonly T[];
  readonly nextCursor?: string;
  readonly hasMore: boolean;
}
