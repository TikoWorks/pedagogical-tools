import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

export default function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      className="flex h-12 w-56 items-center justify-center gap-2 rounded-full bg-magenta text-[1.5rem] font-bold text-white 2xl:h-19 2xl:w-85 2xl:text-[2.25rem]"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
