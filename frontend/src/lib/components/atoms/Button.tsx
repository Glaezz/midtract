import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from '$lib/components/atoms/Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'bg-surface text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50',
  outline:
    'bg-transparent text-brand-700 ring-1 ring-inset ring-brand-600/40 hover:bg-brand-50 active:bg-brand-100 disabled:opacity-50',
  danger:
    'bg-danger-600 text-white shadow-sm shadow-danger-600/20 hover:bg-danger-700 active:bg-danger-800 disabled:bg-danger-300',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 disabled:opacity-50',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed motion-safe:active:translate-y-px ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 'xs' : 'sm'} className="text-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}