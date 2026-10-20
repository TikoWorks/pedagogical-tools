import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: ReactNode;
};

export default function Button({
                                 className = '',
                                 children,
                                 type = 'button',
                                 ...props
                               }: ButtonProps) {
  return (
      <button
          type={type}
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
          {...props}
      >
        {children}
      </button>
  );
}
