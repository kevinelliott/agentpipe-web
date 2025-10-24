'use client';

import React from 'react';

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode; // Right-side actions (search, buttons)
  className?: string;
  animated?: boolean; // Add pulse animation for live sections
}

export function SectionHeader({
  icon,
  title,
  children,
  className = '',
  animated = false,
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${className}`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 ${animated ? 'animate-glow-pulse' : ''}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 28 } as Record<string, unknown>)}
          </div>
        )}
        <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
