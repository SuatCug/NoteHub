const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// ?page=2&limit=20 gibi query parametrelerinden güvenli sayfalama değerleri üretir.
const parsePagination = (query: Record<string, unknown>) => {
  const page = Math.max(parseInt(String(query.page), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(query.limit), 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};

export type PaginationParams = ReturnType<typeof parsePagination>;

const buildPagination = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export { parsePagination, buildPagination };
