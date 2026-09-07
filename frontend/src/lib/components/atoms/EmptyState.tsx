import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-slate-300 bg-surface/60 px-6 py-14 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}