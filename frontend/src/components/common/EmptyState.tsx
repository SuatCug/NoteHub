import type { ReactNode } from 'react';
import { FileSearch, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  text?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
}

export default function EmptyState({ title = 'Nothing here yet', text, action, icon: Icon = FileSearch }: EmptyStateProps) {
  return (
    <div className="card px-6 py-14 text-center">
      <span className="mx-auto w-12 h-12 rounded-full bg-navy-50 text-navy-500 flex items-center justify-center">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      {text && <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
