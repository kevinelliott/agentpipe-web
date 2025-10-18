import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  elevated?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  interactive = false,
  elevated = false,
  onClick,
}: CardProps) {
  const baseClasses = 'bg-card border border-border rounded-lg p-6 transition-all duration-base';
  const shadowClasses = elevated ? 'shadow-md' : 'shadow-sm';
  const interactiveClasses = interactive
    ? 'cursor-pointer hover:border-strong hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.995]'
    : '';

  const Component = onClick ? 'button' : 'div';
  const buttonProps = onClick ? { onClick, type: 'button' as const } : {};

  return (
    <Component
      className={`${baseClasses} ${shadowClasses} ${interactiveClasses} ${className}`.trim()}
      {...buttonProps}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 pb-4 border-b border-border ${className}`.trim()}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold leading-tight mb-1 ${className}`.trim()}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground leading-relaxed ${className}`.trim()}>
      {children}
    </p>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-border flex gap-3 items-center ${className}`.trim()}>
      {children}
    </div>
  );
}
