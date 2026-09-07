import type { ReactNode } from 'react';

type Width = 'narrow' | 'default' | 'wide';

const WIDTH_CLASSES: Record<Width, string> = {
  narrow: 'max-w-md',
  default: 'max-w-2xl',
  wide: 'max-w-5xl',
};

export function Container({
  width = 'default',
  className = '',
  id,
  children,
}: {
  width?: Width;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className={`mx-auto w-full px-5 sm:px-8 ${WIDTH_CLASSES[width]} ${className}`}>
      {children}
    </div>
  );
}