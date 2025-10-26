import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  isIcon?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isIcon = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md font-medium leading-none transition-all duration-fast cursor-pointer border outline-none font-sans whitespace-nowrap select-none';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 border-transparent',
    secondary: 'bg-muted text-foreground border-border hover:bg-accent hover:border-strong',
    ghost: 'bg-transparent text-foreground hover:bg-muted border-transparent',
    outline: 'bg-transparent text-foreground border-border hover:bg-accent hover:border-strong',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-red-600 border-transparent',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    // Touch targets: mobile should be 44x44px minimum (WCAG guideline)
    // xs: small inline buttons (e.g., close icons)
    xs: 'min-h-[2rem] min-w-[2rem] md:min-h-[1.75rem] md:min-w-[1.75rem] px-2 text-xs',
    // sm: secondary buttons (44px on mobile, 36px on desktop)
    sm: 'min-h-[2.75rem] min-w-[2.75rem] md:min-h-[2.25rem] md:min-w-[2.25rem] px-3 text-xs',
    // md: primary buttons (44px+ on all screens)
    md: 'min-h-[2.75rem] min-w-[2.75rem] md:min-h-[2.5rem] md:min-w-[2.5rem] px-4 text-sm',
    // lg: prominent buttons (56px on mobile, 48px on desktop)
    lg: 'min-h-[3.5rem] min-w-[3.5rem] md:min-h-[3rem] md:min-w-[3rem] px-6 text-base',
  };

  const iconClasses = isIcon ? 'p-0 aspect-square' : '';

  const focusClasses = 'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2';

  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed active:not(:disabled):scale-[0.98]';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${iconClasses} ${focusClasses} ${disabledClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
