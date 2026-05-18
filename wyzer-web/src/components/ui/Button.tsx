import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'outline' | 'ghost' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
 variant?: Variant;
 size?: Size;
 loading?: boolean;
 leftIcon?: React.ReactNode;
 rightIcon?: React.ReactNode;
 className?: string;
 children?: React.ReactNode;
}

type ButtonAsButton = ButtonBaseProps &
 Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
  as?: 'button';
  href?: never;
  to?: never;
 };

type ButtonAsAnchor = ButtonBaseProps &
 Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
  as: 'a';
  href: string;
  to?: never;
 };

type ButtonAsLink = ButtonBaseProps & {
 as: 'link';
 to: string;
 href?: never;
};

type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
 primary:
  'bg-brand text-white font-semibold shadow-brand hover:bg-brand-dim hover:shadow-brand-lg active:scale-[0.98]',
 outline:
  'border border-line hover:border-brand/40 text-ink-secondary hover:text-ink-primary',
 ghost: 'text-ink-secondary hover:text-ink-primary hover:bg-surface-raised',
 subtle:
  'bg-surface-raised border border-line text-ink-primary hover:bg-surface-hover',
};

const sizeClasses: Record<Size, string> = {
 sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
 md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
 lg: 'px-7 py-3.5 text-base rounded-xl gap-2',
};

const baseClasses =
 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none';

export const Button = forwardRef<
 HTMLButtonElement | HTMLAnchorElement,
 ButtonProps
>(
 (
  {
   variant = 'primary',
   size = 'md',
   loading = false,
   leftIcon,
   rightIcon,
   className = '',
   children,
   ...rest
  },
  _ref,
 ) => {
  const classes = [
   baseClasses,
   variantClasses[variant],
   sizeClasses[size],
   className,
  ].join(' ');
  const content = (
   <>
    {loading ? (
     <span className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
    ) : (
     leftIcon
    )}
    {children}
    {!loading && rightIcon}
   </>
  );

  if (rest.as === 'a') {
   const { as: _as, ...anchorRest } = rest as ButtonAsAnchor;
   return (
    <a className={classes} {...anchorRest}>
     {content}
    </a>
   );
  }

  if (rest.as === 'link') {
   const { as: _as, to, ...linkRest } = rest as ButtonAsLink;
   return (
    <Link to={to} className={classes} {...(linkRest as object)}>
     {content}
    </Link>
   );
  }

  const { as: _as, ...buttonRest } = rest as ButtonAsButton;
  return (
   <button className={classes} disabled={loading} {...buttonRest}>
    {content}
   </button>
  );
 },
);

Button.displayName = 'Button';
