import type { ReactNode } from 'react';

type ButtonProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
};

export default function Button({
  className = '',
  children,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex h-16 items-center justify-center gap-4 rounded-2xl font-bold text-white text-[1.75rem] ${className} cursor-pointer`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
