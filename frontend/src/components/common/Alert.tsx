import type { ReactNode } from 'react';

const VARIANTS = {
  error: 'text-rose-600 bg-rose-50 border-rose-100',
  success: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  info: 'text-navy-700 bg-navy-50 border-navy-100',
};

export type AlertVariant = keyof typeof VARIANTS;

interface AlertProps {
  variant?: AlertVariant;
  children?: ReactNode;
  className?: string;
}

export default function Alert({ variant = 'error', children, className = '' }: AlertProps) {
  if (!children) return null;
  return (
    <p role={variant === 'error' ? 'alert' : 'status'} className={`text-sm border rounded-lg px-3 py-2 ${VARIANTS[variant]} ${className}`}>
      {children}
    </p>
  );
}
