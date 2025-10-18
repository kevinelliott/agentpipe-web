import React from 'react';

type SkeletonVariant = 'text' | 'heading' | 'avatar' | 'card' | 'message';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  width?: string;
}

export function Skeleton({
  variant = 'text',
  className = '',
  width,
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-muted via-accent to-muted bg-[length:200%_100%] rounded animate-shimmer';

  const variantClasses: Record<SkeletonVariant, string> = {
    text: 'h-3.5 mb-2 last:w-[60%]',
    heading: 'h-6 mb-3 w-[40%]',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-40',
    message: 'p-4 rounded-lg',
  };

  const widthStyle = width ? { width } : undefined;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
      style={widthStyle}
      aria-label="Loading..."
    />
  );
}

export function SkeletonText({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="text" className={className} />
      ))}
    </>
  );
}

export function ConversationCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="avatar" />
        <div className="flex-1">
          <Skeleton variant="heading" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText count={2} />
    </div>
  );
}

export function MessageBubbleSkeleton() {
  return (
    <div className="p-4 rounded-lg bg-muted mb-3">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="avatar" className="w-6 h-6" />
        <Skeleton variant="text" width="100px" />
      </div>
      <SkeletonText count={3} />
    </div>
  );
}
