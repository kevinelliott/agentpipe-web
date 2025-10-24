'use client';

import React from 'react';

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode; // Right-side actions (search, buttons)
  className?: string;
}

export function SectionHeader({
  icon,
  title,
  children,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-foreground">{icon}</div>}
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
