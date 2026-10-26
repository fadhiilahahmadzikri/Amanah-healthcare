import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString,
  gender: parseAsString,
  category: parseAsString,
  categoryId: parseAsString,
  role: parseAsString,
  status: parseAsString,
  poli: parseAsString,
  session: parseAsString,
  poliklinikId: parseAsString,
  doctorId: parseAsString,
  search: parseAsString,
  sort: parseAsString,
  date: parseAsString,
  month: parseAsString
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
