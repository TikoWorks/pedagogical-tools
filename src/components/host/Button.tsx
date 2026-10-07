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
      className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl text-[1.25rem] font-bold text-white 2xl:h-16 2xl:gap-4 2xl:text-[1.75rem] ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
