import type { ReactNode } from 'react';

type ButtonProps = {
  className?: string;
  children: ReactNode;
  onClick: () => void;
};

export default function Button({
  className = '',
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`flex h-16 items-center justify-center gap-4 rounded-2xl font-bold text-white text-[1.75rem] ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
