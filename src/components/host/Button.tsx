// Wrapper-komponentti välittää natiivin <button>-elementin propsit eteenpäin
// (esim. data-testid, aria-*, disabled, name, title ja onClick).
// Tämä tarvitaan, jotta komponentti pysyy yleiskäyttöisenä eikä testaus- tai
// saavutettavuusattribuutteja katoa matkalla DOM-elementtiin.

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
          className={`flex h-16 items-center justify-center gap-4 rounded-2xl font-bold text-white text-[1.75rem] ${className}`}
          {...props}>
        {children}
      </button>
  );
}
