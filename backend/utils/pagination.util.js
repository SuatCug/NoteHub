const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// ?page=2&limit=20 gibi query parametrelerinden güvenli sayfalama değerleri üretir.
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

module.exports = { parsePagination, buildPagination };
