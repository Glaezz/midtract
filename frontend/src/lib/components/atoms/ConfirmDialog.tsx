import type { ReactNode } from 'react';
import { Modal } from '$lib/components/atoms/Modal';
import { Button } from '$lib/components/atoms/Button';

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  confirmVariant = 'primary',
  busy = false,
  onConfirm,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  children?: ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {description && <div className="text-sm leading-relaxed text-slate-600">{description}</div>}
      {children}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={busy} className="sm:w-auto w-full">
          Batal
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={busy} className="sm:w-auto w-full">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}