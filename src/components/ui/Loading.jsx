import { cn } from '../../lib/utils';

// Simple spinner
export function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-primary-600',
        sizes[size],
        className
      )}
    />
  );
}

// Full page loading
export function PageLoading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-gray-600 font-medium">กำลังโหลด...</p>
      </div>
    </div>
  );
}

// Section loading
export function SectionLoading({ text = 'กำลังโหลด...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500">{text}</p>
    </div>
  );
}

// Button loading state
export function ButtonLoading({ text = 'กำลังดำเนินการ...' }) {
  return (
    <span className="flex items-center gap-2">
      <Spinner size="sm" className="border-white border-t-white/30" />
      {text}
    </span>
  );
}

// Skeleton loaders
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
    />
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="card p-4">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3 mt-2" />
      </div>
    </div>
  );
}

// Product grid skeleton
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default Spinner;
