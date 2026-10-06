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
      className={`flex h-16 items-center justify-center gap-2 rounded-xl text-[1.25rem] font-bold text-white 2xl:text-[2rem] ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
