import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
      <button
        type="button"
        className="btn-secondary px-3 py-2"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span className="text-sm text-gray-500">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="btn-secondary px-3 py-2"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next <ChevronRight size={16} />
      </button>
    </nav>
  );
}
