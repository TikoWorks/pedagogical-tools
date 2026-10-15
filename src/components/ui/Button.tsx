import type { ReactNode } from 'react';

type ButtonProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export default function Button({
  className = '',
  children,
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex h-13 items-center justify-center
        gap-2 rounded-xl
        font-bold text-white
        cursor-pointer
        text-[1.25rem]
        2xl:h-16 2xl:gap-4
        2xl:rounded-2xl 2xl:text-[1.75rem]
        ${className}
      `}
    >
      {children}
    </button>
  );
}
