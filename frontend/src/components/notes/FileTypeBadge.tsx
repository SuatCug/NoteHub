import { FILE_TYPES } from '@/lib/constants';
import type { FileType } from '@/types/api';

export default function FileTypeBadge({ type, className = '' }: { type: FileType; className?: string }) {
  const info = FILE_TYPES[type] ?? FILE_TYPES.pdf;
  const Icon = info.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${info.badge} ${className}`}
    >
      <Icon size={13} />
      {info.label}
    </span>
  );
}
