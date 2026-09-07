import type { HTMLAttributes } from 'react';

type Tone = 'default' | 'tint';

export function Card({
  className = '',
  tone = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  const toneClass =
    tone === 'tint' ? 'border-brand-100 bg-brand-50/50 shadow-none' : 'border-slate-200/80 bg-surface shadow-card';
  return (
    <div className={`rounded-card ${toneClass} p-5 ${className}`} {...props} />
  );
}