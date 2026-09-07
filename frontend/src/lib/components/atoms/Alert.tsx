import type { ReactNode } from 'react';
import { CheckCircle, Info, WarningCircle, X, XCircle } from '@phosphor-icons/react';

type Tone = 'success' | 'danger' | 'warning' | 'info';

const TONE_STYLES: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  success: { box: 'border-success-200 bg-success-50', icon: 'text-success-700', Icon: CheckCircle },
  danger: { box: 'border-danger-200 bg-danger-50', icon: 'text-danger-700', Icon: XCircle },
  warning: { box: 'border-warning-200 bg-warning-50', icon: 'text-warning-700', Icon: WarningCircle },
  info: { box: 'border-info-200 bg-info-50', icon: 'text-info-700', Icon: Info },
};

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  onClose,
  className = '',
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  const { box, icon, Icon } = TONE_STYLES[tone];

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border p-4 ${box} ${className}`}
    >
      <Icon size={20} weight="duotone" className={`mt-0.5 shrink-0 ${icon}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
        {children && <div className="text-sm leading-relaxed text-slate-700">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-600"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}