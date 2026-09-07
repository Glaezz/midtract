import { type ReactNode, isValidElement, cloneElement } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const BASE_INPUT =
  'w-full rounded-control border bg-surface px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
const NORMAL = 'border-slate-300 focus:border-brand-500 focus:ring-brand-600/25';
const INVALID = 'border-danger-400 focus:border-danger-500 focus:ring-danger-600/25';

export function TextInput({
  invalid = false,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={`${BASE_INPUT} ${invalid ? INVALID : NORMAL} ${className}`} aria-invalid={invalid || undefined} {...props} />;
}

export function TextArea({
  invalid = false,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={`${BASE_INPUT} ${invalid ? INVALID : NORMAL} ${className}`} aria-invalid={invalid || undefined} {...props} />;
}

export function Field({
  label,
  htmlFor,
  helper,
  error,
  optional = false,
  prefix,
  children,
}: {
  label?: string;
  htmlFor?: string;
  helper?: string;
  error?: string | null;
  optional?: boolean;
  prefix?: string;
  children: ReactNode;
}) {
  const helperId = htmlFor ? `${htmlFor}-helper` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  const describedById = error ? errorId : helper ? helperId : undefined;

  function injectDescribedBy(child: ReactNode): ReactNode {
    if (!describedById || !isValidElement(child)) return child;
    return cloneElement(child as React.ReactElement<{ 'aria-describedby'?: string }>, {
      'aria-describedby': describedById,
    });
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
          {optional && <span className="ml-1 font-normal text-slate-400">(opsional)</span>}
        </label>
      )}
      {prefix ? (
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 select-none">
            {prefix}
          </span>
          {injectDescribedBy(children)}
        </div>
      ) : (
        injectDescribedBy(children)
      )}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-danger-600" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-xs text-slate-500">{helper}</p>
      ) : null}
    </div>
  );
}