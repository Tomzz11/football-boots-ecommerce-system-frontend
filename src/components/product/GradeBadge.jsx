import { cn } from '../../lib/utils';

const gradeStyles = {
  Elite: 'bg-amber-100 text-amber-800 border-amber-300',
  Pro: 'bg-purple-100 text-purple-800 border-purple-300',
  Academy: 'bg-blue-100 text-blue-800 border-blue-300',
  Club: 'bg-green-100 text-green-800 border-green-300',
};

export default function GradeBadge({ grade, size = 'sm' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-block font-semibold rounded-full border',
        gradeStyles[grade] || 'bg-gray-100 text-gray-800 border-gray-300',
        sizeClasses[size]
      )}
    >
      {grade}
    </span>
  );
}
